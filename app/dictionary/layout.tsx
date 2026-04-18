'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { type Hotkey } from '@tanstack/react-hotkeys';
import { TooltipRoot } from '@base-ui/react';
import { Search } from 'lucide-react';
import { Navbar, ThemeSwitcher } from '@/components/navbar/navbar';
import { Logo } from '@/components/logo';
import { SearchDialog, searchDialogHandle } from '@/components/search-dialog';
import {
  Tooltip,
  TooltipTrigger,
  TooltipShortcut,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useHotkeyActions, type HotkeyAction } from '@/lib/hotkey';

export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchDialogActionsRef = useRef<DialogPrimitive.Root.Actions>(null);
  const tooltipActionsRef = useRef<TooltipRoot.Actions>(null);
  const router = useRouter();

  const home: HotkeyAction = {
    name: 'Home',
    hotkey: 'Mod+Shift+O' as Hotkey,
    callback: () => router.push('/'),
  };

  const search: HotkeyAction = {
    name: 'Search',
    hotkey: 'Mod+K' as Hotkey,
    callback: () => setSearchOpen((open) => !open),
  };

  useHotkeyActions([home, search]);

  useLayoutEffect(() => {
    const searchDialogActions = searchDialogActionsRef.current;

    return () => {
      searchDialogActions?.unmount();
      setSearchOpen(false);
    };
  }, []);

  return (
    <>
      <Navbar>
        <Navbar.Start>
          <Tooltip
            actionsRef={tooltipActionsRef}
            onOpenChange={(open, event) => {
              if (!open && event.reason === 'trigger-press') event.cancel();
            }}
          >
            <TooltipTrigger
              render={
                <Navbar.Link
                  href="/"
                  aria-label={home.name}
                  className="ml-1"
                  onNavigate={() => tooltipActionsRef.current?.close()}
                >
                  <Logo variant="nav" />
                </Navbar.Link>
              }
            />
            <TooltipContent side="right" sideOffset={8}>
              {home.name} <TooltipShortcut hotkey={home.hotkey} />
            </TooltipContent>
          </Tooltip>
        </Navbar.Start>
        <Navbar.End>
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogPrimitive.Trigger
                  handle={searchDialogHandle}
                  render={
                    <Navbar.Button aria-label={search.name}>
                      <Search />
                    </Navbar.Button>
                  }
                />
              }
            />
            <TooltipContent side="bottom">
              {search.name} <TooltipShortcut hotkey={search.hotkey} />
            </TooltipContent>
          </Tooltip>
          <ThemeSwitcher />
        </Navbar.End>
      </Navbar>
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        actionsRef={searchDialogActionsRef}
      />
      <main className="pt-24 pb-16">{children}</main>
    </>
  );
}
