'use client';

/**
 * 前端 localStorage 购物车 (替代 DB-backed server actions)
 *
 * 静态站用: 购物车完全在前端 localStorage,不查数据库。
 * 结账时一次性把 cart lines 提交到后端 API。
 *
 * Types in ./cart-types (共享,前后端通用)
 */
import type { CartView, CartLineView } from './cart-types';
import { cartLineQuantityLimit, FREE_SHIPPING_THRESHOLD_CENTS, MAX_CART_LINE_QUANTITY, standardShippingCents } from './cart-types';

const STORAGE_KEY = 'naracharm_cart';
let inMemoryCart: CartLineView[] | null = null;

export type CartAddInput = {
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string | null;
  sku: string;
  unitPriceCents: number;
  image: string | null;
  heritage: string | null;
  stock: number;
  quantity?: number;
};

function emptyCart(): CartView {
  return {
    cartId: '',
    lines: [],
    subtotalCents: 0,
    itemCount: 0,
    qualifiesFreeShipping: false,
    toFreeShippingCents: FREE_SHIPPING_THRESHOLD_CENTS,
    shippingCents: 0,
    totalCents: 0,
  };
}

function computeTotals(lines: CartLineView[]): CartView {
  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const qualifiesFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const toFreeShippingCents = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const shippingCents = standardShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;
  return {
    cartId: '',
    lines,
    subtotalCents,
    itemCount,
    qualifiesFreeShipping,
    toFreeShippingCents,
    shippingCents,
    totalCents,
  };
}

function readRaw(): CartLineView[] {
  if (typeof window === 'undefined') return [];
  if (inMemoryCart !== null) return inMemoryCart.map((line) => ({ ...line }));
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const lines = raw ? JSON.parse(raw) as CartLineView[] : [];
    if (!Array.isArray(lines)) return [];
    return lines.map((line) => line.quantity > MAX_CART_LINE_QUANTITY ? {
      ...line, quantity: MAX_CART_LINE_QUANTITY, lineTotalCents: line.unitPriceCents * MAX_CART_LINE_QUANTITY,
    } : line);
  } catch {
    return [];
  }
}

function writeRaw(lines: CartLineView[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    inMemoryCart = null;
  } catch {
    inMemoryCart = lines.map((line) => ({ ...line }));
  }
}

// ── 订阅 (供 header 徽标等跨组件响应) ───────────────────────────────────
type Listener = (cart: CartView) => void;
const listeners = new Set<Listener>();

function emit(cart: CartView) {
  listeners.forEach((fn) => fn(cart));
}

export function subscribeToCart(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ── 读 ──────────────────────────────────────────────────────────────────
export function getLocalCart(): CartView {
  return computeTotals(readRaw());
}

// ── 加购 ────────────────────────────────────────────────────────────────
export function addToLocalCart(input: CartAddInput): CartView {
  const qty = Math.max(1, Math.floor(input.quantity ?? 1));
  const limit = cartLineQuantityLimit(input.stock);
  const lines = readRaw();

  const existing = lines.find((line) => line.variantId === input.variantId)
    ?? lines.find((line) => line.productId === input.productId && line.variantId === line.productId);
  if (existing) {
    const quantity = Math.min(existing.quantity + qty, limit);
    Object.assign(existing, input, { quantity, lineTotalCents: input.unitPriceCents * quantity });
  } else {
    const quantity = Math.min(qty, limit);
    const line: CartLineView = {
      lineId: `${input.variantId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: input.productId,
      productSlug: input.productSlug,
      productName: input.productName,
      variantId: input.variantId,
      variantName: input.variantName,
      sku: input.sku,
      unitPriceCents: input.unitPriceCents,
      quantity,
      lineTotalCents: input.unitPriceCents * quantity,
      image: input.image,
      heritage: input.heritage,
      stock: input.stock,
    };
    lines.push(line);
  }

  writeRaw(lines);
  const cart = computeTotals(lines);
  emit(cart);
  return cart;
}

// ── 改数量 ──────────────────────────────────────────────────────────────
export function updateLocalLineQuantity(lineId: string, quantity: number): CartView {
  const lines = readRaw();
  const line = lines.find((l) => l.lineId === lineId);
  if (!line) return getLocalCart();

  const qty = Math.max(0, Math.floor(quantity));
  if (qty === 0) {
    return removeLocalLine(lineId);
  }
  line.quantity = Math.min(qty, cartLineQuantityLimit(line.stock));
  line.lineTotalCents = line.unitPriceCents * line.quantity;
  writeRaw(lines);
  const cart = computeTotals(lines);
  emit(cart);
  return cart;
}

// ── 移除 ────────────────────────────────────────────────────────────────
export function removeLocalLine(lineId: string): CartView {
  const lines = readRaw().filter((l) => l.lineId !== lineId);
  writeRaw(lines);
  const cart = computeTotals(lines);
  emit(cart);
  return cart;
}

// ── 清空 ────────────────────────────────────────────────────────────────
export function clearLocalCart(): CartView {
  writeRaw([]);
  const cart = emptyCart();
  emit(cart);
  return cart;
}

export function removePurchasedCartLines(purchased: Pick<CartLineView, 'lineId' | 'quantity'>[]): CartView {
  const quantities = new Map(purchased.map(({ lineId, quantity }) => [lineId, quantity]));
  const lines = readRaw().flatMap((line) => {
    const quantity = line.quantity - (quantities.get(line.lineId) ?? 0);
    return quantity > 0 ? [{ ...line, quantity, lineTotalCents: line.unitPriceCents * quantity }] : [];
  });
  writeRaw(lines);
  const cart = computeTotals(lines);
  emit(cart);
  return cart;
}
