import { z } from 'zod';
import { MAX_CART_LINE_QUANTITY } from './cart-types';

const productRef = z.string().trim().min(1).max(160);
const cartLine = z.object({
  productSlug: productRef.optional(),
  sku: productRef.optional(),
  variantId: z.uuid().optional(),
  quantity: z.number().int().min(1).max(MAX_CART_LINE_QUANTITY),
}).refine((line) => Boolean(line.productSlug || line.sku || line.variantId));

const cents = z.number().int().nonnegative();
const checkoutTotals = z.object({
  subtotalCents: cents,
  shippingCents: cents,
  discountCents: cents,
}).refine((totals) => totals.discountCents <= totals.subtotalCents);

export const checkoutQuote = checkoutTotals.safeExtend({
  items: z.array(z.object({
    productName: z.string().min(1),
    quantity: z.number().int().min(1).max(MAX_CART_LINE_QUANTITY),
    unitPriceCents: cents,
  })).min(1).max(30),
}).refine(({ items, subtotalCents }) =>
  items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0) === subtotalCents);

export const checkoutRequest = z.object({
  checkoutId: z.uuid(),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  lines: z.array(cartLine).min(1).max(30),
  discountCode: z.string().trim().toUpperCase().min(1).max(80).optional(),
  expectedTotals: checkoutTotals.optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequest>;
export type CheckoutTotals = z.infer<typeof checkoutTotals>;
export type CheckoutQuote = z.infer<typeof checkoutQuote>;

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: 'session_changed' | 'quote_changed' | 'discount_unavailable',
    public readonly quote?: CheckoutQuote,
  ) {
    super(message);
  }
}
