import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { generateArticle } from '@/lib/articles';
import { Skeleton } from '@/components/ui/skeleton';
import { HeadwordSchema, slugToVariety } from '@/lib/schemas';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ headword: string; variety: string }>;
}): Promise<Metadata> {
  const { headword } = await params;

  return {
    title: decodeURIComponent(headword),
  };
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

async function ArticleContent({
  params,
}: {
  params: Promise<{ headword: string; variety: string }>;
}) {
  const { headword, variety } = await params;

  const parsedVariety = slugToVariety.safeParse(variety);
  if (!parsedVariety.success) notFound();

  const parsedHeadword = HeadwordSchema.safeParse({
    form: decodeURIComponent(headword),
    variety: parsedVariety.data,
  });
  if (!parsedHeadword.success) notFound();

  const article = await generateArticle(parsedHeadword.data);
  if (!article) notFound();

  const showSuperscript = article.etymons.length > 1;

  return (
    <div className="animate-in duration-200 fade-in">
      <h1 className="sr-only">{article.headword}</h1>
      {article.etymons.map((etymon, etymonIndex) => (
        <section key={etymonIndex} className={etymonIndex > 0 ? 'mt-12' : ''}>
          <h2 className="font-serif text-5xl font-semibold tracking-tight">
            {article.headword}
            {showSuperscript && (
              <sup className="text-subtle-foreground select-none">
                {etymonIndex + 1}
              </sup>
            )}
          </h2>
          <p className="mt-2 font-serif text-muted-foreground">
            {etymon.origin}
          </p>
          {etymon.lexemes?.map((lexeme, lexemeIndex) => (
            <div
              key={lexemeIndex}
              className={lexemeIndex === 0 ? 'mt-4' : 'mt-8'}
            >
              <h3 className="text-lg text-subtle-foreground">
                <span className="font-semibold select-none">
                  {lexeme.lexicalCategory}
                </span>
                <span className="ml-2 text-muted-foreground before:content-['/'] after:content-['/']">
                  {lexeme.pronunciation}
                </span>
              </h3>
              <ol className="mt-2 list-[bare-decimal] space-y-2 pl-[calc(1ch+0.5em)] marker:text-muted-foreground">
                {lexeme.senses.map((sense, senseIndex) => (
                  <li key={senseIndex} className="font-serif">
                    <span className="font-medium">
                      {sense.definition}
                      <span className="text-muted-foreground">:</span>
                    </span>
                    <span className="ml-1 text-muted-foreground italic">
                      {sense.example}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function ArticlePage({
  params,
}: {
  params: Promise<{ headword: string; variety: string }>;
}) {
  return (
    <article className="mx-auto max-w-2xl px-4">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleContent params={params} />
      </Suspense>
    </article>
  );
}
