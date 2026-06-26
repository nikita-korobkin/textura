'use client';

import {
  createAutocomplete,
  type AutocompleteApi,
  type AutocompleteState,
} from '@algolia/autocomplete-core';
import { SearchIcon } from 'lucide-react';
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

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { createDictionaryPlugin } from '@/lib/algolia/autocomplete/dictionary-plugin';
import type { HeadwordRecord } from '@/lib/algolia/headwords';
import { searchClient } from '@/lib/algolia/search-client';
import { cn } from '@/lib/utils';

type Autocomplete = AutocompleteApi<
  HeadwordRecord,
  BaseSyntheticEvent,
  ReactMouseEvent,
  ReactKeyboardEvent
>;

type SearchBoxContextValue = {
  autocomplete: Autocomplete;
  autocompleteState: AutocompleteState<HeadwordRecord>;
  inputRef: RefObject<HTMLInputElement | null>;
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

function useSearchBox() {
  const context = use(SearchBoxContext);

  if (!context) {
    throw new Error('useSearchBox must be used within SearchBox.');
  }

  return context;
}

function useAutocomplete() {
  const router = useRouter();

  const [autocompleteState, setAutocompleteState] = useState(
    initialAutocompleteState,
  );

  function handleSubmit({
    state,
  }: {
    state: AutocompleteState<HeadwordRecord>;
  }) {
    const query = state.query.trim();

    if (!query) return;

    router.push(`/dictionary/en-us/${encodeURIComponent(query)}` as Route);
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

      onStateChange({ state }) {
        setAutocompleteState(state);
      },

      onSubmit(params) {
        handleSubmit(params);
      },

      navigator: {
        navigate({ itemUrl }) {
          router.push(itemUrl as Route);
        },
      },
    }),
  );

  useLayoutEffect(() => {
    return () => {
      autocomplete.setQuery('');
    };
  }, [autocomplete]);

  return {
    autocomplete,
    autocompleteState,
  };
}

function SearchBoxInput() {
  const { autocomplete, autocompleteState, inputRef } = useSearchBox();

  const hasQuery = autocompleteState.query.trim() !== '';

  return (
    <form
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
            aria-label="Search"
            variant="default"
            size="icon-lg"
            className="rounded-lg"
            disabled={!hasQuery}
          >
            <SearchIcon />
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
  const { autocomplete, autocompleteState } = useAutocomplete();

  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <SearchBoxContext.Provider
      value={{
        autocomplete,
        autocompleteState,
        inputRef,
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
