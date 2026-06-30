import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getCart } from '@/lib/cart-actions';
import { getOrCreateCartToken, getOrCreateCart } from '@/lib/cart-cookie';
import { db } from '@/lib/db';
import { products, productVariants, inventory } from '@jewelry/db';
import { and, eq, sql } from 'drizzle-orm';

/**
 * POST /api/checkout
 * 创建 Stripe Embedded Checkout session
 *
 * 流程:
 *  1. 从 cookie 中的 cart_token 读取 cart_lines
 *  2. 实时校验库存 (防止预占被释放后超卖)
 *  3. 透传 line items 到 Stripe session.metadata (webhook 用)
 *  4. 失败回滚: 释放预占
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email: string | undefined = body.email;

    // 1. 读 cart
    const cart = await getCart();
    if (cart.lines.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 2. 实时校验库存 + 收集 line items
    type LineItem = { name: string; amountCents: number; quantity: number; variantId: string; productId: string; sku: string };
    const lineItems: LineItem[] = [];
    for (const l of cart.lines) {
      // 二次校验 (cart_actions 已经预占过 reserved,这里再确认)
      const [row] = await db
        .select({
          productId: products.id,
          productName: products.name,
          variantId: productVariants.id,
          variantName: productVariants.name,
          variantPriceCents: productVariants.priceCents,
          basePriceCents: products.basePriceCents,
          invQuantity: inventory.quantity,
          invReserved: inventory.reserved,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
        .where(eq(productVariants.id, l.variantId))
        .limit(1);

      if (!row) {
        return NextResponse.json({ error: `Product not found for cart line` }, { status: 404 });
      }
      const available = Math.max(0, (row.invQuantity ?? 0) - (row.invReserved ?? 0));
      if (l.quantity > available) {
        return NextResponse.json(
          { error: `Insufficient stock for ${l.productName}` },
          { status: 409 }
        );
      }

      lineItems.push({
        name: l.productName + (l.variantName && l.variantName !== 'Default' ? ` · ${l.variantName}` : ''),
        amountCents: row.variantPriceCents ?? row.basePriceCents,
        quantity: l.quantity,
        variantId: l.variantId,
        productId: l.productId,
        sku: l.sku,
      });
    }

    // 3. 创建 Stripe session
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:37000';
    // 透传 cart token,webhook 用它清空购物车
    const cartToken = await getOrCreateCartToken();
    const cartRow = await getOrCreateCart(cartToken);

    let result;
    try {
      // 可选: 处理优惠码 (验证后作为折扣项)
      const { discountCode } = body;
      let discountInfo: { code: string; amountCents: number } | null = null;
      if (discountCode) {
        const { validateDiscountCode } = await import('@/lib/discount-actions');
        const subtotalCents = lineItems.reduce((s, li) => s + li.amountCents * li.quantity, 0);
        const v = await validateDiscountCode(discountCode, subtotalCents);
        if (v.valid && v.discountAmountCents) {
          discountInfo = { code: v.discount!.code, amountCents: v.discountAmountCents };
        }
      }

      const items = lineItems.map((li) => ({
        name: li.name,
        amountCents: li.amountCents,
        quantity: li.quantity,
      }));
      // 折扣作为负数行
      if (discountInfo) {
        items.push({
          name: `Discount (${discountInfo.code})`,
          amountCents: -discountInfo.amountCents,
          quantity: 1,
        });
      }

      result = await createCheckoutSession({
        items,
        successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/cart`,
        customerEmail: email,
        metadata: {
          source: 'naracharm-web',
          cartToken: cartToken,
          cartId: cartRow.id,
          ...(discountInfo ? { discountCode: discountInfo.code } : {}),
          lineItems: JSON.stringify(
            lineItems.map((li) => ({
              variantId: li.variantId,
              productId: li.productId,
              sku: li.sku,
              quantity: li.quantity,
              amountCents: li.amountCents,
            }))
          ),
        },
      });
    } catch (stripeErr: any) {
      throw stripeErr;
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      sessionId: result.sessionId,
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
