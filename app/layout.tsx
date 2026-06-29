import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

import { ThemeProvider } from '@/components/theme-provider';

const inter = localFont({
  src: [
    {
      path: './fonts/inter/InterVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: './fonts/inter/InterVariable-Italic.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-inter',
  display: 'optional',
});

const sourceSerif = localFont({
  src: [
    {
      path: './fonts/source-serif/SourceSerif4Variable-Roman.ttf.woff2',
      weight: '200 900',
      style: 'normal',
    },
    {
      path: './fonts/source-serif/SourceSerif4Variable-Italic.ttf.woff2',
      weight: '200 900',
      style: 'italic',
    },
  ],
  variable: '--font-source-serif',
  display: 'block',
});

export const metadata: Metadata = {
  title: 'Textura',
  description: 'AI-powered dictionary application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceSerif.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
