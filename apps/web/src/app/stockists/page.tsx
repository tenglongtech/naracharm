import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';

export const metadata = pageMetadata({
  title: 'Stockist Inquiries',
  description: 'Ask Nara Charm about finding jewelry near you, browse the online shop or get in touch about carrying a collection.',
  path: '/stockists',
});

export default function StockistsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section-wrap">
        <h1 className="font-display text-5xl tracking-tight md:text-7xl">Find Nara Charm.</h1>
        <p className="mt-5 max-w-lg leading-7 text-muted">Browse our online shop, or send us your city and the name of the piece you are looking for if you would like to ask about local availability.</p>
        <div className="mt-7 flex flex-wrap items-center gap-5">
          <Link href="/shop" className="shop-button">Shop online ↗</Link>
          <Link href="/contact?topic=stockists" className="text-sm text-brand underline underline-offset-4">Ask about stockists</Link>
          <Link href="/wholesale" className="text-sm text-brand underline underline-offset-4">Wholesale inquiries</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
