'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Navbar } from '@/components/navbar/navbar';

export default function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Navbar.Button aria-label="Change theme">
            {resolvedTheme === 'dark' ? (
              <Moon aria-hidden="true" />
            ) : (
              <Sun aria-hidden="true" />
            )}
          </Navbar.Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
