import { NextResponse } from 'next/server';

/**
 * GET /api/health — 健康检查 (供 Caddy/uptime 探活)
 * 返回 DB 连接状态
 */
export async function GET() {
  let dbStatus: 'up' | 'down' = 'up';
  try {
    const { db } = await import('@/lib/db');
    if (!db) throw new Error('no db');
    await db.execute?.(/* sql */ `SELECT 1`);
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
