'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useHotkey, formatForDisplay } from '@tanstack/react-hotkeys';
import { TooltipRoot } from '@base-ui/react';
import { Search } from 'lucide-react';
import { Navbar, ThemeSwitcher } from '@/components/navbar/navbar';
import { NavbarButton } from '@/components/navbar/navbar-button';
import { Logo } from '@/components/logo';
import { SearchDialog, searchDialogHandle } from '@/components/search-dialog';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';

export default function DictionaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchDialogActionsRef = useRef<DialogPrimitive.Root.Actions>(null);
  const tooltipActionsRef = useRef<TooltipRoot.Actions>(null);
  const router = useRouter();

  useHotkey('Mod+Shift+O', () => router.push('/'));
  useHotkey('Mod+K', () => {
    setSearchOpen((open) => !open);
  });

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
                <Link
                  href="/"
                  className="ml-1 rounded-xs p-1"
                  onNavigate={() => tooltipActionsRef.current?.close()}
                />
              }
            >
              <Logo variant="nav" />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Go to Home <Kbd>{formatForDisplay('Mod+Shift+O')}</Kbd>
            </TooltipContent>
          </Tooltip>
        </Navbar.Start>
        <Navbar.End>
          <DialogPrimitive.Trigger
            handle={searchDialogHandle}
            render={
              <NavbarButton tooltip="Search">
                <Search />
              </NavbarButton>
            }
          />
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
