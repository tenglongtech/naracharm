'use client';

import { useState, useEffect } from 'react';

type Review = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  text: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

type ApiResponse = {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
};

function formatRelativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffDays = Math.floor((now - then) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function Stars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={onChange ? 'button' : undefined}
          onClick={() => onChange?.(star)}
          className={`text-lg ${star <= rating ? 'text-gold' : 'text-border'} ${onChange ? 'cursor-pointer hover:scale-110' : ''}`}
          aria-label={onChange ? `Rate ${star} stars` : undefined}
        >
          {star <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: string;
  onSubmitted: () => void;
}) {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <div className="text-center">
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md border border-ink px-6 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-bg"
        >
          Write a Review
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName: authorName.trim(),
          rating,
          title: title.trim() || undefined,
          text: text.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }
      setSubmitted(true);
      setAuthorName('');
      setRating(5);
      setTitle('');
      setText('');
      onSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-bg p-6">
      {submitted ? (
        <p className="text-sm text-green-700">Thank you for your review! It will appear after moderation.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-display text-lg">Write a Review</h3>
          <div>
            <label className="block text-sm font-medium text-ink">Rating *</label>
            <Stars rating={rating} onChange={setRating} />
          </div>
          <div>
            <label htmlFor="review-name" className="block text-sm font-medium text-ink">Name *</label>
            <input id="review-name" type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="review-title" className="block text-sm font-medium text-ink">Title <span className="text-muted">(optional)</span></label>
            <input id="review-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Summary of your review" />
          </div>
          <div>
            <label htmlFor="review-text" className="block text-sm font-medium text-ink">Review *</label>
            <textarea id="review-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} required
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30" placeholder="Share your experience..." />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={submitting}
            className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ReviewsSection({
  productId,
}: {
  productId: string;
}) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    setLoading(true);
    fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const reviews = data?.reviews ?? [];
  const averageRating = data?.averageRating ?? 0;
  const totalReviews = data?.totalReviews ?? 0;

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-14 md:py-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-3xl">Customer Reviews</h2>
          {!loading && totalReviews > 0 && (
            <>
              <p className="text-lg text-gold">
                {Array.from({ length: 5 }, (_, i) =>
                  i < Math.round(averageRating) ? '★' : '☆'
                ).join('')}
                <span className="ml-2 text-sm text-muted">
                  {averageRating.toFixed(1)} · {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </span>
              </p>
            </>
          )}
        </div>

        {loading && <p className="mt-6 text-center text-sm text-muted">Loading reviews...</p>}

        {!loading && reviews.length > 0 && (
          <div className="mt-10 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-bg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-gold text-sm">{Array.from({ length: 5 }, (_, i) => (i < r.rating ? '★' : '☆')).join('')}</div>
                    {r.title && <p className="mt-1 font-medium text-ink">{r.title}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {r.isVerifiedPurchase && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] text-green-600">Verified</span>
                    )}
                    <span className="text-xs text-muted">{formatRelativeDate(r.createdAt)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">{r.text}</p>
                <p className="mt-3 text-xs font-medium text-muted">— {r.authorName}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="mt-10 rounded-lg border border-border bg-bg p-8 text-center text-sm text-muted">
            ✦ Be the first to share your experience with this piece.
          </div>
        )}

        <div className="mt-8">
          <ReviewForm productId={productId} onSubmitted={loadReviews} />
        </div>
      </div>
    </section>
  );
}
