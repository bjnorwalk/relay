import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@fontsource-variable/geist';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Relay',
  description:
    'A real-time workspace for writing, reviewing, and evolving documents together.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
