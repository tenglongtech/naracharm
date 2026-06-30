/**
 * Cart types & constants (无 'use server', 客户端可安全 import)
 */

export const FREE_SHIPPING_THRESHOLD_CENTS = 12000; // $120

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
