'use client';
import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      // In production, POST to your email service
    }
  };

  if (submitted) {
    return (
      <section className="bg-ink text-bg">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl">You're in! 🌙</h2>
          <p className="mt-3 text-bg/75">Welcome to the Nara Charm circle. Check your inbox for a welcome note.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ink text-bg">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Stay Connected</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">Join Our Circle</h2>
        <p className="mt-3 text-bg/75">New arrivals, exclusive stories, and early access — once a month, no spam.</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 rounded-md bg-bg/10 px-4 py-3 text-sm text-bg placeholder:text-bg/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <button type="submit" className="rounded-md bg-gold px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold/90">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
