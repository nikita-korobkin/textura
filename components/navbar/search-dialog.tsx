'use client';

import { createContext, use, useLayoutEffect, useState } from 'react';
import { type Hotkey } from '@tanstack/react-hotkeys';
import { Search } from 'lucide-react';
import { type Variants } from 'motion/react';
import { Navbar } from '@/components/navbar/navbar';
import { SearchBox } from '@/components/search-box';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipShortcut,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useHotkeyActions } from '@/lib/hotkey';

type SearchDialogContextValue = {
  state: {
    open: boolean;
  };
  actions: {
    setOpen: (open: boolean) => void;
  };
};

const SearchDialogContext = createContext<SearchDialogContextValue | null>(
  null,
);

const searchDialogVariants = {
  closed: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  open: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.16,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} satisfies Variants;

function useSearchDialog() {
  const context = use(SearchDialogContext);

  if (!context) {
    throw new Error('useSearchDialog must be used within SearchDialog.');
  }

  return context;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);

  useHotkeyActions([
    {
      name: 'Search',
      hotkey: 'Mod+K' as Hotkey,
      callback: () => setOpen((open) => !open),
    },
  ]);

  useLayoutEffect(() => {
    return () => setOpen(false);
  }, []);

  return (
    <SearchDialogContext.Provider
      value={{
        state: {
          open,
        },
        actions: {
          setOpen,
        },
      }}
    >
      <SearchDialogRoot />
    </SearchDialogContext.Provider>
  );
}

function SearchDialogRoot() {
  const {
    state: { open },
    actions: { setOpen },
  } = useSearchDialog();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <SearchDialogTrigger />
      <SearchDialogContent />
    </Dialog>
  );
}

function SearchDialogTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <DialogTrigger
            render={
              <Navbar.Button aria-label="Search">
                <Search />
              </Navbar.Button>
            }
          />
        }
      />
      <TooltipContent side="bottom">
        Search <TooltipShortcut hotkey={'Mod+K' as Hotkey} />
      </TooltipContent>
    </Tooltip>
  );
}

function SearchDialogContent() {
  const {
    actions: { setOpen },
  } = useSearchDialog();

  return (
    <DialogContent
      className="top-1/4 origin-bottom"
      variants={searchDialogVariants}
    >
      <SearchBox onValidSubmit={() => setOpen(false)} />
    </DialogContent>
  );
}
