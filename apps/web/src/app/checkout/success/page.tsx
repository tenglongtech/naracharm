import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { ButtonLink } from '@/components/ui';

/**
 * /checkout/success - 下单成功页
 * Phase 3: Stripe webhook (checkout.session.completed) 触发后跳转此页,
 * 并从 query 读取真实 order id 显示订单详情。
 * 当前为演示:固定示例订单。
 */
export const metadata: Metadata = { title: 'Order Confirmed', robots: { index: false } };

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-2xl px-4 py-16 md:py-24 text-center">
        {/* 成功标志 */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-3xl">✓</div>
        <h1 className="mt-5 font-display text-3xl md:text-4xl">Thank You for Your Order</h1>
        <p className="mt-3 text-muted">
          Your story is on its way. A confirmation has been sent to your email.
        </p>

        {/* 订单信息卡 */}
        <div className="mt-8 rounded-lg border border-border bg-surface p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Order Number</span>
            <span className="font-medium tabular-nums">NC-10042</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Order Date</span>
            <span>June 21, 2026</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Total</span>
            <span className="font-medium tabular-nums">$98.00</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted">Payment</span>
            <span className="text-brand">Paid</span>
          </div>
        </div>

        {/* 下一步 */}
        <div className="mt-6 rounded-lg bg-brand/5 p-5 text-left">
          <p className="font-display text-base">What happens next?</p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li>1. We handcraft your piece (1–3 business days).</li>
            <li>2. You receive a shipping email with tracking.</li>
            <li>3. Delivery in 7–15 business days, worldwide.</li>
          </ol>
        </div>

        <LotusMark className="mx-auto mt-8 h-8 w-8 text-brand" />
        <p className="mt-3 font-display italic text-muted">
          Every piece arrives with a story card. Thank you for carrying one with you.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/collections">Continue Shopping</ButtonLink>
          <Link href="/order/NC-10042" className="inline-flex items-center justify-center rounded-md border border-ink px-6 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-bg">
            Track My Order
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
