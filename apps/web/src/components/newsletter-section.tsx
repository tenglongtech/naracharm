'use client';

import { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

function makeUuidV4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [submissionId] = useState(() => makeUuidV4());

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = email.trim();
    if (!cleaned || status === 'submitting') return;

    if (!siteConfig.inquiryFormEnabled) {
      setStatus('done');
      return;
    }

    setStatus('submitting');
    try {
      const body = new URLSearchParams({
        id: submissionId,
        topic: 'other',
        email: cleaned,
        message: 'Studio dispatch subscription request from storefront footer.',
      });
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok || res.status === 409) {
        setStatus('done');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section aria-labelledby="newsletter-title" className="border-t border-border bg-[#efe7da] text-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:px-8 md:py-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Studio Dispatch</p>
          <h2 id="newsletter-title" className="mt-2 font-display text-3xl leading-tight tracking-tight md:text-4xl">
            Small-batch releases &amp; craft notes.
          </h2>
          <p className="mt-2.5 max-w-lg text-sm leading-6 text-muted">
            Receive occasional notes when new pieces move from studio study to finished stock, alongside material and care guides.
          </p>
        </div>

        <div>
          {status === 'done' ? (
            <div role="status" className="border border-border bg-bg px-5 py-4 text-sm leading-6 text-ink">
              <p className="font-medium text-brand">You’re on the studio list.</p>
              <p className="mt-1 text-muted">We’ll write only when new pieces or studio dispatches are ready.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Enter your email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  className="min-h-12 flex-1 border border-border bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/65 focus:border-brand focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#873e34] px-6 py-3 text-sm font-semibold text-bg transition-colors hover:bg-[#632d26] disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Joining…' : 'Join the list'} <span aria-hidden="true">→</span>
                </button>
              </div>
              {status === 'error' ? (
                <p role="alert" className="text-xs text-brand">
                  Could not save right now. You can also reach us on the{' '}
                  <Link prefetch={false} href="/contact" className="underline underline-offset-4">contact page</Link>.
                </p>
              ) : (
                <p className="text-xs text-muted">
                  Occasional dispatches only. See our{' '}
                  <Link prefetch={false} href="/privacy" className="underline underline-offset-4 hover:text-brand">privacy policy</Link>.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
