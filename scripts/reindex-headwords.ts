import '@/envConfig';
import { algoliasearch } from 'algoliasearch';
import { articleToHeadwordRecord } from '@/lib/algolia/headwords';
import { drizzleDb } from '@/lib/db';
import { articles } from '@/lib/db/schema';

const appId = process.env.ALGOLIA_APP_ID;
const writeApiKey = process.env.ALGOLIA_WRITE_API_KEY;
const indexName = 'headwords';

if (!appId) {
  throw new Error('Missing ALGOLIA_APP_ID environment variable.');
}

if (!writeApiKey) {
  throw new Error('Missing ALGOLIA_WRITE_API_KEY environment variable.');
}

const client = algoliasearch(appId, writeApiKey);

async function main() {
  const allArticles = await drizzleDb.select().from(articles);
  const records = allArticles.map((article) =>
    articleToHeadwordRecord(article.data),
  );

  const { taskID } = await client.setSettings({
    indexName,
    indexSettings: {
      searchableAttributes: ['headword'],
      attributesToRetrieve: [
        'headword',
        'variety',
        'url',
        'hasArticle',
        'display',
      ],
      attributesToHighlight: ['headword'],
    },
  });
  await client.waitForTask({ indexName, taskID });

  await client.replaceAllObjects({
    indexName,
    objects: records,
  });

  console.log(
    `Reindexed ${records.length} headword records into ${indexName}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
