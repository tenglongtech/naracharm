import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { ProductTile } from '@/components/product-tile';
import {
  COLLECTIONS,
  getCollectionBySlug,
  getProductsByCollection,
  getCategoryBySlug,
  getProductsByCategory,
} from '@/lib/sample-data';

/**
 * /collections/[slug] - 同时承载两种内容:
 *  1. 系列详情页 (tibetan / thai-wind / fusion) - 文化故事 + Symbols + 商品
 *  2. 品类筛选页 (phone-charms / necklaces / bracelets / earrings) - 简化版商品网格
 * 根据 slug 命中哪种,渲染对应视图。
 */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (collection) return { title: collection.name, description: collection.heroSubtitle };
  const category = getCategoryBySlug(slug);
  if (category) return { title: category.name, description: category.heroSubtitle };
  return { title: 'Collection not found' };
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  const category = getCategoryBySlug(slug);
  if (!collection && !category) notFound();

  // 品类视图
  if (category) {
    const products = getProductsByCategory(slug);
    return (
      <>
        <SiteHeader />
        <main id="main">
          <section className="border-b border-border bg-ink text-bg">
            <div className="mx-auto max-w-7xl px-4 py-16 text-center md:py-20">
              <div className="text-5xl">{category.icon}</div>
              <h1 className="mt-4 font-display text-4xl md:text-5xl">{category.name}</h1>
              <p className="mx-auto mt-4 max-w-xl text-bg/80">{category.heroSubtitle}</p>
            </div>
          </section>
          <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
            {products.length > 0 ? (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm text-muted">{products.length} pieces</span>
                </div>
                <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
                  {products.map((p) => (
                    <ProductTile key={p.slug} product={p} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-border bg-surface p-12 text-center">
                <p className="text-muted">More {category.name.toLowerCase()} are being handcrafted. Check back soon.</p>
                <Link href="/collections" className="mt-4 inline-block text-sm text-brand hover:underline">Browse all collections →</Link>
              </div>
            )}
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  // 系列视图 (走到这里 collection 一定存在,因上面 category 分支已 return,未命中则 notFound)
  if (!collection) notFound();
  const products = getProductsByCollection(slug);

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero Banner */}
        <section className="relative border-b border-border bg-ink text-bg">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
            <LotusMark className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">{collection.heritage}</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">{collection.heroTitle}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-bg/80">
              {collection.heroSubtitle}
            </p>
            <p className="mt-4 font-display italic text-bg/60">{collection.tagline}</p>
          </div>
        </section>

        {/* 文化故事 intro */}
        <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
          <div className="space-y-5 leading-relaxed text-ink/85 md:text-lg">
            {collection.intro.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Symbols & Meaning ⭐ 接 STORY_DOCTRINE 寓意层 */}
        {collection.symbols.length > 0 && (
          <section className="border-y border-border bg-surface">
            <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
              <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">Symbols & Meaning</p>
              <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">What Each Symbol Carries</h2>
              <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                {collection.symbols.map((s) => (
                  <div key={s.name} className="bg-surface p-7">
                    <h3 className="font-display text-lg text-brand">{s.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{s.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 系列商品网格 */}
        <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl md:text-4xl">Shop the {collection.name}</h2>
            <span className="text-sm text-muted">{products.length} pieces</span>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductTile key={p.slug} product={p} />
            ))}
          </div>
        </section>

        {/* Materials */}
        {collection.materials.length > 0 && (
          <section className="border-t border-border bg-surface">
            <div className="mx-auto max-w-5xl px-4 py-14 md:py-16">
              <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">Mindful Materials</p>
              <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">What It&apos;s Made Of</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {collection.materials.map((m) => (
                  <div key={m.name} className="rounded-lg border border-border bg-bg p-6 text-center">
                    <h3 className="font-display text-lg">{m.name}</h3>
                    <p className="mt-1 text-xs uppercase tracking-wider text-gold">{m.origin}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Styling Tips */}
        {collection.stylingTips.length > 0 && (
          <section className="mx-auto max-w-4xl px-4 py-14 md:py-16">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">How to Wear</p>
            <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">Styling Notes</h2>
            <ul className="mt-8 space-y-3">
              {collection.stylingTips.map((tip) => (
                <li key={tip} className="rounded-lg border border-border bg-surface px-6 py-4 text-sm leading-relaxed text-ink/85">
                  ✦ {tip}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 其他系列导航 */}
        <section className="border-t border-border bg-ink text-bg">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center">
            <h2 className="font-display text-2xl">Explore Other Collections</h2>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {COLLECTIONS.filter((c) => c.slug !== slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/collections/${c.slug}`}
                  className="rounded-md border border-bg/30 px-6 py-3 text-sm transition-colors hover:bg-bg/10"
                >
                  {c.name}
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

export async function generateStaticParams() {
  // 预生成 系列页 + 品类页 两种 slug
  const { CATEGORIES } = await import('@/lib/sample-data');
  return [
    ...COLLECTIONS.map((c) => ({ slug: c.slug })),
    ...CATEGORIES.map((c) => ({ slug: c.slug })),
  ];
}
