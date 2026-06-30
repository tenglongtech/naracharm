'use server';

/**
 * Cart Server Actions (only async functions exported)
 *
 * 全部操作都通过 guest token (cookie) 识别购物车,
 * 内部自动管理 cookie 写入 + cart/cart_lines 表的 CRUD。
 *
 * 业务规则:
 * - 加购: 数量累加 (同 variant 不重复行)
 * - 库存预占: 加购时把 qty 加到 inventory.reserved,超量拒绝
 * - 减购/移除: 释放预占
 * - 失败: 抛 Error,前端 try/catch 显示
 *
 * Types & constants in ./cart-types (client-safe)
 */

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import {
  products,
  productVariants,
  productImages,
  inventory,
  cartLines,
  carts,
} from '@jewelry/db';
import { and, eq, sql } from 'drizzle-orm';
import { getOrCreateCartToken, ensureCartCookie, getOrCreateCart, getCartByToken } from '@/lib/cart-cookie';
import type { CartView } from './cart-types';
import { FREE_SHIPPING_THRESHOLD_CENTS } from './cart-types';

// ── 读 ──────────────────────────────────────────────────────────────────
/**
 * 读取当前 cart (server component / server action / route handler 都可调用)
 * - 不会创建 cookie,不会创建 cart 行 — 只读
 * - 若无 token 或 cart 不存在,返回空 cart
 */
export async function getCart(): Promise<CartView> {
  const token = await getOrCreateCartToken();
  const cart = await getCartByToken(token);
  if (!cart) {
    return emptyCart();
  }
  return loadCart(cart.id);
}

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

/** 内部: 按 cartId 加载完整购物车视图 */
async function loadCart(cartId: string): Promise<CartView> {
  const rows = await db
    .select({
      lineId: cartLines.id,
      quantity: cartLines.quantity,
      productId: products.id,
      productSlug: products.slug,
      productName: products.name,
      heritage: products.heritage,
      variantId: productVariants.id,
      variantName: productVariants.name,
      sku: productVariants.sku,
      unitPriceCents: sql<number>`coalesce(${productVariants.priceCents}, ${products.basePriceCents})`,
      imageUrl: productImages.url,
      imageIsPrimary: productImages.isPrimary,
      invQuantity: inventory.quantity,
      invReserved: inventory.reserved,
    })
    .from(cartLines)
    .innerJoin(productVariants, eq(productVariants.id, cartLines.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(eq(cartLines.cartId, cartId));

  const lines = rows.map((r) => {
    const available = Math.max(0, (r.invQuantity ?? 0) - (r.invReserved ?? 0));
    return {
      lineId: r.lineId,
      productId: r.productId,
      productSlug: r.productSlug,
      productName: r.productName,
      variantId: r.variantId,
      variantName: r.variantName,
      sku: r.sku,
      unitPriceCents: r.unitPriceCents,
      quantity: r.quantity,
      lineTotalCents: r.unitPriceCents * r.quantity,
      image: r.imageUrl ?? null,
      heritage: r.heritage ?? null,
      stock: available,
    };
  });

  const subtotalCents = lines.reduce((s, l) => s + l.lineTotalCents, 0);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const qualifiesFreeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const toFreeShippingCents = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const shippingCents = subtotalCents === 0 || qualifiesFreeShipping ? 0 : 690;
  const totalCents = subtotalCents + shippingCents;

  return {
    cartId,
    lines,
    subtotalCents,
    itemCount,
    qualifiesFreeShipping,
    toFreeShippingCents,
    shippingCents,
    totalCents,
  };
}

// ── 加购 ────────────────────────────────────────────────────────────────
export async function addToCart(input: { productId: string; quantity?: number }): Promise<CartView> {
  const qty = Math.max(1, Math.floor(input.quantity ?? 1));

  const token = await getOrCreateCartToken();
  await ensureCartCookie(token);
  const cart = await getOrCreateCart(token);

  const [variant] = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.productId, input.productId))
    .limit(1);
  if (!variant) throw new Error('Product has no variant');

  // 库存预占
  const updated = await db
    .update(inventory)
    .set({ reserved: sql`${inventory.reserved} + ${qty}`, updatedAt: new Date() })
    .where(and(eq(inventory.variantId, variant.id), sql`${inventory.quantity} - ${inventory.reserved} >= ${qty}`))
    .returning({ variantId: inventory.variantId });
  if (updated.length === 0) {
    throw new Error('Insufficient stock');
  }

  // 累加 cart_lines
  const [existing] = await db
    .select()
    .from(cartLines)
    .where(and(eq(cartLines.cartId, cart.id), eq(cartLines.variantId, variant.id)))
    .limit(1);
  if (existing) {
    await db
      .update(cartLines)
      .set({ quantity: existing.quantity + qty })
      .where(eq(cartLines.id, existing.id));
  } else {
    await db.insert(cartLines).values({
      cartId: cart.id,
      variantId: variant.id,
      quantity: qty,
    });
  }

  revalidatePath('/cart');
  revalidatePath('/');
  return loadCart(cart.id);
}

// ── 改数量 ──────────────────────────────────────────────────────────────
export async function updateLineQuantity(input: { lineId: string; quantity: number }): Promise<CartView> {
  const qty = Math.max(0, Math.floor(input.quantity));

  const [line] = await db
    .select({
      id: cartLines.id,
      cartId: cartLines.cartId,
      variantId: cartLines.variantId,
      quantity: cartLines.quantity,
    })
    .from(cartLines)
    .where(eq(cartLines.id, input.lineId))
    .limit(1);
  if (!line) throw new Error('Cart line not found');

  const token = await getOrCreateCartToken();
  const cart = await getOrCreateCart(token);
  if (line.cartId !== cart.id) throw new Error('Forbidden');

  const delta = qty - line.quantity;

  if (qty === 0) {
    await db.delete(cartLines).where(eq(cartLines.id, line.id));
    await db
      .update(inventory)
      .set({ reserved: sql`greatest(0, ${inventory.reserved} - ${line.quantity})` })
      .where(eq(inventory.variantId, line.variantId));
  } else if (delta > 0) {
    const updated = await db
      .update(inventory)
      .set({ reserved: sql`${inventory.reserved} + ${delta}` })
      .where(
        and(
          eq(inventory.variantId, line.variantId),
          sql`${inventory.quantity} - ${inventory.reserved} >= ${delta}`
        )
      )
      .returning({ variantId: inventory.variantId });
    if (updated.length === 0) throw new Error('Insufficient stock');
    await db.update(cartLines).set({ quantity: qty }).where(eq(cartLines.id, line.id));
  } else {
    await db
      .update(inventory)
      .set({ reserved: sql`greatest(0, ${inventory.reserved} + ${delta})` })
      .where(eq(inventory.variantId, line.variantId));
    await db.update(cartLines).set({ quantity: qty }).where(eq(cartLines.id, line.id));
  }

  revalidatePath('/cart');
  return loadCart(cart.id);
}

// ── 移除 ────────────────────────────────────────────────────────────────
export async function removeLine(input: { lineId: string }): Promise<CartView> {
  return updateLineQuantity({ lineId: input.lineId, quantity: 0 });
}

// ── 清空 ────────────────────────────────────────────────────────────────
export async function clearCart(): Promise<CartView> {
  const token = await getOrCreateCartToken();
  const cart = await getOrCreateCart(token);

  const lines = await db.select().from(cartLines).where(eq(cartLines.cartId, cart.id));
  for (const l of lines) {
    await db
      .update(inventory)
      .set({ reserved: sql`greatest(0, ${inventory.reserved} - ${l.quantity})` })
      .where(eq(inventory.variantId, l.variantId));
  }
  await db.delete(cartLines).where(eq(cartLines.cartId, cart.id));

  revalidatePath('/cart');
  return loadCart(cart.id);
}

// ── 内部:webhook 付款成功后清空 (不重设 cookie) ─────────────────────────
export async function clearCartByToken(token: string): Promise<void> {
  const [cart] = await db.select().from(carts).where(eq(carts.guestToken, token)).limit(1);
  if (!cart) return;
  await db.delete(cartLines).where(eq(cartLines.cartId, cart.id));
  await db.delete(carts).where(eq(carts.id, cart.id));
}
