import type { Metadata } from 'next';
import { Syne, Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
const display = Syne({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
export const metadata: Metadata = { title: 'Siddhi Bhogade — AI & DevOps Engineer', description: 'The engineering portfolio of Siddhi Bhogade. Exploring AI, software development, and DevOps through research, applications, and deployment workflows.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${sans.variable} ${serif.variable}`}><body>{children}</body></html>;
}
