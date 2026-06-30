'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { FormField, Input, Button } from '@/components/ui';
import type { CartView } from '@/lib/cart-types';

/**
 * 结账表单 (client)
 * - 接收 server 拉好的 cart 作为 prop
 * - 填地址 → 创建 Stripe session → 嵌入 Embedded Checkout
 * - 测试卡: 4242 4242 4242 4242
 */
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export function CheckoutForm({ cart }: { cart: CartView }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // 优惠码状态
  const [promoInput, setPromoInput] = useState('');
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    code?: string;
    discountCents?: number;
    freeShipping?: boolean;
    error?: string;
  } | null>(null);

  const discountCents = promoResult?.valid ? (promoResult.discountCents || 0) : 0;
  const adjustedShipping = promoResult?.valid && promoResult.freeShipping ? 0 : cart.shippingCents;
  const adjustedTotal = Math.max(0, cart.totalCents - discountCents - (cart.shippingCents - adjustedShipping));

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoChecking(true);
    setPromoResult(null);
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotalCents: cart.subtotalCents }),
      });
      const data = await res.json();
      setPromoResult(data);
    } catch {
      setPromoResult({ valid: false, error: '验证失败,请重试' });
    } finally {
      setPromoChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...(promoResult?.valid ? { discountCode: promoResult.code } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || '创建支付会话失败');
      }
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (clientSecret) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl">Complete Your Payment</h2>
        <p className="mb-4 text-sm text-muted">
          测试卡号: <code className="rounded bg-bg px-1.5 py-0.5">4242 4242 4242 4242</code> · 任意未来日期 · 任意 CVC
        </p>
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-10">
        {/* 联系信息 */}
        <section>
          <h2 className="font-display text-xl">
            <span className="text-muted">1.</span> Contact
          </h2>
          <div className="mt-4 space-y-4">
            <FormField label="Email" htmlFor="email" required>
              <Input id="email" name="email" type="email" required placeholder="your@email.com" />
            </FormField>
            <FormField label="Phone (optional)" htmlFor="phone" hint="For shipping updates only.">
              <Input id="phone" name="phone" type="tel" placeholder="+1 555 000 0000" />
            </FormField>
          </div>
        </section>

        {/* 收货地址 — Stripe Embedded 会自动收集,这里只展示 placeholder */}
        <section>
          <h2 className="font-display text-xl">
            <span className="text-muted">2.</span> Shipping
          </h2>
          <p className="mt-2 text-sm text-muted">
            Shipping address will be collected on the secure payment page (Stripe).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl">
            <span className="text-muted">3.</span> Payment
          </h2>
          <p className="mt-2 text-sm text-muted">
            点击「Place Order」后跳转至 Stripe 安全的支付页面,支持 Visa / Mastercard / Amex / PayPal / Apple Pay。
          </p>
        </section>
      </div>

      <aside className="h-fit rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">Order Summary</h2>
        <ul className="mt-4 space-y-3">
          {cart.lines.map((it) => (
            <li key={it.lineId} className="flex justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{it.productName}</p>
                <p className="text-xs text-muted">×{it.quantity}</p>
              </div>
              <span className="tabular-nums">${(it.lineTotalCents / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">${(cart.subtotalCents / 100).toFixed(2)}</dd>
          </div>

          {/* 优惠码输入 */}
          <div className="py-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="PROMO CODE"
                className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:border-brand focus:outline-none"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoChecking || !promoInput.trim()}
                className="rounded-md border border-ink px-4 py-2 text-xs font-medium transition-colors hover:bg-ink hover:text-bg disabled:opacity-50"
              >
                {promoChecking ? '…' : 'Apply'}
              </button>
            </div>
            {promoResult?.valid && (
              <p className="mt-1.5 text-xs text-brand">✓ {promoResult.code} applied</p>
            )}
            {promoResult && !promoResult.valid && (
              <p className="mt-1.5 text-xs text-brand">✗ {promoResult.error}</p>
            )}
          </div>

          {/* 折扣行 */}
          {discountCents > 0 && (
            <div className="flex justify-between text-brand">
              <dt>Discount</dt>
              <dd className="tabular-nums">−${(discountCents / 100).toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums text-brand">
              {adjustedShipping === 0 ? 'Free' : `$${(adjustedShipping / 100).toFixed(2)}`}
            </dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 font-display text-lg">
            <dt>Total</dt>
            <dd className="tabular-nums">${(adjustedTotal / 100).toFixed(2)}</dd>
          </div>
        </dl>
        <Button type="submit" className="mt-5 w-full" disabled={loading}>
          {loading ? 'Creating…' : 'Place Order'}
        </Button>
        {error && (
          <p className="mt-2 text-center text-xs text-brand">
            {error}
            <br />
            <span className="text-muted">(Stripe 测试密钥未配置时无法创建支付会话)</span>
          </p>
        )}
        <p className="mt-3 text-center text-xs text-muted">
          By placing your order you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link>.
        </p>
      </aside>
    </form>
  );
}
