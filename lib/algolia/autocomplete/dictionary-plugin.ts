import type { AutocompletePlugin } from '@algolia/autocomplete-core';
import {
  getAlgoliaResults,
  type SearchClient,
} from '@algolia/autocomplete-preset-algolia';

import type { HeadwordRecord } from '@/lib/algolia/headwords';

function createDictionaryPlugin({
  searchClient,
}: {
  searchClient: SearchClient;
}): AutocompletePlugin<HeadwordRecord> {
  return {
    name: 'textura.dictionaryPlugin',

    getSources({ query }) {
      if (query.trim() === '') {
        return [];
      }

      return [
        {
          sourceId: 'dictionary',

          getItemInputValue({ item }) {
            return item.headword;
          },

          getItemUrl({ item }) {
            return item.url;
          },

          getItems() {
            return getAlgoliaResults<HeadwordRecord>({
              searchClient,
              queries: [
                {
                  indexName: 'headwords',
                  params: {
                    query,
                    hitsPerPage: 5,
                  },
                },
              ],
            });
          },
        },
      ];
    },
  };
}

export { createDictionaryPlugin };
