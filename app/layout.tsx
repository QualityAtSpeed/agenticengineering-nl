import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'agenticengineering.nl',
  description: 'Agentic engineering trainings with Claude Code.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
