import 'server-only';

import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { cacheLife } from 'next/cache';
import { findArticle } from './articles';
import { HeadwordSupportSchema, type Headword } from './schemas';

const client = new OpenAI();

export async function isHeadwordSupported(headword: Headword) {
  'use cache';
  cacheLife('max');

  if (await findArticle(headword)) return true;

  const response = await client.responses.parse({
    model: 'gpt-5.4-mini',
    prompt: {
      id: 'pmpt_69bd228450dc8195a8bf374707050ae00df4bc468296a4e2',
      variables: {
        form: headword.form,
        variety: headword.variety,
      },
    },
    reasoning: { effort: 'medium' },
    text: {
      format: zodTextFormat(HeadwordSupportSchema, 'headword_support'),
    },
  });

  return response.output_parsed?.valid === true;
}
