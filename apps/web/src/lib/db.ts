/**
 * 数据库连接 (本地 PostgreSQL + Drizzle)
 *
 * 本地开发用 postgres.js 驱动直连本地 PostgreSQL
 * 上线后可切换为 @neondatabase/serverless (或保持 postgres.js 连云数据库)
 *
 * 在 Server Component / Server Action / Route Handler 中 import 使用
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@jewelry/db';

// 开发环境避免热更新重复创建连接
declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // 构建时或无数据库时,返回一个代理 db,查询会优雅失败而非崩溃整个构建
    console.warn('⚠️ DATABASE_URL 未设置 — 数据库功能不可用 (构建时正常,运行时需配置)');
    return null as any;
  }
  const client = postgres(connectionString, { max: 1 });
  return drizzle({ client, schema });
}

export const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db = db;
}

export type DB = typeof db;
