'use client';

import { useState, useEffect } from 'react';

type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/comments?articleSlug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleSlug: slug,
          authorName: authorName.trim(),
          email: email.trim() || undefined,
          text: text.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit comment');
      }

      setSubmitted(true);
      setAuthorName('');
      setEmail('');
      setText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="font-display text-2xl">
          Comments{!loading && ` (${comments.length})`}
        </h2>

        {/* Loading state */}
        {loading && (
          <p className="mt-6 text-sm text-muted">Loading comments...</p>
        )}

        {/* No comments */}
        {!loading && comments.length === 0 && (
          <p className="mt-6 text-sm text-muted">No comments yet.</p>
        )}

        {/* Comment list */}
        {comments.length > 0 && (
          <div className="mt-6 space-y-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-border bg-surface p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    {c.authorName}
                  </p>
                  <p className="text-xs text-muted">{formatDate(c.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        <div className="mt-10">
          <h3 className="font-display text-lg text-ink">Leave a Comment</h3>

          {submitted ? (
            <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Thanks! Your comment is awaiting moderation.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="comments-name"
                  className="block text-sm font-medium text-ink"
                >
                  Name *
                </label>
                <input
                  id="comments-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="comments-email"
                  className="block text-sm font-medium text-ink"
                >
                  Email <span className="text-muted">(optional)</span>
                </label>
                <input
                  id="comments-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="comments-text"
                  className="block text-sm font-medium text-ink"
                >
                  Comment *
                </label>
                <textarea
                  id="comments-text"
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="Share your thoughts..."
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
