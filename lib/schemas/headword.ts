import { z } from 'zod';
import { VarietySchema } from './variety';

export const HeadwordSchema = z
  .object({
    form: z
      .string()
      .trim()
      .regex(/[\p{L}\p{N}]/u),
    variety: VarietySchema,
  })
  .brand<'Headword'>();

export type Headword = z.infer<typeof HeadwordSchema>;

export const HeadwordSupportSchema = z.object({ valid: z.boolean() });
