import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { CartContents } from '@/components/cart-contents';

/**
 * /cart - 购物车页
 * 实际内容在客户端组件 CartContents 中 (本地状态演示)。
 * Phase 3: 接 Server Action + carts/cart_lines 表持久化。
 */
export const metadata: Metadata = { title: 'Shopping Cart' };

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <CartContents />
      </main>
      <SiteFooter />
    </>
  );
}
