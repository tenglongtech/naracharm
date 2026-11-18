import Link from 'next/link';

export default function AddressesPage() {
  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">Delivery address</h1>
      <p className="mt-4 max-w-prose leading-7 text-muted">Enter your delivery address at checkout. If you need to change the address on an order you just placed, contact us with your order number as soon as possible.</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <Link href="/contact?topic=order" className="shop-button">Get order help ↗</Link>
        <Link href="/shipping" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Delivery options</Link>
      </div>
    </div>
  );
}
