import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';

/**
 * Nara Charm 首页
 * 数据从数据库读取 (Drizzle + 本地 PostgreSQL)
 */
export default async function HomePage() {
  // 从 DB 读真实数据
  const allProducts = await getActiveProducts();
  const allCollections = await getAllCollections();

  // WebSite + ItemList JSON-LD (首页 SEO 增强)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nara Charm',
    url: siteUrl,
    description: 'Handmade heritage jewelry — stories in every piece.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // 首页 Best Sellers: 取 isFeatured 的前 8 个
  const BEST_SELLERS: ProductCard[] = allProducts
    .slice()
    .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured))
    .slice(0, 8)
    .map(toCard);

  // Hero 浮卡: 第一个 featured 产品
  const heroProduct = allProducts.find((p) => p.isFeatured) ?? allProducts[0];

  // 系列卡片
  const COLLECTIONS = allCollections.filter((c) => c.isFeatured || allCollections.length <= 4);
  const coverFor = (slug: string) => allProducts.find((p) => p.collectionSlug === slug)?.primaryImage;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <SiteHeader />
      <main id="main">
      {/* ────────────────────────────────────────────
          3. Hero 首屏
      ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-brand">Handmade Heritage Jewelry</p>
            <h1 className="font-display text-4xl leading-[1.1] md:text-6xl">
              Wear the story of <span className="italic text-brand">two worlds.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted md:text-lg">
              Inspired by the craft traditions of Tibet, Thailand, Mongolia, China
              and the Southwest — each piece is handmade, and carries a story worth wearing.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/collections"
                className="rounded-md bg-brand px-8 py-4 text-sm font-medium tracking-wide text-bg transition-transform hover:-translate-y-0.5"
              >
                SHOP COLLECTIONS
              </Link>
              <Link
                href="/stories"
                className="rounded-md border border-ink px-8 py-4 text-sm font-medium tracking-wide transition-colors hover:bg-ink hover:text-bg"
              >
                READ THE STORIES
              </Link>
            </div>
          </div>

          {/* Hero 视觉: 精选产品图 + 品牌叠加 */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gradient-to-br from-surface to-border/40">
            {heroProduct?.primaryImage ? (
              <Image
                src={heroProduct.primaryImage}
                alt={heroProduct.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted/40">
                <LotusMark className="h-16 w-16" />
                <span className="text-xs uppercase tracking-wider">Nara Charm</span>
              </div>
            )}
            {/* 渐变叠加让浮卡可读 */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            {/* 小浮卡: 真实产品名 */}
            {heroProduct && (
              <Link
                href={`/products/${heroProduct.slug}`}
                className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-md bg-bg/95 p-3 shadow-md backdrop-blur transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <p className="font-display text-sm">{heroProduct.name}</p>
                  <p className="text-xs text-brand">{heroProduct.heritage || 'Handmade with care'}</p>
                </div>
                <span className="text-sm tabular-nums">
                  ${(heroProduct.basePriceCents / 100).toFixed(0)}
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          4. 品牌理念 Brand Philosophy (深色区块)
      ──────────────────────────────────────────── */}
      <section className="bg-ink text-bg">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
          <LotusMark className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-5 font-display text-2xl md:text-4xl">Jewelry with Spirit</h2>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-bg/75 md:text-lg">
            We believe jewelry should carry meaning. Every Nara Charm piece is born
            from an ancient craft — a Tibetan silversmith&apos;s hammer, a Mongolian
            mother&apos;s braid, a Miao artisan&apos;s filigree — and travels thousands
            of miles to find you.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm md:gap-12">
            {['Tibet', 'Thailand', 'Mongolia', 'China', 'Southwest'].map((p) => (
              <span key={p} className="font-display italic text-gold">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          5. Best Sellers 商品网格
      ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Loved by many</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Best Sellers</h2>
          </div>
          <Link href="/best-sellers" className="text-sm text-brand hover:underline">View all →</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
          {BEST_SELLERS.map((p) => (
            <ProductTile key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────
          6. 三大系列 Collections
      ──────────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Explore by tradition</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Our Collections</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:gap-6">
            {COLLECTIONS.map((c) => {
              const cover = coverFor(c.slug);
              return (
                <Link key={c.name} href={`/collections/${c.slug}`} className="group relative block overflow-hidden rounded-lg">
                  <div className="relative aspect-[4/5] bg-bg">
                    {cover ? (
                      <Image src={cover} alt={c.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted/40">[collection image]</div>
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/85 via-ink/20 to-transparent p-6 text-bg">
                    <p className="text-xs uppercase tracking-wider text-gold">{c.heritage}</p>
                    <h3 className="mt-1 font-display text-2xl">{c.name}</h3>
                    <p className="mt-1 text-sm text-bg/80">{c.description}</p>
                    <span className="mt-3 inline-block text-sm font-medium group-hover:underline">Discover →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          7. Stories in Every Piece (故事卡) ⭐ 品牌灵魂
      ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <LotusMark className="mx-auto h-8 w-8 text-brand" />
          <h2 className="mt-4 font-display text-3xl md:text-5xl">Stories in Every Piece</h2>
          <p className="mt-4 leading-relaxed text-muted md:text-lg">
            Behind every charm is a craft, a place, and a meaning.
            Here are three of them.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STORIES.map((s) => (
            <article key={s.title} className="rounded-lg border border-border bg-surface p-7">
              <div className="mb-4 text-3xl">{s.icon}</div>
              <p className="text-xs uppercase tracking-wider text-gold">{s.heritage}</p>
              <h3 className="mt-2 font-display text-xl">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.excerpt}</p>
              <Link href={`/stories/${s.slug}`} className="mt-4 inline-block text-sm text-brand hover:underline">
                Read the story →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────
          8. 4 步工艺流程 How It's Made
      ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">From inspiration to your hands</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">How Every Charm Is Made</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {CRAFT_STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold font-display text-xl text-brand">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-display text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          9. 礼物定位 Gift Section
      ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-8 rounded-lg bg-ink p-8 text-bg md:grid-cols-2 md:p-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Made for your journey</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">A Gift That Tells a Story</h2>
            <p className="mt-4 leading-relaxed text-bg/75">
              Each order arrives in a keepsake box with a handwritten story card
              and a blessing pouch — ready to give, or to keep.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-bg/85">
              <li>✦ Gift-ready packaging with brand box</li>
              <li>✦ Handwritten story card for every piece</li>
              <li>✦ Blessing pouch included</li>
            </ul>
            <Link
              href="/gift-guide"
              className="mt-8 inline-block rounded-md bg-brand px-7 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              SHOP GIFT GUIDE
            </Link>
          </div>
          <div className="aspect-[4/3] rounded-md bg-bg/10">
            <div className="flex h-full items-center justify-center text-bg/40">[gift packaging image]</div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────
          10. 信任徽章 Trust Badges
      ──────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-12 text-center sm:grid-cols-3">
          {[
            { icon: '🚚', title: 'Free Worldwide Shipping', desc: 'On all orders over $120' },
            { icon: '↩️', title: 'Easy 30-Day Returns', desc: 'No questions asked' },
            { icon: '🔒', title: 'Secure Payments', desc: 'Stripe & PayPal protected' },
          ].map((b) => (
            <div key={b.title}>
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-2 font-display text-base">{b.title}</h3>
              <p className="text-xs text-muted">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────
          11. Footer (共享组件)
      ──────────────────────────────────────────── */}
      </main>
      <SiteFooter />
    </>
  );
}

// ─── 辅助: DB 产品 → 前台 ProductCard ───────────────────────────────────
function toCard(p: Awaited<ReturnType<typeof getActiveProducts>>[number]): ProductCard {
  return {
    slug: p.slug,
    name: p.name,
    heritage: p.heritage ?? 'Handmade',
    price: `$${(p.basePriceCents / 100).toFixed(0)}`,
    compareAt: p.compareAtPriceCents ? `$${(p.compareAtPriceCents / 100).toFixed(0)}` : null,
    tag: p.compareAtPriceCents ? 'Sale' : p.isFeatured ? 'Featured' : null,
    image: p.primaryImage ?? undefined,
  };
}

// ─── 首页静态展示数据 (STORIES / CRAFT_STEPS) ────────────────────────────

const STORIES = [
  {
    slug: 'silver-that-remembers',
    icon: '🏔️',
    heritage: 'Tibetan Plateau',
    title: 'Silver That Remembers',
    excerpt: 'In Lhasa, a silversmith has chased the same lotus pattern for thirty years. He says silver holds the memory of every strike.',
  },
  {
    slug: 'the-knot-that-counts-home',
    icon: '🐎',
    heritage: 'Mongolian Steppe',
    title: 'The Knot That Counts Home',
    excerpt: 'Every braid a mother ties for her traveling child is a silent count of the days until return.',
  },
  {
    slug: 'silver-as-inheritance',
    icon: '🌿',
    heritage: 'Miao Villages',
    title: 'Silver as Inheritance',
    excerpt: 'For the Miao, a bride wears her entire family history around her neck — hammered, over three years, into silver.',
  },
];

const CRAFT_STEPS = [
  { title: 'Inspired', desc: 'Each design begins with a real craft tradition and its story.' },
  { title: 'Hand-Selected', desc: 'Materials — silver, turquoise, silk, agate — chosen by hand.' },
  { title: 'Artisan Crafted', desc: 'Made slowly by skilled hands, never on a production line.' },
  { title: 'Blessed & Packed', desc: 'Finished with a story card and blessing pouch, ready for you.' },
];
