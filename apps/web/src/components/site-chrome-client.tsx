'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CartIcon } from './cart-icon';
import { LotusMark } from './lotus-mark';

const NAV_LINKS = [
  { href: '/collections', label: 'Collections' },
  { href: '/best-sellers', label: 'Best Sellers' },
  { href: '/stories', label: 'Stories' },
  { href: '/our-craft', label: 'Craftsmanship' },
  { href: '/about', label: 'About' },
  { href: '/gift-guide', label: 'Gift Guide' },
];

export function SiteHeaderClient({ cartCount }: { cartCount: number }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* 公告栏 */}
      <div className="bg-ink text-bg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-[11px] tracking-wide md:text-xs">
          <span className="hidden sm:block">✦ Free shipping on orders over $120</span>
          <span className="font-display italic">Jewelry with Spirit · Stories in Every Piece</span>
          <span className="hidden sm:block">Ship to: 🌍 Worldwide</span>
        </div>
      </div>

      {/* 导航 */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:py-5">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="-ml-2 p-2 md:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

          <Link href="/" className="flex items-center gap-2" aria-label="Nara Charm home">
            <LotusMark className="h-7 w-7 text-brand" />
            <span className="font-display text-2xl tracking-tight">
              Nara <span className="text-brand">Charm</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
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

          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" className="hover:text-brand">🔍</Link>
            <Link href="/account" aria-label="Account" className="hover:text-brand">👤</Link>
            <CartIcon count={cartCount} />
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-bg md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2" aria-label="Mobile">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
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
        )}
      </header>
    </>
  );
}
