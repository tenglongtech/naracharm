'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormField, Input, Button } from '@/components/ui';

/**
 * 结账表单 (客户端演示)
 * Phase 3: 替换为 Server Action 创建 Stripe Checkout Session,然后嵌入 Embedded Checkout。
 * 当前提交 → 跳转到 /checkout/success (演示流程)。
 */
const SAMPLE_ITEMS = [
  { name: 'Red Agate Blessing Bracelet', variant: 'Medium (17cm)', priceCents: 4200, qty: 1 },
  { name: 'Thai Silk Phone Charm', variant: 'Emerald', priceCents: 2800, qty: 2 },
];

export function CheckoutForm() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'applepay'>('card');

  const subtotalCents = SAMPLE_ITEMS.reduce((s, it) => s + it.priceCents * it.qty, 0);
  const shippingCents = 0; // 演示:已满免邮
  const totalCents = subtotalCents + shippingCents;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Phase 3: 调 Server Action 创建 Stripe session,跳转 Stripe Embedded Checkout。
    // 现在演示:直接跳成功页。
    router.push('/checkout/success');
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
      {/* 左:表单 */}
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

        {/* 收货地址 */}
        <section>
          <h2 className="font-display text-xl">
            <span className="text-muted">2.</span> Shipping Address
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" htmlFor="firstName" required>
              <Input id="firstName" name="firstName" required autoComplete="given-name" />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required>
              <Input id="lastName" name="lastName" required autoComplete="family-name" />
            </FormField>
            <div className="sm:col-span-2">
              <FormField label="Address" htmlFor="address1" required>
                <Input id="address1" name="address1" required autoComplete="address-line1" placeholder="Street and number" />
              </FormField>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Apartment, suite, etc. (optional)" htmlFor="address2">
                <Input id="address2" name="address2" autoComplete="address-line2" />
              </FormField>
            </div>
            <FormField label="City" htmlFor="city" required>
              <Input id="city" name="city" required autoComplete="address-level2" />
            </FormField>
            <FormField label="State / Province" htmlFor="state">
              <Input id="state" name="state" autoComplete="address-level1" />
            </FormField>
            <FormField label="Postal Code" htmlFor="zip" required>
              <Input id="zip" name="zip" required autoComplete="postal-code" />
            </FormField>
            <FormField label="Country" htmlFor="country" required>
              <select id="country" name="country" required className="w-full rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-brand focus:outline-none">
                <option value="">Select…</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>France</option>
                <option>Canada</option>
                <option>Australia</option>
                <option>Other</option>
              </select>
            </FormField>
          </div>
        </section>

        {/* 支付方式 */}
        <section>
          <h2 className="font-display text-xl">
            <span className="text-muted">3.</span> Payment
          </h2>
          <p className="mt-1 text-xs text-muted">
            Phase 3: Stripe Embedded Checkout will render secure payment fields here.
          </p>
          <div className="mt-4 space-y-2">
            {([
              ['card', '💳 Credit / Debit Card', 'Visa, Mastercard, Amex'],
              ['paypal', '🅿️ PayPal', 'Pay with your PayPal account'],
              ['applepay', '🍎 Apple Pay', 'One-tap on supported devices'],
            ] as const).map(([id, label, desc]) => (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 transition-colors ${
                  paymentMethod === id ? 'border-brand bg-brand/5' : 'border-border hover:border-ink'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={id}
                  checked={paymentMethod === id}
                  onChange={() => setPaymentMethod(id)}
                  className="text-brand"
                />
                <span className="text-sm font-medium">{label}</span>
                <span className="ml-auto text-xs text-muted">{desc}</span>
              </label>
            ))}
          </div>
          {/* 卡片字段占位 (Phase 3 由 Stripe Elements 接管) */}
          {paymentMethod === 'card' && (
            <div className="mt-4 grid gap-4 rounded-md border border-dashed border-border bg-bg/50 p-4 text-sm text-muted sm:grid-cols-2">
              <p className="sm:col-span-2">Stripe payment fields will appear here securely.</p>
            </div>
          )}
        </section>
      </div>

      {/* 右:订单摘要 (粘性) */}
      <aside className="h-fit rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl">Order Summary</h2>
        <ul className="mt-4 space-y-3">
          {SAMPLE_ITEMS.map((it, i) => (
            <li key={i} className="flex justify-between gap-3 text-sm">
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-xs text-muted">{it.variant} · ×{it.qty}</p>
              </div>
              <span className="tabular-nums">${((it.priceCents * it.qty) / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">${(subtotalCents / 100).toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums text-brand">Free</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-3 font-display text-lg">
            <dt>Total</dt>
            <dd className="tabular-nums">${(totalCents / 100).toFixed(2)}</dd>
          </div>
        </dl>
        <Button type="submit" className="mt-5 w-full">Place Order</Button>
        <p className="mt-3 text-center text-xs text-muted">
          By placing your order you agree to our{' '}
          <Link href="/terms" className="underline">Terms</Link>.
        </p>
      </aside>
    </form>
  );
}
