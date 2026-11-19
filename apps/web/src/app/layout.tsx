import { siteConfig } from '@/lib/site-config';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { serializeJsonLd, storeOrganization } from '@/lib/seo';
import { freeShippingFromLabel } from '@/lib/store-policies';

const inter = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = localFont({
  src: './fonts/fraunces-latin.woff2',
  weight: '100 900',
  variable: '--font-fraunces',
  display: 'swap',
});

const SITE_URL = siteConfig.url;
const brandTitle = 'Nara Charm | Heritage-Inspired Jewelry & Phone Charms';
const brandDescription = 'Heritage-inspired bracelets, necklaces, earrings and phone charms. Explore new studio designs and practical jewelry guides.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: brandTitle,
    template: '%s | Nara Charm',
  },
  description: brandDescription,
  applicationName: 'Nara Charm',
  authors: [{ name: 'Nara Charm' }],
  creator: 'Nara Charm',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Nara Charm',
    title: brandTitle,
    description: brandDescription,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: brandTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: brandTitle,
    description:
      'Explore bracelets, necklaces, earrings and phone charms. Free standard shipping from ' + freeShippingFromLabel + ' at supported destinations.',
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
  other: {},
};

export const viewport: Viewport = {
  themeColor: '#FAF7F1',
  width: 'device-width',
  initialScale: 1,
};

// 全站 Organization JSON-LD (在所有页面 head 注入)
const organizationJsonLd = {
  ...storeOrganization,
  logo: `${SITE_URL}/icon`,
  slogan: siteConfig.slogan,
  description:
    'A heritage-inspired jewelry studio with bracelets, necklaces, earrings, phone charms and design notes.',
  sameAs: Object.entries(siteConfig.social).filter(([, handle]) => Boolean(handle)).map(([network, handle]) => `https://${network === 'youtube' ? 'youtube.com/@' : network === 'tiktok' ? 'tiktok.com/@' : `${network}.com/`}${handle.replace(/^@/, '')}`),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    ...(siteConfig.inquiryFormEnabled ? { url: `${SITE_URL}/contact` } : { email: siteConfig.company.supportEmail }),
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: siteConfig.company.address,
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
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
