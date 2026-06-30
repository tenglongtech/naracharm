/**
 * 创建管理员账号
 *
 * 用法: cd apps/web && set -a && source .env.local && set +a && npx tsx ../../scripts/create-admin.ts
 *
 * 会创建/升级一个 role=admin 的用户。
 * 默认: admin@naracharm.com / admin123456 (上线前改密码!)
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from '../packages/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'crypto';

// Better Auth 用 scrypt,这里用简单 hash 占位;实际通过 Better Auth 注册后再升级 role 更稳。
// 此脚本: 直接插入/更新 role=admin (密码通过前台注册页设置,然后此脚本升级 role)

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle({ client, schema: { users } });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@naracharm.com';

async function main() {
  // 查现有用户
  const [existing] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).limit(1);

  if (existing) {
    // 升级为 admin
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, existing.id));
    console.log(`✓ 已将 ${ADMIN_EMAIL} 升级为管理员`);
    console.log(`  用户 ID: ${existing.id}`);
    console.log(`  现在可以去 /admin/login 用此邮箱登录`);
  } else {
    console.log(`✗ 用户 ${ADMIN_EMAIL} 不存在。`);
    console.log(`  请先去 /register 用此邮箱注册,然后再跑此脚本升级为 admin。`);
    console.log(`  (Better Auth 会处理密码加密,直接插库不安全)`);
  }

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
