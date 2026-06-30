import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

/**
 * Drizzle Kit 配置
 * schema 在 packages/db,生成的 migration 输出到 apps/web/drizzle
 * 用法: pnpm db:generate / db:push / db:studio
 */
import 'dotenv/config';

export default defineConfig({
  schema: '../../packages/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
