import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';
import * as schema from '@jewelry/db';
import { eq } from 'drizzle-orm';
import { allowedStorefrontOrigins } from './checkout-origin';

/**
 * Better Auth 配置
 *
 * - 数据库: 复用 Drizzle (本地 PostgreSQL)
 * - 认证表: Better Auth 自管的 user/session/account/verification (需建表,见下方 migration)
 * - 业务表: customers (会员业务数据,与 auth user 通过 authUserId 关联)
 *
 * 路由: app/api/auth/[...all]/route.ts
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  socialProviders: {
    // Phase 后续: 接入 Google/Apple OAuth (需 client id/secret)
    // google: { clientId: ..., clientSecret: ... },
  },
  plugins: [nextCookies()],
  // 跨域: 后端 (api.naracharm.com) 服务,前端 (naracharm.com) 调用
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:37000',
  trustedOrigins: () => allowedStorefrontOrigins(),
  advanced: {
    // 跨子域共享登录 cookie (.naracharm.com)
    cookiePrefix: 'nara_auth',
    defaultCookieAttributes: {
      sameSite: 'lax',
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    },
  },
});

export type Session = typeof auth.$Infer.Session;

/**
 * 服务端获取当前会话 (Server Component / Route Handler 用)
 */
export async function getSession() {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    return session;
  } catch (e: any) {
    console.error('[getSession] error:', e?.message);
    return null;
  }
}

/**
 * 要求管理员登录,否则抛错 (admin 路由守卫用)
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error('UNAUTHORIZED');
  const [user] = await db.select({ role: schema.users.role }).from(schema.users).where(eq(schema.users.id, session.user.id)).limit(1);
  if (user?.role !== 'admin') throw new Error('FORBIDDEN');
  return session;
}
