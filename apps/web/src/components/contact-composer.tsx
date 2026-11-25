'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';

const topics = {
  product: 'Piece, availability or delivery',
  studio: 'Studio design inquiry',
  order: 'Order inquiry',
  returns: 'Return or exchange',
  wholesale: 'Wholesale inquiry',
  stockists: 'Stockist inquiry',
  privacy: 'Privacy request',
  other: 'General inquiry',
};

const inquiryTimeoutMs = 12_000;

export function ContactComposer({ email, supportEmail, submitOnline }: { email: string; supportEmail: string; submitOnline: boolean }) {
  const params = useSearchParams();
  const requested = params.get('topic') ?? '';
  const topic = Object.hasOwn(topics, requested) ? requested : 'other';
  const piece = params.get('piece')?.slice(0, 140) ?? '';
  const message = params.get('message')?.slice(0, 1400) ?? '';
  const order = params.get('order')?.slice(0, 60) ?? '';
  const [topicDraft, setTopicDraft] = useState({ params, value: topic });
  const selectedTopic = topicDraft.params === params ? topicDraft.value : topic;
  const showOrder = selectedTopic === 'order' || selectedTopic === 'returns';
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const submission = useRef<{ draft: string; id: string }>(null);
  const busy = useRef(false);

  async function compose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const fields = new FormData(event.currentTarget);
    if (submitOnline) {
      busy.current = true;
      setSending(true);
      setError('');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), inquiryTimeoutMs);
      try {
        const body = new URLSearchParams();
        for (const [name, value] of fields) body.set(name, String(value).trim());
        const draft = body.toString();
        if (submission.current?.draft !== draft) submission.current = { draft, id: crypto.randomUUID() };
        body.set('id', submission.current.id);
        const result = await fetch('/api/inquiries', { method: 'POST', body, signal: controller.signal });
        if (result.ok) {
          const receipt = await result.json();
          if (receipt.reference !== submission.current.id) throw new Error('Missing inquiry receipt');
          setReference(receipt.reference);
        } else if (result.status === 400 || result.status === 413) {
          setError('Check your email address and message, then try again.');
        } else if (result.status === 429) {
          setError('Too many inquiries were submitted from this connection. Please try again later.');
        } else {
          setError('We could not confirm your inquiry. Your message is still here. Please try again.');
        }
      } catch {
        setError('We could not confirm your inquiry. Your message is still here. Please try again.');
      } finally {
        clearTimeout(timer);
        busy.current = false;
        setSending(false);
      }
      return;
    }
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
  if (reference) {
    return (
      <section className="mt-8 space-y-3 rounded-sm border border-border bg-surface p-5 sm:p-7" role="status"
        tabIndex={-1} ref={(panel) => { panel?.focus(); }}>
        <h2 className="font-display text-3xl">Inquiry received</h2>
        <p className="text-sm text-muted">Save this reference for your records.</p>
        <p className="break-all font-mono text-sm">{reference}</p>
        <button type="button" className="shop-button" onClick={() => {
          submission.current = null;
          setReference('');
          setTopicDraft({ params, value: topic });
        }}>Send another inquiry</button>
      </section>
    );
  }
  return (
    <form onSubmit={compose} method="post" aria-busy={sending} className="mt-8 space-y-4 rounded-sm border border-border bg-surface p-5 sm:p-7">
      <label className="block text-sm font-medium">Topic
        <select name="topic" aria-label="Topic" value={selectedTopic} onChange={(event) => setTopicDraft({ params, value: event.target.value })} className={input}>
          {Object.entries(topics).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </label>
      {submitOnline && <label className="block text-sm font-medium">Email address
        <input name="email" type="email" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={254} required className={input} />
      </label>}
      <label className="block text-sm font-medium">Piece name <span className="font-normal text-muted">(optional)</span>
        <input name="piece" key={piece} defaultValue={piece} autoComplete="off" maxLength={140} className={input} />
      </label>
      <label hidden={!showOrder} className={showOrder ? 'block text-sm font-medium' : undefined}>Order number <span className="font-normal text-muted">(optional)</span>
        <input name="order" disabled={!showOrder} key={order} defaultValue={order} spellCheck={false} autoComplete="off" maxLength={60} className={input} />
      </label>
      <label className="block text-sm font-medium">Message
        <textarea name="message" key={message} defaultValue={message} rows={5} required maxLength={1400} className={input} />
      </label>
      {submitOnline && <div hidden>
        <label>Leave this field empty<input name="website" autoComplete="off" tabIndex={-1} /></label>
      </div>}
      <button type="submit" disabled={sending} className="shop-button">
        {submitOnline ? sending ? 'Sending…' : 'Send inquiry' : 'Open email draft ↗'}
      </button>
      {error && <p role="alert" className="text-sm text-ink">{error}</p>}
      <p className="text-xs leading-5 text-muted">{submitOnline ? <>
        We use your email address to follow up on your inquiry. Keep card and password details out of your message.{' '}
        <Link href="/privacy" className="underline underline-offset-4">Privacy policy</Link>
      </> : 'Send the message from your email app.'}</p>
    </form>
  );
}
