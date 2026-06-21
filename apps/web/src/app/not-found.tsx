import Link from 'next/link';
import { LotusMark } from '@/components/site-chrome';

/** 全局 404 页 - 替代 Next.js 默认 */
export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center">
      <LotusMark className="h-12 w-12 text-brand" />
      <p className="mt-6 font-display text-6xl text-brand">404</p>
      <h1 className="mt-3 font-display text-2xl md:text-3xl">This page wandered off the road.</h1>
      <p className="mt-3 max-w-md text-muted">
        Like a traveler on the steppe, this page seems to have lost its way.
        Let&apos;s get you back to familiar ground.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-md bg-brand px-7 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5">
          Back to Home
        </Link>
        <Link href="/collections" className="rounded-md border border-ink px-7 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-bg">
          Browse Collections
        </Link>
      </div>
    </main>
  );
}
