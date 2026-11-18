import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateDiscountCode } from '@/lib/discount-actions';
import { storefrontHeaders, storefrontPreflight, unsupportedOrigin } from '@/lib/checkout-origin';

const requestSchema = z.object({
  code: z.string().trim().min(1).max(80),
  subtotalCents: z.number().int().nonnegative().max(100_000_000),
});

export const OPTIONS = storefrontPreflight;

export async function POST(request: Request) {
  const headers = storefrontHeaders(request);
  if (unsupportedOrigin(request, headers)) return NextResponse.json({ error: 'Origin is not allowed' }, { headers, status: 403 });

  const input = requestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ valid: false, error: 'Enter a discount code and a valid subtotal' }, { status: 400, headers });
  }
  const result = await validateDiscountCode(input.data.code, input.data.subtotalCents);
  return NextResponse.json({
    valid: result.valid,
    error: result.error,
    code: result.discount?.code,
    discountCents: result.discountAmountCents,
    freeShipping: result.freeShipping,
  }, { headers });
}
