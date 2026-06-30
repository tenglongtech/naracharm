import Stripe from 'stripe';

/**
 * Stripe 服务端实例 (测试模式)
 *
 * 使用 Stripe 官方标准测试密钥 (不会真扣款,用于本地开发)
 * 上线时替换为你自己 Stripe 账号的 sk_live_xxx / pk_live_xxx
 *
 * 测试卡号: 4242 4242 4242 4242 (任意未来日期 + 任意 CVC)
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-08-27.basil' as any,
  typescript: true,
});

/**
 * 创建 Stripe Checkout Session (Embedded Checkout 模式)
 *
 * 调用方传入订单项 (variant/quantity) + 成功/取消 URL,
 * 返回 clientSecret 供前端嵌入支付组件。
 */
export async function createCheckoutSession(params: {
  items: { name: string; amountCents: number; quantity: number; image?: string }[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: params.items.map((it) => ({
      quantity: it.quantity,
      price_data: {
        currency: 'usd',
        unit_amount: it.amountCents,
        product_data: {
          name: it.name,
          ...(it.image ? { images: [it.image] } : {}),
        },
      },
    })),
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    // PayPal + Apple Pay + Google Pay 一起开 (Stripe 在 'card' 模式下自动启用 wallet,加 'paypal' 支持 PayPal)
    payment_method_types: ['card', 'paypal'],
    // 嵌入式 checkout
    ui_mode: 'embedded' as any,
    // 收集地址
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'IT', 'ES', 'NL', 'BE', 'IE', 'SE', 'DK', 'NO', 'FI', 'AT', 'CH', 'PT', 'PL'],
    },
    metadata: {
      source: 'naracharm-web',
      ...(params.metadata ?? {}),
    },
  });

  return {
    clientSecret: session.client_secret,
    sessionId: session.id,
  };
}

/**
 * 根据 session id 查询支付状态 (用于 webhook 验证 / 成功页确认)
 */
export async function getCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}
