import { NextRequest, NextResponse } from 'next/server';
import { validateDiscountCode } from '@/lib/discount-actions';

/**
 * POST /api/discount/validate
 * 验证优惠码,返回折扣信息
 * body: { code, subtotalCents }
 */
export async function POST(req: NextRequest) {
  const { code, subtotalCents } = await req.json();
  if (!code) return NextResponse.json({ valid: false, error: '缺少优惠码' }, { status: 400 });
  const result = await validateDiscountCode(code, subtotalCents || 0);
  return NextResponse.json(result);
}
