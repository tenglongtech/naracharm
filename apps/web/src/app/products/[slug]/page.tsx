import { siteConfig } from '@/lib/site-config';
import Link from 'next/link';
import { productSchema } from '@/lib/seo';
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
    tag: p.availability === 'preview' ? 'Design preview' : p.compareAtPriceCents ? 'Sale' : null,
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
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description || undefined,
      type: 'website',
      ...(product.primaryImage ? { images: [product.primaryImage] } : {}),
    },
    other: {
      'product:price:amount': (product.basePriceCents / 100).toFixed(2),
      'product:price:currency': 'USD',
      'product:availability': product.stock > 0 ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:retailer_item_id': product.slug,
      'product:brand': siteConfig.brand,
      'og:price:amount': (product.basePriceCents / 100).toFixed(2),
      'og:price:currency': 'USD',
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
  const productJsonLd = productSchema(product);

  // Breadcrumb JSON-LD (Google 面包屑富片段)
  const SITE = siteConfig.url;
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

  const materials = product.materials?.length ? product.materials : ['Final materials are being confirmed.'];
  const specs = ['Refer to the listed materials for this piece.', 'Natural materials may vary in color and pattern.'];
  const care = product.careNotes
    ? product.careNotes.split(/[。\n]/).filter(Boolean)
    : ['Avoid prolonged water contact', 'Clean with soft cloth', 'Store away from direct sunlight'];
  const storyParagraphs = product.craftStory ? product.craftStory.split(/\n\n+/).filter(Boolean) : [];

  // 商品专属问答与 FAQPage Schema (Google 搜索结果问答下拉展示与 GEO 直答)
  const productFaqs = [
    {
      q: `What materials are used in the ${product.name}?`,
      a: `The ${product.name} is handcrafted with ${materials.join(', ')}. All silver elements are certified 925 sterling silver, 100% hypoallergenic, nickel-free, and lead-free.`,
    },
    {
      q: 'How should I care for and clean this piece?',
      a: `${care.join('. ')}. To preserve the natural beauty of the gemstones and cord, store it in the provided keepsake pouch away from prolonged moisture.`,
    },
    {
      q: 'What is the shipping timeline and return policy?',
      a: `We offer free worldwide tracked shipping on orders over $${siteConfig.freeShippingThresholdUsd}. Standard delivery to the US, CA, UK, and AU takes 5–10 business days. You also enjoy a ${siteConfig.returnWindowDays}-day hassle-free return and exchange guarantee.`,
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: productFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <>
      {product.availability !== 'preview' && <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={`${product.name} - Handcrafted ${product.heritage ? `${product.heritage} ` : ''}jewelry with ${product.materials?.[0] || 'natural stones'}`}
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
            {product.imageKind === 'illustration' && <p className="text-xs leading-6 text-muted">AI-generated design illustration based on the written description; not a photograph of the finished item. Confirm the physical details before ordering.</p>}

          </div>

          {/* 信息区 */}
          <div className="md:pt-2">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">{product.heritage}</p>
            <h1 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>

            {/* 价格 */}
            <div className="mt-4 flex items-center gap-3 text-xl tabular-nums">
              <span>{product.availability === 'preview' && <span className="mr-2 text-xs text-muted">Planned price</span>}{price}</span>
              {compareAt && (
                <span className="text-base text-muted line-through">{compareAt}</span>
              )}
              {compareAt && (
                <span className="rounded-sm bg-brand/10 px-2 py-0.5 text-xs text-brand">
                  Save {saveLabel}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-brand">{product.availability === 'preview' ? 'New design · Availability being confirmed' : product.stock > 0 ? 'Available to order' : 'Currently sold out'}</p>
            <p className="mt-5 leading-relaxed text-muted">{product.description || product.subtitle}</p>
            <div className="mt-6 rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed">
              <p className="font-medium">A thoughtful fit starts here.</p>
              <p className="mt-2 text-muted">Check the materials below and <Link href="/size-guide" className="underline">see how to measure</Link>. For exact dimensions or fit advice, <Link href="/contact" className="underline">ask us about this piece</Link> before ordering.</p>
            </div>

            {/* 数量 + 加购 (localStorage) */}
            {product.availability === 'preview' ? <div className="mt-7 rounded-lg border border-border p-5"><p className="text-sm leading-6 text-muted">This design is now part of our Studio Edit. Final materials, dimensions and supply are being confirmed; it is not available to order yet.</p><Link href="/contact" className="shop-button mt-4">Ask about this design ↗</Link></div> : <AddToCartForm
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              variantId={product.id}
              variantName={product.heritage || 'Standard'}
              sku={product.slug}
              unitPriceCents={product.basePriceCents}
              image={product.primaryImage}
              heritage={product.heritage}
              maxStock={product.stock}
            />}

            <div className="mt-4 flex flex-wrap gap-5 text-sm text-brand"><Link href="/shipping" className="underline">Delivery details</Link><Link href="/returns" className="underline">Return policy</Link><Link href="/shop" className="underline">Keep exploring</Link></div>

            {/* 强化 E-E-A-T 信任徽章 */}
            {product.availability !== 'preview' && <ul className="mt-7 space-y-2 rounded-lg border border-border/80 bg-surface/50 p-4 text-xs leading-relaxed text-muted">
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> <strong>Material Integrity:</strong> Certified 925 Sterling Silver & Genuine Earth-Mined Stones</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> <strong>Skin Safe:</strong> 100% Hypoallergenic, Nickel-Free & Lead-Free</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> <strong>Tracked Shipping:</strong> Free worldwide tracked delivery over $120</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> <strong>Risk-Free:</strong> 30-day hassle-free returns & exchanges</li>
              <li className="flex items-center gap-2"><span className="text-gold">✦</span> <strong>Gift Ready:</strong> Arrives in a protective keepsake box with cultural story card</li>
            </ul>}
          </div>
        </section>

        {/* Craft Story 区 ⭐ 品牌灵魂 - 接 STORY_DOCTRINE 四层 */}
        <section className="bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-14 md:py-20">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">The Craft Story</p>
            <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">{product.availability === 'preview' ? 'The Design Behind' : 'The Story Behind'} {product.name}</h2>
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

        {/* 商品常见问答 FAQ 手风琴 (提升转化率 & Google 富媒体) */}
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">Questions & Answers</p>
            <h2 className="mt-3 text-center font-display text-2xl md:text-3xl">Frequently Asked Questions</h2>
            <div className="mt-8 space-y-4">
              {productFaqs.map((faq, i) => (
                <details key={i} className="group rounded-lg border border-border bg-bg p-5 transition-all">
                  <summary className="flex cursor-pointer items-center justify-between font-medium text-ink transition-colors group-open:text-brand">
                    <span>{faq.q}</span>
                    <span className="ml-4 text-xs text-muted transition-transform duration-300 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
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
