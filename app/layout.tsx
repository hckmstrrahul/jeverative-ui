import type { Metadata } from 'next';
import './globals.css';
import './composition.css';
import './mint-tokens.css';
import './mint.css';
import './account.css';
import './tree.css';

export const metadata: Metadata = {
  title: 'Jeverative — UI playground',
  description: 'A live shadcn playground, composed by Jev.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
