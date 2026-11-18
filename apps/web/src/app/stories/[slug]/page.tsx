import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { STORIES, getStoryBySlug } from '@/lib/stories-data';
import { getActiveProducts } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';
import { pageMetadata, productShareImage } from '@/lib/page-metadata';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return { title: 'Story not found' };
  const lead = (await getActiveProducts()).find((product) =>
    product.primaryImage && story.relatedProducts.some(({ slug: related }) => related === product.slug));
  return pageMetadata({
    title: `${story.title} — ${story.heritage}`,
    description: story.excerpt,
    path: `/stories/${story.slug}`,
    image: productShareImage(lead),
    article: { publishedTime: story.publishedAt, modifiedTime: story.updatedAt },
  });
}

export default async function StoryDetailPage({ params }: Params) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  const allProducts = await getActiveProducts();
  const related: ProductCard[] = story.relatedProducts
    .map((rp) => {
      const p = allProducts.find((x) => x.slug === rp.slug);
      if (!p) return null;
      return productCard(p);
    })
    .filter(Boolean) as ProductCard[];

  const siteUrl = siteConfig.url;

  // Article JSON-LD (Google 搜索 article rich result 资格)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt,
    datePublished: story.publishedAt,
    dateModified: story.updatedAt,
    author: { '@type': 'Organization', name: 'Nara Charm', url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: 'Nara Charm',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/icon` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/stories/${story.slug}`,
    },
    articleSection: story.heritage,
    keywords: [
      story.heritage,
      'handmade jewelry',
      'Nara Charm',
      'craft story',
      story.heritageSlug,
    ].join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <SiteHeader />
      <main id="main">
        <article>
          {/* Hero */}
          <header className="border-b border-border bg-ink text-bg">
            <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
              <p className="text-6xl">{story.icon}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">
                {story.heritage}
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
                {story.title}
              </h1>
              <p className="mt-5 text-sm text-bg/70">
                {story.readMinutes} min read · {new Date(story.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-4">
            <Breadcrumb
              items={[
                { label: 'Stories', href: '/stories' },
                { label: story.title },
              ]}
            />
          </div>

          {/* Body */}
          <div className="mx-auto max-w-2xl px-4 py-12 md:py-16">
            <p className="font-display text-xl italic leading-relaxed text-ink/85">
              {story.excerpt}
            </p>
            <div className="mt-8 space-y-6 text-base leading-relaxed text-ink/85">
              {story.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <p className="mt-10 font-display text-lg italic text-brand">
              {story.closing}
            </p>
            <Link href={`/collections/${story.relatedCollection.slug}`} className="mt-6 inline-block text-sm text-brand underline underline-offset-4">
              Explore {story.relatedCollection.name} ↗
            </Link>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <section className="border-t border-border bg-surface">
              <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
                <h2 className="font-display text-2xl md:text-3xl">Pieces from this story</h2>
                <p className="mt-2 text-sm text-muted">
                  Wear what you just read about.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
                  {related.map((p) => (
                    <ProductTile key={p.slug} product={p} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Other stories */}
          <section className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl md:text-3xl">Read another</h2>
              <Link href="/stories" className="text-sm text-brand hover:underline">
                All stories →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {STORIES.filter((s) => s.slug !== story.slug)
                .slice(0, 3)
                .map((s) => (
                  <Link
                    key={s.slug}
                    href={`/stories/${s.slug}`}
                    className="group rounded-lg border border-border bg-bg p-6 transition-colors hover:border-brand"
                  >
                    <div className="text-3xl">{s.icon}</div>
                    <p className="mt-3 text-xs uppercase tracking-wider text-gold">{s.heritage}</p>
                    <h3 className="mt-1 font-display text-lg group-hover:text-brand">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{s.excerpt}</p>
                  </Link>
                ))}
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
