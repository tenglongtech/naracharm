import Link from 'next/link';

export default function AccountOverviewPage() {
  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className="shop-button" href="/account/orders">View your orders</Link>
        <Link className="inline-flex min-h-12 items-center text-sm text-brand underline underline-offset-4" href="/shop">Shop jewelry</Link>
      </div>
    </div>
  );
}
