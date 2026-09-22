import type { Metadata } from 'next';
import { Barlow, Space_Mono } from 'next/font/google';
import './globals.css';

const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-barlow' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' });

export const metadata: Metadata = {
  title: 'MaxBid',
  description: 'Auction bid analysis for Australian resellers.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${barlow.variable} ${spaceMono.variable}`}>
      <body className="bg-page font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
