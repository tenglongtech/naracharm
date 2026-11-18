import { db } from '@/lib/db';
import { discounts } from '@jewelry/db';
import { eq } from 'drizzle-orm';

export type DiscountValidation = {
  valid: boolean;
  error?: string;
  discount?: Pick<typeof discounts.$inferSelect, 'id' | 'code' | 'type' | 'value' | 'minSubtotalCents'>;
  discountAmountCents?: number;
  freeShipping?: boolean;
};

export function calculateDiscount(
  discount: typeof discounts.$inferSelect | undefined,
  subtotalCents: number,
  now = new Date(),
): DiscountValidation {
  if (!discount || discount.status !== 'active' || (discount.endsAt && discount.endsAt < now)) {
    return { valid: false, error: 'Discount code is invalid or has expired' };
  }
  if (discount.startsAt && discount.startsAt > now) {
    return { valid: false, error: 'Discount code is not active yet' };
  }
  if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
    return { valid: false, error: 'Discount code has reached its usage limit' };
  }
  if (discount.minSubtotalCents && subtotalCents < discount.minSubtotalCents) {
    return {
      valid: false,
      error: `Order must be at least $${(discount.minSubtotalCents / 100).toFixed(2)} to use this code`,
    };
  }

  const rawAmount = discount.type === 'percentage'
    ? Math.round((subtotalCents * discount.value) / 100)
    : discount.type === 'fixed_amount' ? discount.value : 0;
  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minSubtotalCents: discount.minSubtotalCents,
    },
    discountAmountCents: Math.min(subtotalCents, Math.max(0, rawAmount)),
    freeShipping: discount.type === 'free_shipping',
  };
}

export async function validateDiscountCode(code: string, subtotalCents: number): Promise<DiscountValidation> {
  const [discount] = await db.select().from(discounts).where(eq(discounts.code, code.trim().toUpperCase())).limit(1);
  return calculateDiscount(discount, subtotalCents);
}
