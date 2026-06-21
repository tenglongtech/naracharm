import Link from 'next/link';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';

/**
 * 会员中心 dashboard 布局
 * 左侧: 固定导航 (概览/订单/收藏/地址/资料/登出)
 * 右侧: 子页内容
 * Phase 4: 接 Better Auth 后,未登录重定向到 /login。
 */

const NAV = [
  { href: '/account', label: 'Overview', icon: '◉' },
  { href: '/account/orders', label: 'My Orders', icon: '📦' },
  { href: '/account/wishlist', label: 'Wishlist', icon: '♡' },
  { href: '/account/addresses', label: 'Addresses', icon: '📍' },
  { href: '/account/profile', label: 'Profile', icon: '👤' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* 侧边栏 */}
          <aside>
            <div className="flex items-center gap-2">
              <LotusMark className="h-7 w-7 text-brand" />
              <div>
                <p className="text-xs text-muted">Welcome back,</p>
                <p className="font-display text-base">Emma</p>
              </div>
            </div>
            <nav className="mt-6 space-y-1" aria-label="Account">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  <span>{n.icon}</span>
                  {n.label}
                </Link>
              ))}
              {/* 登出 (Phase 4 接 Better Auth signOut) */}
              <form>
                <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-brand">
                  <span>↩</span> Sign Out
                </button>
              </form>
            </nav>
          </aside>

          {/* 内容区 */}
          <div>{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
