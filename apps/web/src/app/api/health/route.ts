import { NextResponse } from 'next/server';

/**
 * GET /api/health — 健康检查 (供 Caddy/uptime 探活)
 * 返回 DB 连接状态
 */
export async function GET() {
  let dbStatus: 'up' | 'down' = 'up';
  try {
    // postgres-js 驱动直接探测连接
    const { default: postgres } = await import('postgres');
    const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
    await sql`SELECT 1`;
    await sql.end();
  } catch {
    dbStatus = 'down';
  }
  return NextResponse.json({
    ok: dbStatus === 'up',
    service: 'naracharm-api',
    db: dbStatus,
    time: new Date().toISOString(),
  });
}
