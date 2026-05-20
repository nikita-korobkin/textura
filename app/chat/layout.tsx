'use client';

import { HomeLink } from '@/components/navbar/home-link';
import { Navbar } from '@/components/navbar/navbar';
import ThemeSwitcher from '@/components/navbar/theme-switcher';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar className="border-b border-separator bg-background lg:border-b-0 lg:bg-transparent">
        <Navbar.Start>
          <HomeLink />
        </Navbar.Start>
        <Navbar.End>
          <ThemeSwitcher />
        </Navbar.End>
      </Navbar>
      <main className="h-dvh">{children}</main>
    </>
  );
}
