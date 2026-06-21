import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { ButtonLink } from '@/components/ui';

/**
 * /order/[id] - 订单详情/物流查询
 * Phase 3: 从数据库 (orders + order_lines + order_fulfillments) 按 number 查询。
 * 当前演示:任意 id 都显示一个示例订单 (未登录时通过订单号+邮箱查询)。
 */

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id}`, robots: { index: false } };
}

// 演示订单状态时间线
const TIMELINE = [
  { status: 'Order Placed', date: 'Jun 21, 2026', done: true, desc: 'We received your order.' },
  { status: 'Crafting', date: 'In progress', done: true, desc: 'Being handmade by our artisans.' },
  { status: 'Shipped', date: 'Pending', done: false, desc: 'Tracking number will be emailed.' },
  { status: 'Delivered', date: 'Est. Jul 1–5', done: false, desc: 'Estimated delivery window.' },
];

const ITEMS = [
  { name: 'Red Agate Blessing Bracelet', variant: 'Medium (17cm) · Tibetan', qty: 1, price: '$42.00' },
  { name: 'Thai Silk Phone Charm', variant: 'Emerald · Thai', qty: 2, price: '$56.00' },
];

export default async function OrderPage({ params }: Params) {
  const { id } = await params;
  // Phase 3: const order = await getOrderById(id); if (!order) notFound();
  // 演示: 显示示例订单

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <Link href="/account/orders" className="text-sm text-brand hover:underline">← Back to Orders</Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Order {id}</h1>
            <p className="text-sm text-muted">Placed June 21, 2026 · Paid</p>
          </div>
          <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm text-ink">Crafting in progress</span>
        </div>

        {/* 物流时间线 */}
        <section className="mt-10 rounded-lg border border-border bg-surface p-6 md:p-8">
          <h2 className="font-display text-xl">Order Status</h2>
          <ol className="mt-6 space-y-6">
            {TIMELINE.map((step, i) => (
              <li key={step.status} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${step.done ? 'bg-brand text-bg' : 'border border-border bg-bg text-muted'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && <div className={`mt-1 h-8 w-px ${step.done ? 'bg-brand' : 'bg-border'}`} />}
                </div>
                <div className="pt-1">
                  <p className={`font-medium ${step.done ? 'text-ink' : 'text-muted'}`}>{step.status}</p>
                  <p className="text-xs text-muted">{step.date} · {step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 订单明细 */}
        <section className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
          <div>
            <h2 className="font-display text-xl">Items</h2>
            <ul className="mt-4 divide-y divide-border">
              {ITEMS.map((it) => (
                <li key={it.name} className="flex gap-4 py-4">
                  <div className="h-16 w-16 flex-shrink-0 rounded-md bg-surface">[img]</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted">{it.variant}</p>
                    <p className="text-xs text-muted">Qty: {it.qty}</p>
                  </div>
                  <span className="text-sm tabular-nums">{it.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className="font-display text-base">Summary</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">$98.00</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd className="text-brand">Free</dd></div>
                <div className="flex justify-between border-t border-border pt-2 font-medium"><dt>Total</dt><dd className="tabular-nums">$98.00</dd></div>
              </dl>
            </div>
            <div className="rounded-lg border border-border bg-surface p-5 text-sm">
              <h3 className="font-display text-base">Shipping To</h3>
              <p className="mt-2 text-muted">Emma Rivera<br />123 Linden St<br />Brooklyn, NY 11201<br />United States</p>
            </div>
            <ButtonLink href="/collections" variant="outline" className="w-full">Buy Again</ButtonLink>
          </aside>
        </section>

        <div className="mt-12 text-center">
          <LotusMark className="mx-auto h-7 w-7 text-brand" />
          <p className="mt-2 text-sm text-muted">Questions about your order? <a href="mailto:hello@naracharm.com" className="text-brand underline">Email us</a>.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
