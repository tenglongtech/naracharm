import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { BLOG_ARTICLES } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Jewelry Meaning & Crystal Guide | Crystal Meanings, Symbolism & Styling',
  description: 'Explore crystal meanings, Tibetan jewelry symbolism, beaded bracelet styling tips, and gemstone care guides. Learn what amethyst, rose quartz, turquoise & more mean.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Jewelry Meaning & Crystal Guide | Nara Charm',
    description: 'Crystal meanings, Tibetan symbolism, styling tips & care guides. Learn the stories behind your stones.',
    type: 'website',
  },
};

export default function BlogPage() {
  const categories = [...new Set(BLOG_ARTICLES.map((a) => a.category))];

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border bg-ink text-bg">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
            <LotusMark className="mx-auto h-10 w-10 text-gold" />
            <h1 className="mt-4 font-display text-4xl md:text-5xl">Jewelry Meaning & Crystal Guide</h1>
            <p className="mx-auto mt-4 max-w-xl text-bg/80">
              Every stone has a story. Explore crystal meanings, ancient symbolism, styling tips, and care guides —
              and discover what your jewelry means.
            </p>
          </div>
        </section>

        {/* 按分类展示文章 */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          {categories.map((cat) => {
            const articles = BLOG_ARTICLES.filter((a) => a.category === cat);
            return (
              <div key={cat} className="mb-12">
                <h2 className="font-display text-2xl text-brand">{cat}</h2>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  {articles.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/blog/${a.slug}`}
                      className="group block rounded-lg border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                    >
                      <p className="text-xs uppercase tracking-wider text-gold">{a.readingTime}</p>
                      <h3 className="mt-2 font-display text-lg group-hover:text-brand">{a.title}</h3>
                      <p className="mt-2 text-sm text-muted">{a.description}</p>
                      <span className="mt-3 inline-block text-sm text-brand group-hover:underline">Read more →</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
