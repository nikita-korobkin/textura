'use client';

import {
  createContext,
  useEffect,
  use,
  useCallback,
  useLayoutEffect,
  useReducer,
  useRef,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Field } from '@base-ui/react/field';
import { Search, X } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@/components/ui/input-group';
import { dictionaryPath } from '@/lib/dictionary/routes';
import { HeadwordSchema } from '@/lib/schemas';

type SearchBoxState = {
  query: string;
  status: 'idle' | 'validating' | 'invalid' | 'navigating';
  invalidFor: string | null;
};

type SearchBoxContextValue = {
  state: {
    query: string;
    busy: boolean;
    invalid: boolean;
  };
  actions: {
    setQuery: (query: string) => void;
    submit: () => Promise<void>;
    reset: () => void;
  };
  meta: {
    inputRef: React.RefObject<HTMLInputElement | null>;
    groupRef: React.RefObject<HTMLDivElement | null>;
  };
};

type SearchBoxAction =
  | { type: 'queryChanged'; query: string }
  | { type: 'submitted' }
  | { type: 'validationFailed'; query: string }
  | { type: 'navigationStarted' }
  | { type: 'validationErrored' }
  | { type: 'reset' };

const initialSearchBoxState: SearchBoxState = {
  query: '',
  status: 'idle',
  invalidFor: null,
};

const SearchBoxContext = createContext<SearchBoxContextValue | null>(null);

function searchBoxReducer(
  state: SearchBoxState,
  action: SearchBoxAction,
): SearchBoxState {
  switch (action.type) {
    case 'queryChanged':
      return {
        query: action.query,
        status: 'idle',
        invalidFor: null,
      };

    case 'submitted':
      return {
        ...state,
        status: 'validating',
        invalidFor: null,
      };

    case 'validationFailed':
      return {
        ...state,
        status: 'invalid',
        invalidFor: action.query,
      };

    case 'navigationStarted':
      return {
        ...state,
        status: 'navigating',
      };

    case 'validationErrored':
      return {
        ...state,
        status: 'idle',
      };

    case 'reset':
      return initialSearchBoxState;
  }
}

function SearchBoxForm() {
  const {
    actions: { submit },
  } = useSearchBox();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    void submit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <SearchBoxField>
        <SearchBoxGroup>
          <SearchBoxInput />
          <SearchBoxAddon>
            <SearchBoxButton />
          </SearchBoxAddon>
        </SearchBoxGroup>

        <SearchBoxError />
      </SearchBoxField>
    </form>
  );
}

function SearchBoxProvider({
  children,
  onValidSubmit,
}: {
  children: ReactNode;
  onValidSubmit?: () => void;
}) {
  const [state, dispatch] = useReducer(searchBoxReducer, initialSearchBoxState);
  const pathname = usePathname();
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const busy = state.status === 'validating' || state.status === 'navigating';
  const invalid = state.invalidFor !== null;

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  const setQuery = useCallback((query: string) => {
    abortRef.current?.abort();
    dispatch({ type: 'queryChanged', query });
  }, []);

  useLayoutEffect(() => {
    return () => {
      abortRef.current?.abort();
      reset();
    };
  }, [reset]);

  async function submit() {
    const parsed = HeadwordSchema.safeParse({
      form: state.query,
      variety: 'en-US',
    });
    if (!parsed.success) {
      dispatch({ type: 'validationFailed', query: state.query });
      return;
    }
    const headword = parsed.data;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    dispatch({ type: 'submitted' });

    try {
      const response = await fetch('/api/headwords/validate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(headword),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (response.status === 422) {
        dispatch({ type: 'validationFailed', query: headword.form });
        return;
      }

      if (!response.ok) {
        throw new Error(`Validation failed with status ${response.status}`);
      }

      onValidSubmit?.();
      const targetPath = dictionaryPath(headword);

      if (pathname === targetPath) {
        inputRef.current?.blur();
        return;
      }

      dispatch({ type: 'navigationStarted' });
      router.push(targetPath);
    } catch (err) {
      if (controller.signal.aborted) return;
      dispatch({ type: 'validationErrored' });
      console.error(err);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }

  return (
    <SearchBoxContext.Provider
      value={{
        state: {
          query: state.query,
          busy,
          invalid,
        },
        actions: {
          setQuery,
          submit,
          reset,
        },
        meta: {
          inputRef,
          groupRef,
        },
      }}
    >
      {children}
    </SearchBoxContext.Provider>
  );
}

function useSearchBox() {
  const context = use(SearchBoxContext);
  if (!context) {
    throw new Error('useSearchBox must be used within SearchBox.');
  }

  return context;
}

function SearchBoxField({ children }: { children: ReactNode }) {
  const {
    state: { invalid },
  } = useSearchBox();

  return (
    <Field.Root name="query" invalid={invalid} className="flex flex-col gap-2">
      {children}
    </Field.Root>
  );
}

function SearchBoxGroup({ children }: { children: ReactNode }) {
  const {
    meta: { groupRef },
  } = useSearchBox();

  return (
    <InputGroup
      ref={groupRef}
      size="lg"
      className="border-0 bg-card shadow-searchbox in-data-[slot=dialog-content]:shadow-searchbox-dialog"
    >
      {children}
    </InputGroup>
  );
}

function SearchBoxError() {
  const {
    state: { invalid },
  } = useSearchBox();

  return (
    <Field.Error
      match={invalid}
      className="ml-1 inline-flex w-fit items-center gap-1 rounded-lg bg-popover py-1.5 pr-2.5 pl-1.5 text-xs font-normal text-popover-foreground shadow-toast transition-[opacity,translate,scale] duration-150 ease-out will-change-[opacity,translate,scale] data-ending-style:-translate-y-0.5 data-ending-style:scale-[0.99] data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:scale-[0.98] data-starting-style:opacity-0"
    >
      <X className="size-3 shrink-0 text-destructive" />
      This query looks invalid
    </Field.Error>
  );
}

function SearchBoxInput() {
  const {
    state: { query },
    actions: { setQuery },
    meta: { inputRef },
  } = useSearchBox();

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <InputGroupInput
      ref={inputRef}
      placeholder="Look up definitions…"
      aria-label="Search query"
      autoComplete="off"
      spellCheck={false}
      value={query}
      onChange={(event) => setQuery(event.currentTarget.value)}
    />
  );
}

function SearchBoxAddon({ children }: { children: ReactNode }) {
  return (
    <InputGroupAddon align="inline-end" size="lg">
      {children}
    </InputGroupAddon>
  );
}

function SearchBoxButton() {
  const {
    state: { query, invalid, busy },
  } = useSearchBox();

  return (
    <InputGroupButton
      type="submit"
      aria-label="Search"
      variant="default"
      size="icon-lg"
      disabled={query.trim() === '' || invalid || busy}
    >
      {busy ? <Spinner /> : <Search />}
    </InputGroupButton>
  );
}

type SearchBoxProps = {
  onValidSubmit?: () => void;
};

function SearchBox({ onValidSubmit }: SearchBoxProps) {
  return (
    <SearchBoxProvider onValidSubmit={onValidSubmit}>
      <SearchBoxForm />
    </SearchBoxProvider>
  );
}

export { SearchBox };
