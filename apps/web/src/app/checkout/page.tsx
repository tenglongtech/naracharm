export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CheckoutForm } from '@/components/checkout-form';
import { getCart } from '@/lib/cart-actions';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const cart = await getCart();
  if (cart.lines.length === 0) {
    redirect('/cart');
  }
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>
        <div className="mt-8">
          <CheckoutForm cart={cart} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
