import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import '@/styles/globals.css';
import { AntdProvider } from '@/components/antd-provider';

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nara Charm | Handmade Beaded Bracelets & Crystal Jewelry',
    template: '%s | Nara Charm',
  },
  description:
    'Handmade beaded bracelets, crystal necklaces & phone charms. Tibetan silver, boho & natural stone jewelry with a story. Free shipping over $120.',
  applicationName: 'Nara Charm',
  keywords: [
    'handmade jewelry',
    'beaded bracelet',
    'crystal necklace',
    'phone charm',
    'tibetan jewelry',
    'boho bracelet',
    'natural stone bracelet',
    'amethyst bracelet',
    'rose quartz bracelet',
    'turquoise jewelry',
    'evil eye bracelet',
    'jade pendant',
    'thai silk',
    'miao filigree earrings',
    'mongolian knot',
    'ethnic jewelry',
    'healing crystal jewelry',
    'charm necklace',
    'handmade earrings',
    'protection bracelet',
  ],
  authors: [{ name: 'Nara Charm' }],
  creator: 'Nara Charm',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Nara Charm',
    title: 'Nara Charm | Handmade Beaded Bracelets, Crystal Jewelry & Phone Charms',
    description:
      'Shop handmade beaded bracelets, natural stone necklaces, Tibetan silver jewelry, boho phone charms & crystal earrings. Every piece carries a story.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Nara Charm — Handmade Beaded Bracelets & Crystal Jewelry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nara Charm | Handmade Beaded Bracelets & Crystal Jewelry',
    description:
      'Shop handmade beaded bracelets, natural stone necklaces, Tibetan silver jewelry & boho phone charms. Free shipping over $120.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF7F1',
  width: 'device-width',
  initialScale: 1,
};

// 全站 Organization JSON-LD (在所有页面 head 注入)
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Nara Charm',
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    'Handmade heritage jewelry — Tibetan silver, Miao filigree, Mongolian knots, Han jade, Thai silk. Jewelry with spirit, stories in every piece.',
  sameAs: [
    'https://instagram.com/naracharm',
    'https://tiktok.com/@naracharm',
    'https://youtube.com/@naracharm',
    'https://pinterest.com/naracharm',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@naracharm.com',
    availableLanguage: 'English',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
