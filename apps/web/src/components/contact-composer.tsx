'use client';

import { useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';

const topics = {
  product: 'Question about a piece',
  studio: 'Studio design inquiry',
  order: 'Order inquiry',
  returns: 'Return or exchange',
  wholesale: 'Wholesale inquiry',
  stockists: 'Stockist inquiry',
  other: 'General inquiry',
};

export function ContactComposer({ email, supportEmail }: { email: string; supportEmail: string }) {
  const params = useSearchParams();
  const requested = params.get('topic') ?? '';
  const topic = Object.hasOwn(topics, requested) ? requested : 'other';
  const piece = params.get('piece')?.slice(0, 140) ?? '';
  const order = params.get('order')?.slice(0, 60) ?? '';

  function compose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const selected = String(fields.get('topic')) as keyof typeof topics;
    const address = selected === 'order' || selected === 'returns' ? supportEmail : email;
    const subject = topics[selected];
    if (!subject) return;
    const body = [
      fields.get('piece') && `Piece: ${fields.get('piece')}`,
      fields.get('order') && `Order: ${fields.get('order')}`,
      fields.get('message'),
    ].filter(Boolean).join('\n\n');
    window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const input = 'mt-2 w-full rounded-sm border border-border bg-bg p-3 text-sm';
  return (
    <form onSubmit={compose} className="mt-8 space-y-4 rounded-sm border border-border bg-surface p-5 sm:p-7">
      <label className="block text-sm font-medium">Topic
        <select name="topic" aria-label="Topic" key={topic} defaultValue={topic} className={input}>
          {Object.entries(topics).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">Piece name <span className="font-normal text-muted">(optional)</span>
        <input name="piece" key={piece} defaultValue={piece} maxLength={140} placeholder="Piece name" className={input} />
      </label>
      <label className="block text-sm font-medium">Order number <span className="font-normal text-muted">(optional)</span>
        <input name="order" key={order} defaultValue={order} maxLength={60} className={input} />
      </label>
      <label className="block text-sm font-medium">Message
        <textarea name="message" rows={5} required maxLength={1400} className={input} />
      </label>
      <button type="submit" className="shop-button">Open email draft ↗</button>
      <p className="text-xs leading-5 text-muted">Send the message from your email app.</p>
    </form>
  );
}
