'use client';

import {
  createAutocomplete,
  type AutocompleteApi,
  type AutocompleteState,
} from '@algolia/autocomplete-core';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import {
  createContext,
  use,
  useLayoutEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
  type ComponentProps,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';
import { SearchIcon } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
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

type SearchBoxStatus = 'idle' | 'validating';

type SearchBoxContextValue = {
  autocomplete: Autocomplete;
  autocompleteState: AutocompleteState<HeadwordRecord>;
  inputRef: RefObject<HTMLInputElement | null>;
  isValidating: boolean;
};

const initialAutocompleteState: AutocompleteState<HeadwordRecord> = {
  activeItemId: null,
  collections: [],
  completion: null,
  context: {},
  isOpen: false,
  query: '',
  status: 'idle',
};

const SearchBoxContext = createContext<SearchBoxContextValue | null>(null);

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError';
}

function useSearchBox() {
  const context = use(SearchBoxContext);

  if (!context) {
    throw new Error('useSearchBox must be used within SearchBox.');
  }

  return context;
}

function useAutocomplete() {
  const router = useRouter();

  const abortRef = useRef<AbortController | null>(null);
  const shouldReset = useRef(false);

  const [status, setStatus] = useState<SearchBoxStatus>('idle');
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
    setStatus('validating');

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
        setStatus('idle');
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
        setStatus('idle');
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

function SearchBoxInput() {
  const { autocomplete, autocompleteState, inputRef, isValidating } =
    useSearchBox();

  const hasQuery = autocompleteState.query.trim() !== '';

  return (
    <form
      className="flex w-full flex-col gap-2"
      {...autocomplete.getFormProps({
        inputElement: null,
      })}
    >
      <InputGroup className="h-14 rounded-2xl bg-card shadow-xs ring-border *:data-[slot=input-group-control]:pr-3 *:data-[slot=input-group-control]:pl-4">
        <InputGroupInput
          {...autocomplete.getInputProps({
            inputElement: null,
            type: 'text',
            'aria-label': 'Dictionary search',
            placeholder: 'Search Textura...',
          })}
          ref={inputRef}
          autoComplete="off"
          spellCheck={false}
        />

        <InputGroupAddon align="inline-end" className="pr-2">
          <InputGroupButton
            type="submit"
            variant="default"
            size="icon-lg"
            className="rounded-lg"
            disabled={!hasQuery || isValidating}
          >
            {isValidating ? <Spinner /> : <SearchIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
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

type SearchBoxItemProps = ComponentProps<'li'> & {
  item: HeadwordRecord;
};

function SearchBoxItem({ item, className, ...props }: SearchBoxItemProps) {
  return (
    <li
      data-slot="searchbox-item"
      className={cn(
        'rounded-lg px-3 py-2 text-sm select-none',
        'aria-selected:bg-accent',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span>{item.headword}</span>
        {item.display.pronunciation && (
          <span className="text-muted-foreground">
            {item.display.pronunciation}
          </span>
        )}
      </div>

      {item.display.meaning && (
        <div className="truncate text-sm text-muted-foreground">
          {item.display.meaning}
        </div>
      )}
    </li>
  );
}

function SearchBox() {
  const { autocomplete, autocompleteState, status } = useAutocomplete();

  const inputRef = useRef<HTMLInputElement>(null);

  const isValidating = status === 'validating';

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SearchBoxContext.Provider
      value={{
        autocomplete,
        autocompleteState,
        inputRef,
        isValidating,
      }}
    >
      <div {...autocomplete.getRootProps({ className: 'w-full' })}>
        <SearchBoxInput />

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
                      item={item}
                      {...autocomplete.getItemProps({
                        item,
                        source,
                      })}
                    />
                  ))}
                </SearchBoxList>
              ) : null,
            )}
          </SearchBoxPanel>
        )}
      </div>
    </SearchBoxContext.Provider>
  );
}

export { SearchBox };
