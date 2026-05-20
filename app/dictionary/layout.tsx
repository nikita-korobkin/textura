'use client';

import { Navbar } from '@/components/navbar/navbar';
import ThemeSwitcher from '@/components/navbar/theme-switcher';
import { HomeLink } from '@/components/navbar/home-link';

export default function DictionaryLayout({
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
      <main className="pt-24 pb-16">{children}</main>
    </>
  );
}
