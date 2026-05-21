'use client';

import { Navbar } from '@/components/navbar/navbar';
import ThemeSwitcher from '@/components/navbar/theme-switcher';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar>
        <Navbar.End>
          <ThemeSwitcher />
        </Navbar.End>
      </Navbar>
      <main className="flex h-dvh items-start justify-center px-4 pt-[25vh]">
        {children}
      </main>
    </>
  );
}
