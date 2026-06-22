'use client';

import {
  createAutocomplete,
  type AutocompleteApi,
  type AutocompleteState,
} from '@algolia/autocomplete-core';
import type { ChatStatus } from 'ai';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import {
  useLayoutEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';

import {
  Composer,
  ComposerAddon,
  ComposerInput,
  ComposerSubmit,
} from '@/components/composer';
import { createDictionaryPlugin } from '@/lib/algolia/autocomplete/dictionary-plugin';
import type { HeadwordRecord } from '@/lib/algolia/headwords';
import { searchClient } from '@/lib/algolia/search-client';
import { dictionaryPath } from '@/lib/dictionary/routes';
import { HeadwordSchema } from '@/lib/schemas';
import { cn } from '@/lib/utils';

type Autocomplete = AutocompleteApi<
  HeadwordRecord,
  BaseSyntheticEvent,
  ReactMouseEvent,
  ReactKeyboardEvent
>;

const initialAutocompleteState: AutocompleteState<HeadwordRecord> = {
  activeItemId: null,
  collections: [],
  completion: null,
  context: {},
  isOpen: false,
  query: '',
  status: 'idle',
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function useAutocomplete() {
  const router = useRouter();

  const abortRef = useRef<AbortController | null>(null);
  const shouldReset = useRef(false);

  const [status, setStatus] = useState<ChatStatus>('ready');
  const [autocompleteState, setAutocompleteState] = useState(
    initialAutocompleteState,
  );

  async function handleSubmit({
    state,
  }: {
    state: AutocompleteState<HeadwordRecord>;
  }) {
    const parsed = HeadwordSchema.safeParse({
      form: state.query,
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

      shouldReset.current = true;
      router.push(dictionaryPath(parsed.data) as Route);
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

  const [autocomplete] = useState<Autocomplete>(() =>
    createAutocomplete<
      HeadwordRecord,
      BaseSyntheticEvent,
      ReactMouseEvent,
      ReactKeyboardEvent
    >({
      id: 'searchbox',

      plugins: [createDictionaryPlugin({ searchClient })],

      onStateChange({ state, prevState }) {
        if (prevState.query !== state.query) {
          abortRef.current?.abort();
        }

        setAutocompleteState(state);
      },

      onSubmit(params) {
        void handleSubmit(params);
      },

      navigator: {
        navigate({ itemUrl }) {
          abortRef.current?.abort();
          shouldReset.current = true;
          router.push(itemUrl as Route);
        },
      },
    }),
  );

  useLayoutEffect(() => {
    return () => {
      abortRef.current?.abort();

      if (shouldReset.current) {
        shouldReset.current = false;
        setStatus('ready');
        autocomplete.setQuery('');
      }
    };
  }, [autocomplete]);

  return {
    autocomplete,
    autocompleteState,
    status,
  };
}

function SearchBoxPanel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="searchbox-panel"
      className={cn('mt-2', className)}
      {...props}
    />
  );
}

function SearchBoxList({ ...props }: ComponentProps<'ul'>) {
  return <ul data-slot="searchbox-list" {...props} />;
}

function SearchBoxItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="searchbox-item"
      className={cn(
        'rounded-lg px-3 py-2 text-sm select-none',
        'aria-selected:bg-accent',
        className,
      )}
      {...props}
    />
  );
}

function SearchBox() {
  const { autocomplete, autocompleteState, status } = useAutocomplete();

  const inputRef = useRef<HTMLInputElement>(null);

  const hasQuery = autocompleteState.query.trim() !== '';
  const isSubmitted = status === 'submitted';

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div {...autocomplete.getRootProps({ className: 'w-full' })}>
      <Composer
        {...autocomplete.getFormProps({
          inputElement: null,
        })}
      >
        <ComposerInput
          {...autocomplete.getInputProps({
            inputElement: null,
            type: 'text',
            'aria-label': 'Dictionary search',
            placeholder: 'Search Textura...',
          })}
          ref={inputRef}
        />

        <ComposerAddon>
          <ComposerSubmit disabled={!hasQuery || isSubmitted} status={status} />
        </ComposerAddon>
      </Composer>

      {autocompleteState.isOpen && (
        <SearchBoxPanel {...autocomplete.getPanelProps({})}>
          {autocompleteState.collections.map(({ source, items }) =>
            items.length > 0 ? (
              <SearchBoxList
                key={source.sourceId}
                {...autocomplete.getListProps({ source })}
              >
                {items.map((item) => (
                  <SearchBoxItem
                    key={`${source.sourceId}:${item.objectID}`}
                    {...autocomplete.getItemProps({
                      item,
                      source,
                    })}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.headword}</span>
                      <span className="text-muted-foreground">
                        {item.display.pronunciation}
                      </span>
                    </div>

                    {item.display?.meaning && (
                      <div className="truncate text-sm text-muted-foreground">
                        {item.display.meaning}
                      </div>
                    )}
                  </SearchBoxItem>
                ))}
              </SearchBoxList>
            ) : null,
          )}
        </SearchBoxPanel>
      )}
    </div>
  );
}

export { SearchBox };
