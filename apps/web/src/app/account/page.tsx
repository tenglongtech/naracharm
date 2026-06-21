import Link from 'next/link';

/** /account - 会员中心概览 */
export default function AccountOverviewPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <p className="mt-2 text-muted">A snapshot of your Nara Charm journey.</p>

      {/* 数据卡 */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Total Orders</p>
          <p className="mt-1 font-display text-3xl">3</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Wishlist</p>
          <p className="mt-1 font-display text-3xl">5</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-wider text-muted">Member Since</p>
          <p className="mt-1 font-display text-xl">2026</p>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Recent Order</h2>
          <Link href="/account/orders" className="text-sm text-brand hover:underline">View all →</Link>
        </div>
        <Link href="/order/NC-10042" className="mt-3 block rounded-lg border border-border bg-surface p-5 transition-colors hover:border-brand">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">NC-10042</p>
              <p className="text-xs text-muted">Jun 21, 2026 · 3 items</p>
            </div>
            <div className="text-right">
              <p className="text-sm tabular-nums">$98.00</p>
              <span className="text-xs text-gold">Crafting</span>
            </div>
          </div>
        </Link>
      </div>

      {/* 快捷入口 */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/collections" className="rounded-md border border-ink px-5 py-2.5 text-sm hover:bg-ink hover:text-bg transition-colors">Shop New Arrivals</Link>
        <Link href="/account/wishlist" className="rounded-md border border-ink px-5 py-2.5 text-sm hover:bg-ink hover:text-bg transition-colors">View Wishlist</Link>
      </div>
    </div>
  );
}
