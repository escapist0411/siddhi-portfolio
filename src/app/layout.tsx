import type { Metadata } from 'next';
import { Syne, Inter, Instrument_Serif } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
const display = Syne({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const title = 'Siddhi Bhogade | AI & DevOps Engineer';
const description = 'Portfolio of Siddhi Bhogade, an AI and DevOps engineer working across machine learning, full-stack development, and application deployment.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['Siddhi Bhogade', 'AI engineering', 'DevOps', 'machine learning', 'full-stack development'],
  authors: [{ name: 'Siddhi Bhogade' }],
  creator: 'Siddhi Bhogade',
  openGraph: { title, description, type: 'website', siteName: 'Siddhi Bhogade — Portfolio' },
  twitter: { card: 'summary', title, description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${serif.variable}`}><body>{children}</body></html>;
}
