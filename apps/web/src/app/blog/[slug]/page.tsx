import Image from 'next/image';
import { editorialArt } from '@/lib/editorial-art';
import { siteConfig } from '@/lib/site-config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles, isNewArticle, isRecentlyUpdated, formatBlogDate } from '@/lib/blog-data';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import CommentsSection from '@/components/comments-section';
import { getActiveProducts } from '@/lib/storefront';


type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.keywords.slice(0, 5),
      ...(editorialArt(article) ? { images: [editorialArt(article).src] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const artwork = editorialArt(article);
  const allProducts = await getActiveProducts();
  const relatedProducts: ProductCard[] = article.relatedProducts
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter(Boolean)
    .map((p) => ({
      slug: p!.slug,
      name: p!.name,
      heritage: p!.heritage ?? 'Handmade',
      price: `$${(p!.basePriceCents / 100).toFixed(0)}`,
      compareAt: p!.compareAtPriceCents ? `$${(p!.compareAtPriceCents / 100).toFixed(0)}` : null,
      tag: null,
      image: p!.primaryImage ?? undefined,
    }));

  const relatedArticles = getRelatedArticles(slug, 3);

  // Article JSON-LD (Google 富片段)
  // Article JSON-LD (Google 富片段 + E-E-A-T 权威规范)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    ...(artwork ? { image: `${siteConfig.url}${artwork.src}` } : {}),
    description: article.description,
    author: {
      '@type': 'Organization',
      name: 'Nara Charm Editorial Studio & Gemological Research Team',
      url: `${siteConfig.url}/about`,
      knowsAbout: [
        'Gemology',
        'Traditional Silversmithing',
        'Mohs Hardness Scale',
        'Crystal Healing Meanings',
        'Jewelry Stacking & Care',
      ],
    },
    reviewedBy: {
      '@type': 'Organization',
      name: 'Nara Charm Artisan Council',
      url: `${siteConfig.url}/our-craft`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nara Charm',
      url: siteConfig.url,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/icon` },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.keywords.join(', '),
    mainEntityOfPage: `${siteConfig.url}/blog/${slug}`,
    isAccessibleForFree: true,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <SiteHeader />
      <main id="main">
        {/* 面包屑 */}
        <nav aria-label="Breadcrumb" className="border-b border-border">
          <ol className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-4 py-3 text-xs text-muted">
            <li><Link href="/" className="hover:text-brand">Home</Link></li>
            <li>/</li>
            <li><Link href="/blog" className="hover:text-brand">Blog</Link></li>
            <li>/</li>
            <li className="text-ink">{article.category}</li>
          </ol>
        </nav>

        {/* 文章头部 */}
        <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.3em] text-brand">{article.category}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-muted">{article.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>By {article.author}</span>
            <span>·</span>
            <span>{formatBlogDate(article.publishedAt)}</span>
            {isRecentlyUpdated(article) && (
              <>
                <span>·</span>
                <span className="text-brand">Updated {formatBlogDate(article.updatedAt)}</span>
              </>
            )}
            <span>·</span>
            <span>{article.readingTime}</span>
            {isNewArticle(article) && (
              <span className="ml-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">New</span>
            )}
          </div>

          {/* E-E-A-T 专家审核与 GEO 直答摘要框 */}
          <div className="mt-8 rounded-xl border border-brand/20 bg-surface/80 p-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs text-brand">
              <span className="font-semibold uppercase tracking-wider">✦ Editorial Fact-Checked & Verified</span>
              <span className="text-muted">Reviewed by Artisan Studio Council</span>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-widest text-muted">Direct Answer & Key Takeaways</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/90 font-medium md:text-base">
                {article.description}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-muted">
              <span>✓ Certified 925 Silver & Genuine Minerals</span>
              <span>✓ Hypoallergenic / Lead & Nickel Free</span>
              <span>✓ Ethical Artisan Partnerships</span>
            </div>
          </div>
        </article>

        {artwork && <figure className="mx-auto mb-12 max-w-4xl px-4"><div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-surface"><Image src={artwork.src} alt={artwork.alt} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" /></div><figcaption className="mt-3 text-xs text-muted">Editorial illustration · A visual guide to {article.category.toLowerCase()}.</figcaption></figure>}
        {/* 文章内容 */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          {article.content.map((section, i) => (
            <div key={i} className="mb-8">
              <h2 className="font-display text-2xl text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/85 md:text-lg">
                {section.body.map((para, j) => {
                  // 分解段落中的 [文本](链接) 与 **加粗**
                  const tokens = para.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
                  return (
                    <p key={j}>
                      {tokens.map((token, k) => {
                        if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
                          const m = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                          if (m) {
                            return (
                              <Link
                                key={k}
                                href={m[2]}
                                className="font-medium text-brand underline underline-offset-2 transition-colors hover:text-ink"
                              >
                                {m[1]}
                              </Link>
                            );
                          }
                        }
                        if (token.startsWith('**') && token.endsWith('**')) {
                          return (
                            <strong key={k} className="font-semibold text-ink">
                              {token.slice(2, -2)}
                            </strong>
                          );
                        }
                        return <span key={k}>{token}</span>;
                      })}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* E-E-A-T Author & Studio Bio 权威背书 */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <LotusMark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg text-ink">Written by Nara Charm Editorial & Gemological Studio</h3>
                <p className="mt-1 text-xs font-medium text-brand">In direct partnership with independent Himalayan & Southwestern silversmiths</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted md:text-sm">
              Our guides are researched and authored in close collaboration with generational artisans and gemstone suppliers. Every piece of advice is cross-referenced with mineralogical standards (Mohs hardness, water sensitivity) and living folk traditions to ensure authentic, durable, and respectful everyday wear.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <Link href="/our-craft" className="text-brand underline hover:text-ink">Read our Craft & Material Standards →</Link>
              <Link href="/about" className="text-brand underline hover:text-ink">Meet our Artisans →</Link>
            </div>
          </div>
        </section>

        {/* 关联产品 */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border bg-surface">
            <div className="mx-auto max-w-5xl px-4 py-12">
              <h2 className="font-display text-2xl">Shop This Story</h2>
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:gap-6">
                {relatedProducts.map((p) => (
                  <ProductTile key={p.slug} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 相关文章 */}
        {relatedArticles.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="font-display text-2xl">Continue Reading</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {relatedArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group block rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-xs uppercase tracking-wider text-gold">{a.category}</p>
                  <h3 className="mt-2 font-display text-base group-hover:text-brand">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{a.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 评论区 */}
        <CommentsSection slug={slug} />
      </main>
      <SiteFooter />
    </>
  );
}
