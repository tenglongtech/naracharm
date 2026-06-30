export const dynamic = "force-dynamic";
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CartContents } from '@/components/cart-contents';
import { getCart } from '@/lib/cart-actions';

export const metadata: Metadata = { title: 'Shopping Cart' };

export default async function CartPage() {
  const cart = await getCart();
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <CartContents initialCart={cart} />
      </main>
      <SiteFooter />
    </>
  );
}
