import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';
import * as schema from '@jewelry/db';

/**
 * Better Auth 配置
 *
 * - 数据库: 复用 Drizzle (本地 PostgreSQL)
 * - 认证表: Better Auth 自管的 user/session/account/verification (需建表,见下方 migration)
 * - 业务表: customers (会员业务数据,与 auth user 通过 authUserId 关联)
 * - 邮件: 验证邮件本地用 console 打印 (Phase 接 Resend 后改为发邮件)
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
  // 本地开发: 确认 base URL
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:37000',
  trustedOrigins: [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:37000',
    // 本地开发接受 localhost 所有端口 (生产可移除)
    ...(process.env.NODE_ENV !== 'production'
      ? ['http://localhost:37000', 'http://localhost:37001', 'http://localhost', 'http://naracharm.test', 'https://naracharm.test']
      : []),
  ],
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
  if ((session.user as { role?: string }).role !== 'admin') throw new Error('FORBIDDEN');
  return session;
}
