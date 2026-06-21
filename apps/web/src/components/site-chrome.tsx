import Link from 'next/link';

/** 莲花 logo (简化 SVG,正式 logo 确认后替换) */
export function LotusMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21c-4 0-7-3-7-7 0 0 3-1 7 4 4-5 7-4 7-4 0 4-3 7-7 7z" />
      <path d="M12 18c-2-2-3-5-3-8 0 0 1.5-1 3 1 1.5-2 3-1 3-1 0 3-1 6-3 8z" />
      <path d="M12 10c0-3 0-5 0-7" />
    </svg>
  );
}

/** 全站共享 Header (公告栏 + 导航) */
export function SiteHeader() {
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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:py-5">
          <div className="w-8 md:hidden" />
          <Link href="/" className="flex items-center gap-2" aria-label="Nara Charm home">
            <LotusMark className="h-7 w-7 text-brand" />
            <span className="font-display text-2xl tracking-tight">
              Nara <span className="text-brand">Charm</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
            <Link href="/collections" className="hover:text-brand transition-colors">Collections</Link>
            <Link href="/best-sellers" className="hover:text-brand transition-colors">Best Sellers</Link>
            <Link href="/stories" className="hover:text-brand transition-colors">Stories</Link>
            <Link href="/our-craft" className="hover:text-brand transition-colors">Craftsmanship</Link>
            <Link href="/about" className="hover:text-brand transition-colors">About</Link>
            <Link href="/gift-guide" className="hover:text-brand transition-colors">Gift Guide</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" className="hover:text-brand">🔍</Link>
            <Link href="/account" aria-label="Account" className="hover:text-brand">👤</Link>
            <Link href="/cart" aria-label="Cart" className="hover:text-brand relative">
              🛍️
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-bg">0</span>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

/** 全站共享 Footer */
export function SiteFooter() {
  return (
    <footer className="bg-ink text-bg">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <LotusMark className="h-7 w-7 text-gold" />
            <span className="font-display text-2xl">Nara Charm</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-bg/70">
            Handmade heritage jewelry, shipped worldwide.
            Every piece carries a story.
          </p>
          <div className="mt-4 flex gap-3 text-lg">
            <a href="#" aria-label="Instagram" className="hover:text-gold">📷</a>
            <a href="#" aria-label="TikTok" className="hover:text-gold">🎵</a>
            <a href="#" aria-label="YouTube" className="hover:text-gold">▶️</a>
            <a href="#" aria-label="Pinterest" className="hover:text-gold">📌</a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-gold">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-bg/75">
            <li><Link href="/collections" className="hover:text-bg">All Collections</Link></li>
            <li><Link href="/best-sellers" className="hover:text-bg">Best Sellers</Link></li>
            <li><Link href="/collections/phone-charms" className="hover:text-bg">Phone Charms</Link></li>
            <li><Link href="/collections/necklaces" className="hover:text-bg">Necklaces</Link></li>
            <li><Link href="/collections/bracelets" className="hover:text-bg">Bracelets</Link></li>
            <li><Link href="/collections/earrings" className="hover:text-bg">Earrings</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-gold">About</h3>
          <ul className="mt-4 space-y-2 text-sm text-bg/75">
            <li><Link href="/our-craft" className="hover:text-bg">Our Craft</Link></li>
            <li><Link href="/stories" className="hover:text-bg">Stories</Link></li>
            <li><Link href="/about" className="hover:text-bg">About Us</Link></li>
            <li><Link href="/gift-guide" className="hover:text-bg">Gift Guide</Link></li>
            <li><Link href="/stockists" className="hover:text-bg">Stockists</Link></li>
            <li><Link href="/wholesale" className="hover:text-bg">Wholesale</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-gold">Join the Journey</h3>
          <p className="mt-4 text-sm text-bg/75">
            New stories, early drops, and 10% off your first charm.
          </p>
          <form className="mt-4">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <div className="flex gap-2">
              <input
                id="footer-email"
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 rounded-md border border-bg/30 bg-bg/10 px-3 py-2.5 text-sm text-bg placeholder:text-bg/40 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-bg hover:bg-brand/90"
              >
                →
              </button>
            </div>
          </form>
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-bg/55">
            <Link href="/faq" className="hover:text-bg">FAQ</Link>
            <Link href="/contact" className="hover:text-bg">Contact</Link>
            <Link href="/size-guide" className="hover:text-bg">Size Guide</Link>
            <Link href="/shipping" className="hover:text-bg">Shipping</Link>
            <Link href="/returns" className="hover:text-bg">Returns</Link>
            <Link href="/privacy" className="hover:text-bg">Privacy</Link>
            <Link href="/terms" className="hover:text-bg">Terms</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-bg/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-bg/50">
          © {new Date().getFullYear()} Nara Charm. Handmade with spirit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
