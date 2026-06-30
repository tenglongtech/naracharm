import Link from 'next/link';
import { SiteHeaderClient } from './site-chrome-client';
import { getCart } from '@/lib/cart-actions';
import { LotusMark } from './lotus-mark';
import { siteConfig } from '@/lib/site-config';

const socialConfig = siteConfig.social;

// 重新导出 LotusMark 以保持向后兼容 (历史 import 路径)
export { LotusMark };

/**
 * 全站 Header (server) — 拉购物车数量,注入 client header
 */
export async function SiteHeader() {
  let count = 0;
  try {
    const cart = await getCart();
    count = cart.itemCount;
  } catch {
    // DB 未就绪时 fallback 0
  }
  return <SiteHeaderClient cartCount={count} />;
}

/** 全站 Footer (server, 纯静态) */
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
            {socialConfig.instagram && <a href={`https://instagram.com/${socialConfig.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold">📷</a>}
            {socialConfig.tiktok && <a href={`https://tiktok.com/@${socialConfig.tiktok}`} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:text-gold">🎵</a>}
            {socialConfig.youtube && <a href={`https://youtube.com/@${socialConfig.youtube}`} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-gold">▶️</a>}
            {socialConfig.pinterest && <a href={`https://pinterest.com/${socialConfig.pinterest}`} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="hover:text-gold">📌</a>}
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
            <li><Link href="/blog" className="hover:text-bg">Crystal Guide & Meanings</Link></li>
            <li><Link href="/our-craft" className="hover:text-bg">Our Craft</Link></li>
            <li><Link href="/stories" className="hover:text-bg">Stories</Link></li>
            <li><Link href="/about" className="hover:text-bg">About Us</Link></li>
            <li><Link href="/gift-guide" className="hover:text-bg">Gift Guide</Link></li>
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
