import type { Metadata } from 'next';
import { Barlow, Space_Mono } from 'next/font/google';
import './globals.css';

const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-barlow' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' });

export const metadata: Metadata = {
  title: 'MaxBid · What should you pay at auction?',
  description: 'MaxBid estimates what each auction lot is worth, adds up every cost and tells you the most you should bid.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${barlow.variable} ${spaceMono.variable}`}>
      <body className="bg-page font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
