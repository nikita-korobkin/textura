import type { Route } from 'next';
import { slugToVariety, type Headword } from '@/lib/schemas';

export function dictionaryPath(headword: Headword): Route {
  return `/dictionary/${slugToVariety.encode(headword.variety)}/${encodeURIComponent(headword.form)}` as Route;
}
