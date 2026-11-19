import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { SiteHeader, SiteFooter } from './site-chrome';

export function CustomerAccessNotice() {
  return (
    <>
      <h1 className="font-display text-4xl">Account access is temporarily paused</h1>
      <p className="mt-4 max-w-xl leading-7 text-muted">Your wishlist is available on the device where you saved your pieces.</p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <Link href="/account/wishlist" className="shop-button">View your wishlist</Link>
        <Link href="/shop" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Browse jewelry</Link>
      </div>
    </>
  );
}

export function CustomerAccessLayout({ children }: { children: React.ReactNode }) {
  if (siteConfig.customerServicesEnabled) return children;

  return (
    <>
      <SiteHeader />
      <main id="main" className="section-wrap min-h-[52vh]">
        <CustomerAccessNotice />
      </main>
      <SiteFooter />
    </>
  );
}
