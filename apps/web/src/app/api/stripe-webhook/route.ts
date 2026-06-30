import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders, orderLines, customers, orderEvents, inventory } from '@jewelry/db';
import { eq, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { clearCartByToken } from '@/lib/cart-actions';

/**
 * POST /api/stripe-webhook
 * 处理 Stripe 事件 (支付成功 → 创建订单 + 扣库存)
 *
 * ⚠️ 关键: 必须验证 webhook 签名,不能信任前端回调。
 * 本地测试: stripe listen --forward-to localhost:37001/api/stripe-webhook
 *   (前端 37000, 后端 webhook 37001)
 */
export async function POST(req: NextRequest) {
  const body = await req.text(); // 原始 body (签名验证需要)
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      // 占位密钥: 无法验证签名,开发模式跳过验证 (仅本地!)
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET 是占位符,跳过签名验证 (仅开发模式!)');
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  // 处理 checkout 完成
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await handleCheckoutCompleted(session);
  }

  return NextResponse.json({ received: true });
}

/**
 * 支付成功 → 在数据库创建订单 + 扣库存 (reserved → quantity)
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // 幂等: 同一 session 不重复创建
  const existing = await db
    .select({ id: orders.id, number: orders.number })
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, session.id))
    .limit(1);
  if (existing.length > 0) {
    console.log('订单已存在,跳过 (幂等):', session.id, existing[0].number);
    return;
  }

  // 1. 解析 session metadata 中的 lineItems (由 /api/checkout 写入)
  let lineItemsMeta: { variantId: string; productId: string; sku: string; quantity: number; amountCents: number }[] = [];
  try {
    const raw = session.metadata?.lineItems;
    if (raw) lineItemsMeta = JSON.parse(raw);
  } catch (e) {
    console.warn('解析 session.metadata.lineItems 失败,将用 Stripe listLineItems 回退', e);
  }

  // 2. 兜底: 如果 metadata 没有,从 Stripe listLineItems 取
  if (lineItemsMeta.length === 0) {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    lineItemsMeta = lineItems.data.map((li) => ({
      variantId: '',
      productId: '',
      sku: '',
      quantity: li.quantity || 1,
      amountCents: li.amount_total ? Math.round(li.amount_total / (li.quantity || 1)) : 0,
    }));
  }

  // 3. 生成订单号 (PG 序列: 5 位数,不会撞号)
  let orderNumber: string;
  try {
    const [seq] = await db.execute(sql`SELECT nextval('order_number_seq') AS n`);
    const n = (seq as any).n ?? (seq as any)[0]?.n ?? Math.floor(Math.random() * 90000) + 10000;
    orderNumber = `NC-${String(n).padStart(5, '0')}`;
  } catch {
    // 序列不存在时 (旧环境未初始化),回退到 PG crypto 随机
    const [rand] = await db.execute(sql`SELECT floor(random() * 90000 + 10000)::int AS n`);
    const n = (rand as any).n ?? (rand as any)[0]?.n ?? 10000;
    orderNumber = `NC-${String(n).padStart(5, '0')}`;
  }

  // 4. 查/建顾客
  let customerId: string | null = null;
  if (session.customer_email) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, session.customer_email))
      .limit(1);
    if (customer) {
      customerId = customer.id;
    } else {
      const [created] = await db
        .insert(customers)
        .values({ email: session.customer_email })
        .returning();
      customerId = created.id;
    }
  }

  // 5. 计算金额
  const subtotalCents = session.amount_subtotal || 0;
  const totalCents = session.amount_total || 0;
  const shippingCents = Math.max(0, totalCents - subtotalCents);

  // 6. 解析收货地址 (Stripe shipping_details)
  const shipDetails = (session as any).shipping_details;
  const shippingAddress = shipDetails?.address
    ? {
        name: shipDetails.name,
        line1: shipDetails.address.line1,
        line2: shipDetails.address.line2 ?? null,
        city: shipDetails.address.city,
        state: shipDetails.address.state ?? null,
        postal_code: shipDetails.address.postal_code,
        country: shipDetails.address.country,
        phone: shipDetails.phone ?? null,
      }
    : {};

  // 7. 创建订单
  const [order] = await db
    .insert(orders)
    .values({
      number: orderNumber,
      customerId,
      email: session.customer_email || 'unknown',
      status: 'paid',
      paymentStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      currency: session.currency || 'usd',
      subtotalCents,
      shippingCents,
      taxCents: 0,
      discountCents: 0,
      totalCents,
      shippingAddress,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: (session.payment_intent as string) ?? null,
      placedAt: new Date(),
      paidAt: new Date(),
    })
    .returning();

  // 8. 创建订单明细 + 扣库存 (reserved → quantity, 行锁原子操作)
  for (const li of lineItemsMeta) {
    await db.insert(orderLines).values({
      orderId: order.id,
      variantId: li.variantId || null,
      productName: li.sku || 'Product',
      variantName: null,
      sku: li.sku || null,
      unitPriceCents: li.amountCents,
      quantity: li.quantity,
      imageUrl: null,
    });

    // 扣库存: quantity 减 li.quantity, reserved 减 li.quantity
    if (li.variantId) {
      const updated = await db
        .update(inventory)
        .set({
          quantity: sql`greatest(0, ${inventory.quantity} - ${li.quantity})`,
          reserved: sql`greatest(0, ${inventory.reserved} - ${li.quantity})`,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, li.variantId))
        .returning({ variantId: inventory.variantId });
      if (updated.length === 0) {
        console.warn(`扣库存失败: variantId=${li.variantId} 不存在,订单 ${orderNumber} 仍创建`);
      }
    }
  }

  // 9. 记录事件
  await db.insert(orderEvents).values({
    orderId: order.id,
    type: 'payment_received',
    payload: { sessionId: session.id, amount: totalCents },
  });

  console.log(`✓ 订单创建: ${orderNumber} (${order.id}), 金额 $${(totalCents / 100).toFixed(2)} ${order.currency}`);

  // 10. 清空购物车 (按 token)
  const cartToken = session.metadata?.cartToken;
  if (cartToken) {
    try {
      await clearCartByToken(cartToken);
      console.log(`✓ 购物车已清空 (token: ${cartToken.slice(0, 8)}...)`);
    } catch (e) {
      console.warn('清空购物车失败(不阻塞订单):', e);
    }
  }

  // 10. 发订单确认邮件 (无 Resend key 时打到 console)
  try {
    await sendEmail({
      to: order.email,
      subject: `Your Nara Charm Order ${orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber,
        items: lineItemsMeta.map((li) => ({
          name: li.sku || 'Product',
          quantity: li.quantity,
          priceCents: li.amountCents,
        })),
        totalCents: order.totalCents,
        currency: order.currency,
      }),
    });
  } catch (e) {
    console.error('邮件发送失败(不阻塞):', e);
  }
}
