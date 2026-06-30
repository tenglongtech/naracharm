/**
 * 数据库连接 (Neon serverless + Drizzle)
 *
 * 生产环境 (Vercel): 用 @neondatabase/serverless (HTTP 驱动,适配 serverless)
 * 本地开发: 同样可用 (Neon 云数据库) 或回退到 postgres.js (本地 PG)
 *
 * DATABASE_URL 决定连哪个库。
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@jewelry/db';

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('⚠️ DATABASE_URL 未设置 — 数据库功能不可用');
    return null as any;
  }
  const sql = neon(connectionString);
  return drizzle({ client: sql, schema });
}

export const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db = db;
}

export type DB = typeof db;
