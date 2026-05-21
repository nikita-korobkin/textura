'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ChatStatus } from 'ai';
import { useLayoutEffect, useRef, useState, type SubmitEvent } from 'react';

import {
  Composer,
  ComposerAddon,
  ComposerInput,
  ComposerSubmit,
} from '@/components/composer';
import { dictionaryPath } from '@/lib/dictionary/routes';
import { HeadwordSchema } from '@/lib/schemas';

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function Omnibox() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ChatStatus>('ready');
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const shouldReset = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const hasQuery = query.trim() !== '';
  const isSubmitted = status === 'submitted';

  useLayoutEffect(() => {
    inputRef.current?.focus();

    return () => {
      abortRef.current?.abort();

      if (shouldReset.current) {
        shouldReset.current = false;
        setQuery('');
        setStatus('ready');
      }
    };
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = HeadwordSchema.safeParse({
      form: query,
      variety: 'en-US',
    });

    if (!parsed.success) {
      return;
    }

    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('submitted');

    try {
      const response = await fetch('/api/headwords/validate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });

      if (controller.signal.aborted || response.status === 422) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Headword validation failed with status ${response.status}`,
        );
      }

      const targetPath = dictionaryPath(parsed.data);

      if (pathname === targetPath) {
        setStatus('ready');
        return;
      }

      shouldReset.current = true;
      router.push(targetPath);
    } catch (error) {
      if (isAbortError(error)) {
        return;
      }

      throw error;
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }

      if (!shouldReset.current) {
        setStatus('ready');
      }
    }
  }

  return (
    <Composer onSubmit={handleSubmit}>
      <ComposerInput
        aria-label="Dictionary search"
        placeholder="Ask Textura..."
        ref={inputRef}
        value={query}
        onChange={(event) => {
          abortRef.current?.abort();
          setQuery(event.currentTarget.value);
        }}
      />
      <ComposerAddon>
        <ComposerSubmit
          disabled={!hasQuery || isSubmitted}
          status={status}
        />
      </ComposerAddon>
    </Composer>
  );
}

export { Omnibox };
