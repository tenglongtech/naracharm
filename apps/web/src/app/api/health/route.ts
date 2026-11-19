import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const dynamic = 'force-dynamic';

function status(db: 'up' | 'down', schema: 'ready' | 'pending' | 'unknown') {
  const ok = db === 'up' && schema === 'ready';
  return NextResponse.json({ ok, service: 'naracharm-api', db, schema, time: new Date().toISOString() }, {
    status: ok ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return status('down', 'unknown');

  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(url, { max: 1, connect_timeout: 2, connection: { statement_timeout: 1500 } });
    const [result] = await sql<{ ready: boolean }[]>`
      SELECT
        to_regclass('public.session') IS NOT NULL
        AND to_regclass('public.blog_comments') IS NOT NULL
        AND to_regclass('public.product_reviews') IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM pg_catalog.pg_sequences
          WHERE schemaname = 'public' AND sequencename = 'order_number_seq'
        )
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'product_images'
            AND column_name = 'is_product_photo' AND data_type = 'boolean'
        )
        AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'orders'
            AND column_name = 'account_user_id' AND data_type = 'text'
        )
        AND 2 = (
          SELECT count(*) FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'variant_images'
            AND column_name IN ('is_primary', 'is_product_photo') AND data_type = 'boolean'
        ) AS ready`;
    return status('up', result?.ready ? 'ready' : 'pending');
  } catch {
    return status('down', 'unknown');
  } finally {
    await sql?.end({ timeout: 0 });
  }
}
