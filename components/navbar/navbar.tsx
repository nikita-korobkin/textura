'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function Navbar({
  className,
  children,
  ...props
}: React.ComponentProps<'header'>) {
  return (
    <TooltipProvider>
      <header
        data-slot="navbar"
        className={cn(
          'fixed inset-x-0 top-0 z-10 grid h-14 grid-cols-[1fr_1fr] items-center px-2 *:gap-1',
          className,
        )}
        {...props}
      >
        {children}
      </header>
    </TooltipProvider>
  );
}

Navbar.Start = function NavbarStart({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="navbar-start"
      className={cn(
        'col-start-1 flex items-center justify-self-start',
        className,
      )}
      {...props}
    />
  );
};

Navbar.End = function NavbarEnd({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="navbar-end"
      className={cn(
        'col-start-2 flex items-center justify-self-end',
        className,
      )}
      {...props}
    />
  );
};

Navbar.Button = function NavbarButton({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'variant' | 'size'>) {
  return (
    <Button
      data-slot="navbar-button"
      variant="ghost"
      size="icon-lg"
      className={cn('rounded-full', className)}
      {...props}
    />
  );
};

Navbar.Link = function NavbarLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      data-slot="navbar-link"
      className={cn('rounded-xs p-1', className)}
      {...props}
    />
  );
};
