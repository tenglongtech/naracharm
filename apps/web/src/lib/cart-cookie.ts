import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { carts } from '@jewelry/db';
import { eq } from 'drizzle-orm';

/**
 * 购物车 cookie · guest token
 *
 * - 首次访问: 创建一个 UUID, 存到 HttpOnly cookie
 * - 30 天有效
 * - 登录后可与 customer 合并 (Phase 4)
 */
export const CART_COOKIE = 'cart_token';
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 天

/**
 * 获取或创建 cart token (server-only, 在 RSC / Server Action 中调用)
 * 返回的 token 写入 cookie (调用方需自行 cookies().set)
 */
export async function getOrCreateCartToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing) return existing;
  return randomUUID();
}

/**
 * 确保 cookie 已设置 (在 Server Action 入口调用一次)
 */
export async function ensureCartCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  if (!cookieStore.get(CART_COOKIE)) {
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: CART_COOKIE_MAX_AGE,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

/**
 * 读 cart (按 token), 没有则返回 null
 */
export async function getCartByToken(token: string) {
  const [row] = await db
    .select()
    .from(carts)
    .where(eq(carts.guestToken, token))
    .limit(1);
  return row ?? null;
}

/**
 * 获取或创建 cart 行 (按 token)
 */
export async function getOrCreateCart(token: string) {
  const existing = await getCartByToken(token);
  if (existing) return existing;
  const [created] = await db
    .insert(carts)
    .values({ guestToken: token })
    .returning();
  return created;
}
