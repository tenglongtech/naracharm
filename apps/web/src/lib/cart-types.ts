/**
 * Cart types & constants (无 'use server', 客户端可安全 import)
 */

export { FREE_SHIPPING_THRESHOLD_CENTS, STANDARD_SHIPPING_CENTS, standardShippingCents } from './store-policies';
export const MAX_CART_LINE_QUANTITY = 99;

export function cartLineQuantityLimit(stock: number) {
  return Math.min(stock, MAX_CART_LINE_QUANTITY);
}

export function orderItemLabel(productName: string, variantName?: string | null) {
  const name = variantName?.trim();
  return name && !/^(default|standard)$/i.test(name) ? `${productName} — ${name}` : productName;
}

export type CartLineView = {
  lineId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string | null;
  sku: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  image: string | null;
  heritage: string | null;
  stock: number;
};

export type CartView = {
  cartId: string;
  lines: CartLineView[];
  subtotalCents: number;
  itemCount: number;
  qualifiesFreeShipping: boolean;
  toFreeShippingCents: number;
  shippingCents: number;
  totalCents: number;
};
