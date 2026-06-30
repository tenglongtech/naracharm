import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { STORIES } from '@/lib/stories-data';

export const metadata: Metadata = {
  title: 'Stories in Every Piece — The Craft Behind Nara Charm',
  description:
    'The silversmiths, the weavers, the braiders, and the meaning woven into every Nara Charm piece. Stories from Tibet, Mongolia, southwest China, the Han literati, and Thailand.',
  alternates: { canonical: '/stories' },
  openGraph: {
    title: 'Stories in Every Piece | Nara Charm',
    description:
      'The craft behind every Nara Charm piece — the silversmiths, the weavers, the meaning.',
    url: '/stories',
    type: 'website',
  },
};

export default function StoriesIndexPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Stories in Every Piece',
    description: 'The craft stories behind every Nara Charm piece.',
    url: `${siteUrl}/stories`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: STORIES.length,
      itemListElement: STORIES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/stories/${s.slug}`,
        name: s.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <SiteHeader />
      <main id="main">
        <section className="border-b border-border bg-ink text-bg">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Stories in Every Piece</p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
              Every charm carries a tale
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-bg/80">
              Behind every piece is a craft, a place, and a meaning. Here are the stories
              of the silversmiths, the weavers, the braiders, and the stones they chose.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumb items={[{ label: 'Stories' }]} />
        </div>

        <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((s) => (
              <article
                key={s.slug}
                className="group flex flex-col rounded-lg border border-border bg-surface p-7 transition-colors hover:border-brand"
              >
                <div className="text-4xl">{s.icon}</div>
                <p className="mt-3 text-xs uppercase tracking-wider text-gold">
                  {s.heritage}
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight group-hover:text-brand">
                  <Link href={`/stories/${s.slug}`}>{s.title}</Link>
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{s.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted">
                  <span>{s.readMinutes} min read</span>
                  <span>{new Date(s.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <Link
                  href={`/stories/${s.slug}`}
                  className="mt-4 inline-block text-sm text-brand hover:underline"
                >
                  Read the story →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center md:py-20">
            <h2 className="font-display text-3xl md:text-4xl">Read the craft behind every piece</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              How a piece is made, where the materials come from, and the four principles
              we will not compromise on.
            </p>
            <Link
              href="/our-craft"
              className="mt-7 inline-block rounded-md bg-brand px-7 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              HOW EVERY CHARM IS MADE
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
