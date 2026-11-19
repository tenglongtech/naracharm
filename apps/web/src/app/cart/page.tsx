import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CartContents } from '@/components/cart-contents';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Shopping Cart', alternates: { canonical: '/cart' }, robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-5 py-9 md:px-8 md:py-14">
        <h1 className="mb-6 font-display text-5xl leading-none tracking-tight md:mb-9 md:text-6xl">{siteConfig.checkoutEnabled ? 'Your cart' : 'Your saved pieces'}</h1>
        <CartContents checkoutEnabled={siteConfig.checkoutEnabled} />
      </main>
      <SiteFooter />
    </>
  );
}
