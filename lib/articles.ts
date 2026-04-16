import 'server-only';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { cacheLife, cacheTag } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { ArticleSchema, type Headword } from './schemas';
import { drizzleDb } from './db';
import { articles } from './db/schema';

const client = new OpenAI();

export async function findArticle(headword: Headword) {
  const [existing] = await drizzleDb
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.headword, headword.form),
        eq(articles.variety, headword.variety),
      ),
    )
    .limit(1);

  return existing?.data ?? null;
}

export async function generateArticle(headword: Headword) {
  'use cache';
  cacheLife('max');
  cacheTag('articles');

  const existing = await findArticle(headword);
  if (existing) return existing;

  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    prompt: {
      id: 'pmpt_69a975f6d0b0819791769e9d5c95723a046b78f99e06fd36',
      variables: {
        headword: headword.form,
        variety: headword.variety,
      },
    },
    reasoning: { effort: 'medium' },
    text: {
      format: zodTextFormat(ArticleSchema, 'article'),
    },
  });

  const output = response.output_parsed;

  if (output) {
    await drizzleDb
      .insert(articles)
      .values({
        headword: headword.form,
        variety: headword.variety,
        data: output,
      })
      .onConflictDoNothing();
  }

  return output;
}
