'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TooltipRoot } from '@base-ui/react';
import { type Hotkey, useHotkey } from '@tanstack/react-hotkeys';
import { Logo } from '@/components/logo';
import { Navbar } from '@/components/navbar/navbar';
import {
  Tooltip,
  TooltipContent,
  TooltipShortcut,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function HomeLink() {
  const router = useRouter();
  const tooltipActionsRef = useRef<TooltipRoot.Actions>(null);

  useHotkey('Mod+Shift+O' as Hotkey, () => router.push('/'), {
    meta: {
      name: 'Home',
    },
  });

  return (
    <Tooltip actionsRef={tooltipActionsRef}>
      <TooltipTrigger
        closeOnClick={false}
        render={
          <Navbar.Link
            href="/"
            aria-label="Home"
            className="ml-1"
            onNavigate={() => tooltipActionsRef.current?.close()}
          >
            <Logo variant="nav" />
          </Navbar.Link>
        }
      />
      <TooltipContent side="right" sideOffset={8}>
        Home <TooltipShortcut hotkey={'Mod+Shift+O' as Hotkey} />
      </TooltipContent>
    </Tooltip>
  );
}
