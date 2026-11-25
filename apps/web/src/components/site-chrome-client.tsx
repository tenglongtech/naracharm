'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { CartIcon } from './cart-icon';
import { LotusMark } from './lotus-mark';
import { subscribeToCart, getLocalCart } from '@/lib/cart-local';
import { freeShippingFromLabel, shippingDestinationsLabel } from '@/lib/store-policies';
import { catalogHashPrefix } from '@/lib/catalog-location';
import { siteConfig } from '@/lib/site-config';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop All' },
  { href: '/collections/bracelets', label: 'Bracelets' },
  { href: '/collections/necklaces', label: 'Necklaces' },
  { href: '/collections/earrings', label: 'Earrings' },
  { href: '/collections/phone-charms', label: 'Phone Charms' },
  { href: '/collections', label: 'Collections' },
  { href: '/studio', label: 'Studio' },
  { href: '/blog', label: 'Journal' },
];

export function SiteHeaderClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileNav = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // 购物车数量来自 localStorage (client-only, 避免 SSR 不匹配)
  useEffect(() => {
    setCartCount(getLocalCart().itemCount);
    return subscribeToCart((cart) => setCartCount(cart.itemCount));
  }, []);

  useEffect(() => {
    if (menuOpen) mobileNav.current?.querySelector('a')?.focus();
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === '/collections') return pathname === '/collections';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <a href="#main" onClick={(event) => {
        if (!window.location.hash.startsWith(catalogHashPrefix)) return;
        const main = document.getElementById('main');
        if (!main) return;
        event.preventDefault();
        if (!main.hasAttribute('tabindex')) main.tabIndex = -1;
        main.focus();
      }} className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:bg-bg focus-visible:p-4">Skip to content</a>
      {/* 公告栏 */}
      <div className="bg-[#843d30] text-bg">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-[11px] tracking-wide md:text-xs">
          <Link prefetch={false} href="/shipping" className="underline-offset-4 hover:underline focus-visible:outline-bg">{shippingDestinationsLabel} · Free from {freeShippingFromLabel}</Link>
        </div>
      </div>

      {/* 导航 */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur" onKeyDown={(event) => {
        if (event.key !== 'Escape' || !menuOpen) return;
        setMenuOpen(false);
        menuButton.current?.focus();
      }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:py-5">
          <button
            type="button"
            ref={menuButton}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            className="-ml-2 flex min-h-11 min-w-11 items-center justify-center lg:hidden"
          >
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          <Link prefetch={false} href="/" className="flex items-center gap-2" aria-label="Nara Charm home">
            <LotusMark className="h-7 w-7 text-brand" />
            <span className="font-display text-2xl tracking-tight">
              Nara <span className="text-brand">Charm</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-4 text-[13px] lg:flex xl:gap-5 xl:text-sm" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                prefetch={false}
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? 'page' : undefined}
                className={`relative py-1 transition-colors hover:text-brand ${
                  isActive(l.href) ? 'text-brand' : ''
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-brand" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link prefetch={false} href="/search" aria-label="Search" onClick={(event) => {
              if (pathname !== '/search' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              const field = document.getElementById('catalog-search-input');
              if (!field) return;
              event.preventDefault();
              field.focus();
            }} className="flex min-h-11 min-w-11 items-center justify-center hover:text-brand"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/></svg></Link>
            {siteConfig.customerServicesEnabled ? (
              <Link prefetch={false} href="/account" aria-label="Account" className="flex min-h-11 min-w-11 items-center justify-center hover:text-brand"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg></Link>
            ) : (
              <Link prefetch={false} href="/account/wishlist" aria-label="Wishlist" className="flex min-h-11 min-w-11 items-center justify-center hover:text-brand">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5 4.6 13.1a4.65 4.65 0 0 1 6.6-6.55l.8.8.8-.8a4.65 4.65 0 0 1 6.6 6.55z" /></svg>
              </Link>
            )}
            {(siteConfig.checkoutEnabled || cartCount > 0) && <CartIcon count={cartCount} />}
          </div>
        </div>

        <div id="mobile-navigation" hidden={!menuOpen} className="border-t border-border bg-bg lg:hidden">
          <nav ref={mobileNav} className="mx-auto flex max-w-7xl flex-col px-4 py-2" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <Link
                prefetch={false}
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={`border-b border-border/60 py-3 text-sm transition-colors ${
                  isActive(l.href) ? 'text-brand' : 'text-ink hover:text-brand'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
