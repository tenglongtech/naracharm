'use server';

/**
 * 优惠码验证 + 应用 (Server Actions)
 */
import { db } from '@/lib/db';
import { discounts } from '@jewelry/db';
import { and, eq, lte, gte, sql } from 'drizzle-orm';

export type DiscountValidation = {
  valid: boolean;
  error?: string;
  discount?: {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    minSubtotalCents: number | null;
  };
  discountAmountCents?: number;
  freeShipping?: boolean;
};

/**
 * 验证优惠码 (前端输入后调用)
 */
export async function validateDiscountCode(code: string, subtotalCents: number): Promise<DiscountValidation> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: '请输入优惠码' };
  }

  const [discount] = await db
    .select()
    .from(discounts)
    .where(and(eq(discounts.code, trimmed), eq(discounts.status, 'active')))
    .limit(1);

  if (!discount) {
    return { valid: false, error: '优惠码不存在或已失效' };
  }

  // 检查有效期
  const now = new Date();
  if (discount.startsAt && discount.startsAt > now) {
    return { valid: false, error: '优惠码尚未开始' };
  }
  if (discount.endsAt && discount.endsAt < now) {
    return { valid: false, error: '优惠码已过期' };
  }

  // 检查使用次数
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return { valid: false, error: '优惠码已达使用上限' };
  }

  // 检查最低消费
  if (discount.minSubtotalCents && subtotalCents < discount.minSubtotalCents) {
    return {
      valid: false,
      error: `需满 $${(discount.minSubtotalCents / 100).toFixed(2)} 才可使用`,
    };
  }

  // 计算折扣金额
  let discountAmountCents = 0;
  let freeShipping = false;
  if (discount.type === 'percentage') {
    discountAmountCents = Math.round((subtotalCents * discount.value) / 100);
  } else if (discount.type === 'fixed_amount') {
    discountAmountCents = Math.min(discount.value, subtotalCents);
  } else if (discount.type === 'free_shipping') {
    freeShipping = true;
  }

  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minSubtotalCents: discount.minSubtotalCents,
    },
    discountAmountCents,
    freeShipping,
  };
}
