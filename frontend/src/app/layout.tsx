import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'Savvy UK — Find your unclaimed benefits & bill savings',
    template: '%s | Savvy UK',
  },
  description:
    "AI-powered tool that finds your unclaimed UK benefits, cuts your energy bill, and saves you money in minutes. £24 billion goes unclaimed every year — find out what you're missing.",
  keywords: ['UK benefits calculator', 'energy bill comparison', 'universal credit', 'unclaimed benefits', 'save money UK'],
  openGraph: {
    title: 'Savvy UK — Find your unclaimed benefits & bill savings',
    description: 'Discover thousands of pounds in unclaimed UK benefits and bill savings with AI.',
    siteName: 'Savvy UK',
    locale: 'en_GB',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white">{children}</body>
    </html>
  );
}
