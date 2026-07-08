import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles, isNewArticle, isRecentlyUpdated, formatBlogDate } from '@/lib/blog-data';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { getActiveProducts } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

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
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: { '@type': 'Organization', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'Nara Charm',
      logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL}/icon` },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.keywords.join(', '),
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${slug}`,
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
        </article>

        {/* 文章内容 */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          {article.content.map((section, i) => (
            <div key={i} className="mb-8">
              <h2 className="font-display text-2xl text-ink">{section.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/85 md:text-lg">
                {section.body.map((para, j) => {
                  // 渲染内链 [text](url)
                  const linkMatch = para.match(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkMatch) {
                    const [full, text, url] = linkMatch;
                    const before = para.slice(0, para.indexOf(full));
                    const after = para.slice(para.indexOf(full) + full.length);
                    return (
                      <p key={j}>
                        {before}
                        <Link href={url} className="text-brand underline hover:no-underline">{text}</Link>
                        {after}
                      </p>
                    );
                  }
                  // 渲染加粗 **text**
                  const parts = para.split(/(\*\*[^*]+\*\*)/);
                  return (
                    <p key={j}>
                      {parts.map((part, k) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                          <strong key={k} className="font-semibold text-ink">{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={k}>{part}</span>
                        )
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
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
      </main>
      <SiteFooter />
    </>
  );
}
