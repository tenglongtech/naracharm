import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CartContents } from '@/components/cart-contents';

export const metadata: Metadata = { title: 'Shopping Cart' };

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <CartContents />
      </main>
      <SiteFooter />
    </>
  );
}
