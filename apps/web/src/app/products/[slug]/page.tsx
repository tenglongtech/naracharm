import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductTile, type ProductCard } from '@/components/product-tile';

/**
 * 产品详情页 (PDP) - 还原设计稿"产品页"
 * 结构: 面包屑 → 左右两栏(图55:信息45) → craft story → 材质/保养 → 评价 → 相关推荐
 * Phase 2: 从 Payload 按 slug 查询真实产品数据,现为 getSampleProduct 示例。
 */

// ─── 数据层 (Phase 2 替换为 Payload Local API 查询) ─────────────────────
import { SAMPLE_PRODUCTS, getProductBySlug, getRelated } from '@/lib/sample-data';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.name,
    description: product.seoDescription ?? product.shortDesc,
    openGraph: { title: product.name, description: product.shortDesc, type: 'website' },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const related = getRelated(slug, 4);

  return (
    <>
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
                <div className="flex h-full items-center justify-center text-muted/40">[main product image]</div>
              )}
              {product.tag && (
                <span className="absolute left-3 top-3 rounded-sm bg-brand px-3 py-1 text-xs font-medium text-bg">
                  {product.tag}
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
              <span>{product.price}</span>
              {product.compareAt && (
                <span className="text-base text-muted line-through">{product.compareAt}</span>
              )}
              {product.compareAt && (
                <span className="rounded-sm bg-brand/10 px-2 py-0.5 text-xs text-brand">
                  Save {product.saveLabel}
                </span>
              )}
            </div>

            {/* 评分 (占位) */}
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <span className="text-gold">★★★★★</span>
              <span>4.9 · {product.reviewCount} reviews</span>
            </div>

            <p className="mt-5 leading-relaxed text-muted">{product.shortDesc}</p>

            {/* 变体选择: 颜色 */}
            {product.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium">
                  Color: <span className="text-muted">{product.colors[0]}</span>
                </p>
                <div className="mt-2 flex gap-2">
                  {product.colorSwatches.map((c) => (
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
            {product.sizes.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium">Size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => (
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

            {/* 数量 + 加购 */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <button type="button" aria-label="Decrease quantity" className="px-3 py-3 text-muted hover:text-ink">−</button>
                <span className="w-10 text-center text-sm tabular-nums">1</span>
                <button type="button" aria-label="Increase quantity" className="px-3 py-3 text-muted hover:text-ink">+</button>
              </div>
              <button
                type="button"
                className="flex-1 rounded-md bg-brand px-8 py-3.5 text-sm font-medium tracking-wide text-bg transition-transform hover:-translate-y-0.5"
              >
                ADD TO CART · {product.price}
              </button>
            </div>

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
            <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">{product.storyTitle}</h2>
            <div className="mt-7 space-y-5 leading-relaxed text-ink/85 md:text-lg">
              {product.craftStory.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            {/* 四层标签 */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {product.storyLayers.map((layer) => (
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
            <DetailBlock title="Materials" items={product.materials} />
            <DetailBlock title="Specifications" items={product.specs} />
            <DetailBlock title="Care Guide" items={product.care} />
          </div>
        </section>

        {/* 评价 */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-16">
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="font-display text-3xl">What Customers Say</h2>
              <p className="text-lg text-gold">★★★★★ 4.9</p>
              <p className="text-sm text-muted">{product.reviewCount} verified reviews</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {product.reviews.map((r) => (
                <figure key={r.name} className="rounded-lg border border-border bg-bg p-6">
                  <div className="text-sm text-gold">★★★★★</div>
                  <blockquote className="mt-2 leading-relaxed text-ink/85">“{r.text}”</blockquote>
                  <figcaption className="mt-3 text-sm text-muted">
                    {r.name} · <span className="text-brand">Verified Buyer</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

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

// 静态预生成所有示例产品路径 (Phase 2 改 generateStaticParams 查库)
export async function generateStaticParams() {
  return SAMPLE_PRODUCTS.map((p) => ({ slug: p.slug }));
}
