import Image from '@/components/storefront-image';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { JournalList } from '@/components/journal-list';
import { ProductTile } from '@/components/product-tile';
import { articleImagePaths, editorialArt } from '@/lib/editorial-art';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles, isPublishedGuide, formatBlogDate, type ArticleImage } from '@/lib/blog-data';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_EDITORIAL } from '@/lib/category-editorial';
import { getJournalTopic } from '@/lib/journal-topics';
import { getActiveProducts, getAllCollections, getCollectionBySlug } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';
import { pageMetadata } from '@/lib/page-metadata';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'Article not found' };

  const path = `/blog/${slug}`;
  const { title, description } = article;
  if (!isPublishedGuide(article)) {
    return { ...pageMetadata({ title, description, path }), robots: { index: false, follow: true } };
  }

  const art = editorialArt(article) ?? getJournalTopic(article.category)?.cover;
  return pageMetadata({
    title, description, path,
    image: art ? { url: art.src, alt: art.alt } : undefined,
    article: { publishedTime: article.publishedAt, modifiedTime: article.updatedAt, authors: [article.author] },
  });
}

export function generateStaticParams() {
  return BLOG_ARTICLES.map(({ slug }) => ({ slug }));
}

const usefulPages: Record<string, string> = {
  '/shop': 'Shop jewelry',
  '/size-guide': 'Jewelry size guide',
  '/gift-guide': 'Find a jewelry gift',
  '/studio': 'Browse the design studio',
  '/shipping': 'Delivery information',
  '/stories': 'Stories behind the jewelry',
  '/blog/topic/care': 'Browse jewelry care guides',
  '/blog/topic/motifs': 'Browse motif and meaning guides',
  '/collections/bracelets': 'Browse bracelets',
  '/collections/necklaces': 'Browse necklaces',
  '/collections/earrings': 'Browse earrings',
  '/collections/phone-charms': 'Browse phone charms',
};

async function editorialLink(path: string | undefined) {
  if (!path) return undefined;
  if (usefulPages[path]) return { path, title: usefulPages[path] };
  if (path.startsWith('/blog/')) {
    const article = getArticleBySlug(path.slice('/blog/'.length));
    return article && isPublishedGuide(article) ? { path, title: article.title } : undefined;
  }
  if (!path.startsWith('/collections/')) return undefined;
  const collection = await getCollectionBySlug(path.slice('/collections/'.length));
  return collection ? { path, title: `Explore ${collection.name}` } : undefined;
}

function RichParagraph({ text, catalogLinks }: { text: string; catalogLinks: ReadonlySet<string> }) {
  return <p>{text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const path = href.split(/[?#]/, 1)[0].replace(/\/$/, '');
      if (/^\/(products|collections)\//.test(path) && !catalogLinks.has(path)) return <span key={index}>{label}</span>;
      return <Link key={index} href={href} className="font-medium text-brand underline underline-offset-4">{label}</Link>;
    }
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index}>{token.slice(2, -2)}</strong>;
    return <span key={index}>{token}</span>;
  })}</p>;
}

function ArticleImageCaption({ art }: { art: ArticleImage }) {
  return (
    <figcaption className="mt-2 text-xs leading-5 text-muted">
      {art.credit ? <>
        {art.caption}{' '}
        <a href={art.credit.url} className="underline underline-offset-4">{art.credit.label}</a>
      </> : art.caption ? <>Illustration. {art.caption}</> : 'Editorial illustration'}
    </figcaption>
  );
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  const topic = getJournalTopic(article.category);
  const topicPath = topic ? `/blog/topic/${topic.slug}` : '/blog';
  const topicTitle = topic?.title ?? article.category;
  const breadcrumb = [{ label: 'The Nara Journal', href: '/blog' }, ...(topic ? [{ label: topicTitle, href: topicPath }] : [])];

  if (!isPublishedGuide(article)) {
    const suggestion = await editorialLink(article.editorialLink);
    return (
      <><SiteHeader /><main id="main" className="section-wrap">
        <Breadcrumb items={[...breadcrumb, { label: 'Archived guide' }]} />
        <h1 className="mt-8 font-display text-5xl">This guide has been retired.</h1>
        <p className="mt-4 max-w-xl leading-7 text-muted">{article.description}</p>
        <Link href={suggestion?.path ?? topicPath} className="shop-button mt-6">{suggestion?.title ?? `Browse ${topicTitle}`} ↗</Link>
      </main><SiteFooter /></>
    );
  }

  const art = editorialArt(article);
  const images = articleImagePaths(article).map(absoluteUrl);
  const [suggested, products, collections] = await Promise.all([
    editorialLink(article.editorialLink),
    getActiveProducts(),
    getAllCollections(),
  ]);
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  const catalogLinks = new Set([
    ...products.map(({ slug }) => `/products/${slug}`),
    ...collections.map(({ slug }) => `/collections/${slug}`),
    ...CATEGORIES.map(({ slug }) => `/collections/${slug}`),
  ]);
  const relatedProducts = article.relatedProducts.flatMap((slug) => {
    const product = productsBySlug.get(slug);
    return product && product.availability !== 'preview' ? [product] : [];
  });
  const relatedArticles = getRelatedArticles(slug, 3);
  const onwardLinks = [
    ...(suggested ? [suggested] : []),
    ...CATEGORIES.flatMap(({ slug: category, name }) => {
      const path = `/collections/${category}`;
      const matches = CATEGORY_EDITORIAL[category].guides.some(({ slug: guide }) => guide === slug);
      return matches && path !== suggested?.path ? [{ path, title: `Browse ${name.toLowerCase()}` }] : [];
    }),
  ];
  const articleData = {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description,
    datePublished: article.publishedAt, dateModified: article.updatedAt,
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    author: { '@type': 'Organization', name: article.author, url: absoluteUrl('/about') },
    ...(images.length ? { image: images } : {}),
    ...(article.sources?.length ? { citation: article.sources.map(({ title, url }) => ({ '@type': 'CreativeWork', name: title, url })) } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleData) }} />
      <SiteHeader />
      <main id="main">
        <div className="mx-auto max-w-4xl px-5 md:px-8"><Breadcrumb items={[...breadcrumb, { label: article.title }]} /></div>
        <article>
          <header className="mx-auto max-w-3xl px-5 py-9 md:py-14">
            <Link href={topicPath} className="text-sm text-brand underline underline-offset-4">{topicTitle}</Link>
            <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight md:text-6xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-7 text-muted">{article.description}</p>
            <p className="mt-4 text-sm leading-6 text-muted">
              By <Link href="/about" className="underline underline-offset-4">{article.author}</Link> · <time dateTime={article.publishedAt}>{formatBlogDate(article.publishedAt)}</time>
              {article.updatedAt !== article.publishedAt && <> · Updated <time dateTime={article.updatedAt}>{formatBlogDate(article.updatedAt)}</time></>}
              {' · '}{article.readingTime}
            </p>
          </header>
          {art && (
            <figure className="mx-auto mb-9 max-w-4xl px-5 md:px-8">
              <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-surface">
                <Image src={art.src} alt={art.alt} fill preload sizes="(max-width: 768px) 92vw, 830px" className={art.credit ? 'object-contain' : 'object-cover'} />
              </div>
              <ArticleImageCaption art={art} />
            </figure>
          )}
          <div className="mx-auto max-w-3xl space-y-8 px-5 pb-10">
            {article.content.map((section, index) => (
              <section key={`${section.heading}-${index}`}>
                <h2 className="font-display text-2xl md:text-3xl">{section.heading}</h2>
                <div className="mt-3 space-y-3 leading-7 text-ink/90 md:text-lg md:leading-8">
                  {section.body.map((text, paragraph) => <RichParagraph key={paragraph} text={text} catalogLinks={catalogLinks} />)}
                </div>
                {section.image && (
                  <figure className="mt-5">
                    <Image
                      src={section.image.src} alt={section.image.alt} width={section.image.width} height={section.image.height}
                      sizes="(max-width: 540px) 90vw, 460px"
                      className="h-auto w-full max-w-[460px] max-h-[34rem] rounded-sm bg-surface object-contain"
                    />
                    <ArticleImageCaption art={section.image} />
                  </figure>
                )}
              </section>
            ))}
            {article.sources?.length ? (
              <aside aria-labelledby="article-sources" className="border-y border-border py-5">
                <h2 id="article-sources" className="font-display text-xl">Sources</h2>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-brand">
                  {article.sources.map(({ title, url }) => <li key={url}><a href={url} className="underline underline-offset-4">{title} <span aria-hidden="true">↗</span></a></li>)}
                </ul>
              </aside>
            ) : null}
            {onwardLinks.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {onwardLinks.map(({ path, title }) => (
                  <Link key={path} href={path} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand underline underline-offset-4">
                    {title} <span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>
        {relatedProducts.length > 0 && (
          <section className="border-y border-border bg-surface">
            <div className="mx-auto max-w-5xl px-5 py-10">
              <h2 className="font-display text-3xl">Related jewelry</h2>
              <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
                {relatedProducts.map((product) => <ProductTile key={product.slug} product={productCard(product)} />)}
              </div>
            </div>
          </section>
        )}
        {relatedArticles.length > 0 && (
          <section className="mx-auto max-w-3xl px-5 py-10">
            <h2 className="mb-5 font-display text-3xl">Keep reading</h2>
            <JournalList articles={relatedArticles} />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
