import { z } from 'zod';

import { dictionaryPath } from '@/lib/dictionary/routes';
import {
  ArticleSchema,
  HeadwordSchema,
  LexicalCategorySchema,
  TranscriptionSchema,
  VarietySchema,
  type Article,
  type Headword,
} from '@/lib/schemas';

export const HeadwordDisplaySchema = z.object({
  partOfSpeech: LexicalCategorySchema.optional(),
  pronunciation: TranscriptionSchema.optional(),
  meaning: z.string().optional(),
});
export type HeadwordDisplay = z.infer<typeof HeadwordDisplaySchema>;

export const HeadwordRecordSchema = z.object({
  objectID: z.string(),
  headword: z.string(),
  variety: VarietySchema,
  url: z.string(),
  hasArticle: z.boolean(),
  display: HeadwordDisplaySchema,
});
export type HeadwordRecord = z.infer<typeof HeadwordRecordSchema>;

function headwordObjectID(headword: Headword) {
  return `${headword.variety}:${encodeURIComponent(headword.form)}`;
}

export function getArticleDisplay(
  article: Article,
): HeadwordDisplay | undefined {
  const lexeme = article.etymons[0]?.lexemes[0];
  const sense = lexeme?.senses[0];

  if (!lexeme && !sense) return undefined;

  return {
    partOfSpeech: lexeme?.lexicalCategory,
    pronunciation: lexeme?.transcription,
    meaning: sense?.definition,
  };
}

export function articleToHeadwordRecord(article: Article): HeadwordRecord {
  const parsedArticle = ArticleSchema.parse(article);
  const headword = HeadwordSchema.parse({
    form: parsedArticle.headword,
    variety: parsedArticle.variety,
  });

  return HeadwordRecordSchema.parse({
    objectID: headwordObjectID(headword),
    headword: headword.form,
    variety: headword.variety,
    url: dictionaryPath(headword),
    hasArticle: true,
    display: getArticleDisplay(parsedArticle),
  });
}
