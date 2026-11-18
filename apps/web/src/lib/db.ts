/**
 * 数据库连接 (postgres-js + Drizzle)
 *
 * 用 postgres.js 驱动 (兼容本地 Postgres / Neon / Contabo Postgres)
 * 池化连接: max 10
 *
 * DATABASE_URL 决定连哪个库。
 */
import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
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
  const sql = postgres(connectionString, { max: 10 });
  return drizzle({ client: sql, schema });
}

export const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db = db;
}

export type DB = PostgresJsDatabase<typeof schema>;
