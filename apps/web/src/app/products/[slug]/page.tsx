export const dynamic = "force-dynamic";
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { AddToCartForm } from '@/components/add-to-cart-form';
import ReviewsSection from '@/components/reviews-section';
import { getProductBySlug, getActiveProducts } from '@/lib/storefront';

/**
 * 产品详情页 (PDP)
 * 数据从数据库读取。商品信息(name/price/story/materials/images)动态,
 * 评价/变体等扩展信息用基于产品的派生数据。
 */

type Params = { params: Promise<{ slug: string }> };

function toCard(p: Awaited<ReturnType<typeof getActiveProducts>>[number]): ProductCard {
  return {
    slug: p.slug,
    name: p.name,
    heritage: p.heritage ?? 'Handmade',
    price: `$${(p.basePriceCents / 100).toFixed(0)}`,
    compareAt: p.compareAtPriceCents ? `$${(p.compareAtPriceCents / 100).toFixed(0)}` : null,
    tag: p.compareAtPriceCents ? 'Sale' : null,
    image: p.primaryImage ?? undefined,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description || undefined,
    alternates: {
      canonical: `/products/${slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      type: 'website',
      ...(product.primaryImage ? { images: [product.primaryImage] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const allProducts = await getActiveProducts();
  const related = allProducts
    .filter((p) => p.slug !== slug && (p.collectionSlug === product.collectionSlug || p.heritage === product.heritage))
    .slice(0, 4)
    .map(toCard);

  // 派生 PDP 显示数据 (DB 字段 + 默认结构化信息)
  const price = `$${(product.basePriceCents / 100).toFixed(0)}`;
  const compareAt = product.compareAtPriceCents ? `$${(product.compareAtPriceCents / 100).toFixed(0)}` : null;
  const saveLabel = product.compareAtPriceCents
    ? `${Math.round((1 - product.basePriceCents / product.compareAtPriceCents) * 100)}%`
    : '';

  // SEO 结构化数据 (Product JSON-LD) - Google 购物搜索优化
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.subtitle || undefined,
    image: product.images.map((i) => `${process.env.NEXT_PUBLIC_SITE_URL}${i}`),
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'Nara Charm' },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: (product.basePriceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
    },
  };

  // Breadcrumb JSON-LD (Google 面包屑富片段)
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Collections', item: `${SITE}/collections` },
      ...(product.collectionSlug
        ? [{ '@type': 'ListItem', position: 3, name: product.collectionName || 'Collection', item: `${SITE}/collections/${product.collectionSlug}` }]
        : []),
      { '@type': 'ListItem', position: product.collectionSlug ? 4 : 3, name: product.name, item: `${SITE}/products/${product.slug}` },
    ],
  };

  const materials = product.materials ?? [];
  const specs = [
    `Bead size: 8mm`,
    product.category === 'phone-charm' ? 'Length: 18cm' : 'Stretch fit',
    'Unisex design',
    'Handmade — slight variation is natural',
  ];
  const care = product.careNotes
    ? product.careNotes.split(/[。\n]/).filter(Boolean)
    : ['Avoid prolonged water contact', 'Clean with soft cloth', 'Store away from direct sunlight'];
  const storyParagraphs = product.craftStory ? product.craftStory.split(/\n\n+/).filter(Boolean) : [];
  const sizes = product.category === 'bracelet'
    ? ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)']
    : product.category === 'necklace'
    ? ['16 in', '18 in', '20 in']
    : ['One size'];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader />
      <main id="main" className="pb-20">
        {/* 面包屑 */}
        <nav aria-label="Breadcrumb" className="border-b border-border">
          <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-xs text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/collections" className="hover:text-brand">Collections</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/collections/${product.collectionSlug}`} className="hover:text-brand">{product.collectionName}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-ink" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* 左右两栏: 图 55 : 信息 45 */}
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[55fr_45fr] md:py-14">
          {/* 图片区 */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-surface to-border/30 text-muted/40">
                  <LotusMark className="h-16 w-16" />
                  <span className="text-xs uppercase tracking-wider">Image coming soon</span>
                </div>
              )}
              {compareAt && (
                <span className="absolute left-3 top-3 rounded-sm bg-brand px-3 py-1 text-xs font-medium text-bg">
                  Sale
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md bg-surface ring-1 ring-border hover:ring-brand">
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    sizes="15vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 信息区 */}
          <div className="md:pt-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.heritage}</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>

            {/* 价格 */}
            <div className="mt-4 flex items-center gap-3 text-xl tabular-nums">
              <span>{price}</span>
              {compareAt && (
                <span className="text-base text-muted line-through">{compareAt}</span>
              )}
              {compareAt && (
                <span className="rounded-sm bg-brand/10 px-2 py-0.5 text-xs text-brand">
                  Save {saveLabel}
                </span>
              )}
            </div>

            {/* 评分 (占位) */}
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <span className="text-gold">★★★★★</span>
              <span>Handmade · Ready to ship</span>
            </div>

            <p className="mt-5 leading-relaxed text-muted">{product.description || product.subtitle}</p>

            {/* 变体选择: 颜色 */}
            {product.category !== 'phone-charm' && (
              <div className="mt-6">
                <p className="text-sm font-medium">
                  Color: <span className="text-muted">{product.heritage || 'Natural'}</span>
                </p>
                <div className="mt-2 flex gap-2">
                  {['#8B6FA8', '#B08D57'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      style={{ backgroundColor: c }}
                      className="h-8 w-8 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-bg hover:ring-brand"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 变体选择: 尺寸 */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s, i) => (
                    <button
                      key={s}
                      type="button"
                      className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                        i === 0
                          ? 'border-ink bg-ink text-bg'
                          : 'border-border hover:border-ink'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 数量 + 加购 (server action) */}
            <AddToCartForm productId={product.id} maxStock={product.stock} />

            {/* 心愿单 + 立即购买 */}
            <div className="mt-3 flex gap-3">
              <button type="button" className="flex-1 rounded-md border border-ink px-6 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-bg">
                ♡ Add to Wishlist
              </button>
              <button type="button" className="flex-1 rounded-md border border-ink px-6 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-bg">
                Buy It Now
              </button>
            </div>

            {/* 信任徽章 */}
            <ul className="mt-7 space-y-2 text-sm text-muted">
              <li>✦ Free worldwide shipping over $120</li>
              <li>✦ 30-day easy returns</li>
              <li>✦ Arrives in a keepsake box with story card</li>
              <li>✦ Handmade by skilled artisans</li>
            </ul>
          </div>
        </section>

        {/* Craft Story 区 ⭐ 品牌灵魂 - 接 STORY_DOCTRINE 四层 */}
        <section className="bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">The Craft Story</p>
            <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">The Story Behind {product.name}</h2>
            <div className="mt-7 space-y-5 leading-relaxed text-ink/85 md:text-lg">
              {storyParagraphs.length > 0 ? storyParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              )) : (
                <p>{product.description || 'Every piece carries a story, handcrafted by skilled artisans.'}</p>
              )}
            </div>
            {/* 四层标签 */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                `Origin: ${product.heritage || 'Handmade'}`,
                'Craft: Hand-strung',
                `Made for: ${product.category}`,
                'Carried with meaning',
              ].map((layer) => (
                <span key={layer} className="rounded-full border border-gold/50 px-4 py-1.5 text-xs text-gold">
                  {layer}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 材质 / 规格 / 保养 */}
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-8 md:grid-cols-3">
            <DetailBlock title="Materials" items={materials.length > 0 ? materials : ['Hand-selected natural materials']} />
            <DetailBlock title="Specifications" items={specs} />
            <DetailBlock title="Care Guide" items={care} />
          </div>
        </section>

        {/* 评价 — 来自数据库的实时评价 */}
        <ReviewsSection productId={product.id} />

        {/* 相关推荐 */}
        <section className="mx-auto max-w-7xl px-4 py-14 md:py-16">
          <h2 className="font-display text-3xl">You May Also Like</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductTile key={p.slug} product={p} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function DetailBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="font-display text-lg text-brand">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted">
        {items.map((it) => (
          <li key={it}>✦ {it}</li>
        ))}
      </ul>
    </div>
  );
}

// 从 DB 预生成所有在售产品路径
export async function generateStaticParams() {
  try {
    const all = await getActiveProducts();
    return all.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}
