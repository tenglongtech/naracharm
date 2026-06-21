import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nara Charm | Jewelry with Spirit',
    template: '%s | Nara Charm',
  },
  description:
    'Handmade jewelry inspired by the craft traditions of Tibet, Thailand, Mongolia, China and the Southwest. Every piece carries a story.',
  metadataBase: new URL('https://naracharm.com'),
  openGraph: {
    title: 'Nara Charm | Jewelry with Spirit',
    description:
      'Handmade jewelry with a story in every piece. Inspired by the craft traditions of the Silk Road and the Steppe.',
    type: 'website',
    siteName: 'Nara Charm',
  },
};

export const viewport: Viewport = {
  themeColor: '#faf7f1',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
