import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CheckoutForm } from '@/components/checkout-form';

/**
 * /checkout - 结账页
 * Phase 3: 接 Stripe Embedded Checkout (创建 session + 嵌入支付组件 + webhook 同步订单)。
 */
export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>
        <div className="mt-8">
          <CheckoutForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
