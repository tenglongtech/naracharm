import Link from 'next/link';
import { SiteHeaderClient } from './site-chrome-client';
import { LotusMark } from './lotus-mark';
import { siteConfig } from '@/lib/site-config';

const socialConfig = siteConfig.social;

// 重新导出 LotusMark 以保持向后兼容 (历史 import 路径)
export { LotusMark };

/**
 * 全站 Header (静态,无 DB 依赖)
 * 购物车徽标由 client 组件从 localStorage 读取。
 */
export function SiteHeader() {
  return <SiteHeaderClient />;
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
            Heritage-inspired jewelry with international delivery.
            Every piece carries a story.
          </p>
          <div className="mt-4 flex gap-3.5 text-bg/75">
            {socialConfig.instagram && (
              <a href={`https://instagram.com/${socialConfig.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex min-h-9 min-w-9 items-center justify-center transition-colors hover:text-gold">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
            )}
            {socialConfig.tiktok && (
              <a href={`https://tiktok.com/@${socialConfig.tiktok}`} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="inline-flex min-h-9 min-w-9 items-center justify-center transition-colors hover:text-gold">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            )}
            {socialConfig.youtube && (
              <a href={`https://youtube.com/@${socialConfig.youtube}`} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="inline-flex min-h-9 min-w-9 items-center justify-center transition-colors hover:text-gold">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none" /></svg>
              </a>
            )}
            {socialConfig.pinterest && (
              <a href={`https://pinterest.com/${socialConfig.pinterest}`} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="inline-flex min-h-9 min-w-9 items-center justify-center transition-colors hover:text-gold">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.5 19.5 11.5 13m0 0a3.5 3.5 0 1 1 3.7 1.3c-1.4.4-2.7-.2-3.2-1.3" /></svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-gold">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-bg/75">
            <li><Link prefetch={false} href="/shop" className="hover:text-bg">Shop All Jewelry</Link></li>
            <li><Link prefetch={false} href="/collections" className="hover:text-bg">All Collections</Link></li>
            <li><Link prefetch={false} href="/studio" className="hover:text-bg">Studio Collections</Link></li>
            <li><Link prefetch={false} href="/best-sellers" className="hover:text-bg">Featured Jewelry</Link></li>
            <li><Link prefetch={false} href="/collections/phone-charms" className="hover:text-bg">Phone Charms</Link></li>
            <li><Link prefetch={false} href="/collections/necklaces" className="hover:text-bg">Necklaces</Link></li>
            <li><Link prefetch={false} href="/collections/bracelets" className="hover:text-bg">Bracelets</Link></li>
            <li><Link prefetch={false} href="/collections/earrings" className="hover:text-bg">Earrings</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-gold">About</h3>
          <ul className="mt-4 space-y-2 text-sm text-bg/75">
            <li><Link prefetch={false} href="/blog" className="hover:text-bg">The Nara Journal</Link></li>
            <li><Link prefetch={false} href="/our-craft" className="hover:text-bg">Our Craft</Link></li>
            <li><Link prefetch={false} href="/stories" className="hover:text-bg">Stories</Link></li>
            <li><Link prefetch={false} href="/about" className="hover:text-bg">About Us</Link></li>
            <li><Link prefetch={false} href="/gift-guide" className="hover:text-bg">Gift Guide</Link></li>
            <li><Link prefetch={false} href="/wholesale" className="hover:text-bg">Wholesale</Link></li>
            <li><Link prefetch={false} href="/stockists" className="hover:text-bg">Stockists</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-wider text-gold">A little guidance</h3>
          <p className="mt-4 text-sm leading-7 text-bg/75">Questions about fit, materials or your order? We’re here to help you choose with care.</p>
          <Link prefetch={false} href="/contact" className="mt-5 inline-flex min-h-11 items-center border-b border-gold text-sm text-gold">Get in touch ↗</Link>
          <div className="mt-5 flex flex-wrap justify-start gap-x-4 gap-y-1.5 text-[11px] text-bg/60">
            <Link prefetch={false} href="/faq" className="hover:text-bg">FAQ</Link>
            <Link prefetch={false} href="/contact" className="hover:text-bg">Contact</Link>
            <Link prefetch={false} href="/size-guide" className="hover:text-bg">Size Guide</Link>
            <Link prefetch={false} href="/shipping" className="hover:text-bg">Shipping</Link>
            {siteConfig.customerServicesEnabled && <Link prefetch={false} href="/order-status" className="hover:text-bg">Track an order</Link>}
            <Link prefetch={false} href="/returns" className="hover:text-bg">Returns</Link>
            <Link prefetch={false} href="/privacy" className="hover:text-bg">Privacy</Link>
            <Link prefetch={false} href="/terms" className="hover:text-bg">Terms</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-bg/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-bg/70">
          © {new Date().getFullYear()} Nara Charm. Handmade with spirit. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
