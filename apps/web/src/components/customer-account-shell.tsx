'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { LotusMark } from './lotus-mark';

const links = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'My orders' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/addresses', label: 'Delivery' },
  { href: '/account/profile', label: 'Profile' },
];

export function CustomerAccountShell({ children, enabled, fallback }: { children: React.ReactNode; enabled: boolean; fallback: React.ReactNode }) {
  const pathname = usePathname();
  if (!enabled) return pathname === '/account/wishlist' ? children : fallback;
  return <SignedInAccount pathname={pathname}>{children}</SignedInAccount>;
}

function SignedInAccount({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const { data, isPending, error, refetch } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  async function signOut() {
    setSigningOut(true);
    setSignOutError('');
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error('Sign out failed');
      await refetch();
      window.location.assign('/login');
    } catch {
      setSignOutError('Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  if (pathname === '/account/wishlist' && !data?.user) return children;
  if (isPending && !data) return <p role="status" className="text-sm text-muted">Checking your account…</p>;
  if (error) {
    return (
      <>
        <h1 className="font-display text-4xl">Account</h1>
        <p className="mt-3 text-muted">We could not check your session.</p>
        <button type="button" className="shop-button mt-5" onClick={() => void refetch()}>Try again</button>
      </>
    );
  }
  if (!data?.user) {
    return (
      <>
        <h1 className="font-display text-4xl">Your account</h1>
        <p className="mt-3 text-muted">Sign in to see your order history and manage your profile.</p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="shop-button">Sign in</Link>
          <Link href="/register" className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4">Create an account</Link>
        </div>
      </>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside>
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <LotusMark className="h-6 w-6 text-brand" />
          <p className="font-display text-2xl">Account</p>
        </div>
        <nav aria-label="Account" className="mt-2 flex flex-wrap gap-x-5 lg:flex-col lg:gap-x-0">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-brand aria-[current=page]:font-semibold aria-[current=page]:text-brand">{label}</Link>
          ))}
          <button type="button" disabled={signingOut} onClick={signOut} className="min-h-11 text-left text-sm text-muted hover:text-brand disabled:opacity-50">{signingOut ? 'Signing out…' : 'Sign out'}</button>
        </nav>
        {signOutError && <p role="alert" className="mt-2 text-sm text-brand">{signOutError}</p>}
      </aside>
      <div className="min-w-0" key={data.user.id}>{children}</div>
    </div>
  );
}
