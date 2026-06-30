export const dynamic = "force-dynamic";
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { getAllCollections, getActiveProducts } from '@/lib/storefront';
import { CATEGORIES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'All Collections',
  description: 'Explore Nara Charm collections by tradition. Handmade heritage jewelry.',
};

export default async function CollectionsIndexPage() {
  const collections = await getAllCollections();
  const products = await getActiveProducts();
  const coverFor = (slug: string) => products.find((p) => p.collectionSlug === slug)?.primaryImage;

  // BreadcrumbList + CollectionPage JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'All Collections', item: `${siteUrl}/collections` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <main id="main">
        {/* 头部 */}
        <section className="border-b border-border bg-ink text-bg">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center md:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Explore by tradition</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">All Collections</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-bg/80">
              Every collection grows from a craft tradition. Choose the one whose story speaks to you.
            </p>
          </div>
        </section>

        {/* 系列卡片 */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => {
              const cover = coverFor(c.slug);
              return (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="group relative block overflow-hidden rounded-lg">
                  <div className="relative aspect-[4/5] bg-surface">
                    {cover ? (
                      <Image src={cover} alt={c.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted/40">[collection image]</div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/20 to-transparent p-6 text-bg">
                    <p className="text-xs uppercase tracking-wider text-gold">{c.heritage || 'Handmade'}</p>
                    <h2 className="mt-1 font-display text-2xl">{c.name}</h2>
                    <p className="mt-1 text-sm text-bg/80">{c.description}</p>
                    <span className="mt-3 inline-block text-sm font-medium group-hover:underline">Discover →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 按品类浏览 */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-brand">Or browse by type</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Shop by Category</h2>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="group rounded-lg border border-border bg-bg p-8 text-center transition-colors hover:border-brand"
                >
                  <div className="text-4xl">{cat.icon}</div>
                  <h3 className="mt-3 font-display text-lg group-hover:text-brand">{cat.name}</h3>
                  <p className="mt-1 text-xs text-muted">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// CATEGORIES 已从 @/lib/categories 导入
