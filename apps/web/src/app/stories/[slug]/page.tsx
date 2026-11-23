import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from '@/components/storefront-image';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile } from '@/components/product-tile';
import { StoryCard } from '@/components/story-card';
import { STORIES, getStoryBySlug } from '@/lib/stories-data';
import { getActiveProducts } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';
import { pageMetadata } from '@/lib/page-metadata';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import { formatBlogDate } from '@/lib/blog-data';
import { siteConfig } from '@/lib/site-config';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return STORIES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const story = getStoryBySlug((await params).slug);
  if (!story) return { title: 'Story not found' };
  return pageMetadata({
    title: `${story.title} — ${story.heritage}`,
    description: story.excerpt,
    path: `/stories/${story.slug}`,
    image: story.cover,
    article: { publishedTime: story.publishedAt, modifiedTime: story.updatedAt, authors: [siteConfig.brand] },
  });
}

export default async function StoryDetailPage({ params }: Params) {
  const story = getStoryBySlug((await params).slug);
  if (!story) notFound();

  const products = await getActiveProducts();
  const related = story.relatedProducts.flatMap(({ slug }) => {
    const product = products.find((item) => item.slug === slug && item.availability !== 'preview');
    return product ? [productCard(product)] : [];
  });
  const nextStory = STORIES.indexOf(story) + 1;
  const otherStories = [...STORIES.slice(nextStory), ...STORIES.slice(0, nextStory - 1)].slice(0, 3);
  const collectionPath = `/collections/${story.relatedCollection.slug}`;
  const author = { '@type': 'Organization', name: siteConfig.brand, url: absoluteUrl('/about') };
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt,
    image: [absoluteUrl(story.cover.url)],
    datePublished: story.publishedAt,
    dateModified: story.updatedAt,
    author,
    mainEntityOfPage: absoluteUrl(`/stories/${story.slug}`),
    articleSection: story.heritage,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(article) }} />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
        <Breadcrumb items={[{ label: 'Stories', href: '/stories' }, { label: story.title }]} />
        <article>
          <header className="mt-6 grid gap-7 md:grid-cols-2 md:items-center md:gap-12 lg:gap-18">
            <div className="py-4 md:py-10">
              <Link href={collectionPath} className="text-sm font-medium text-brand underline underline-offset-4">{story.relatedCollection.name}</Link>
              <h1 className="mt-4 font-display text-5xl leading-none tracking-tight lg:text-7xl">{story.title}</h1>
              <p className="mt-5 max-w-lg text-lg leading-7 text-muted">{story.excerpt}</p>
              <p className="mt-5 text-sm leading-6 text-muted">
                By <Link href="/about" className="underline underline-offset-4">{siteConfig.brand}</Link>
                {' · '}<time dateTime={story.publishedAt}>{formatBlogDate(story.publishedAt)}</time>
                {' · '}{story.readMinutes} min read
              </p>
            </div>
            <figure>
              <div className="relative aspect-square overflow-hidden rounded-sm bg-surface">
                <Image src={story.cover.url} alt={story.cover.alt} fill preload sizes="(min-width: 1280px) 558px, (min-width: 768px) 45vw, 92vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-xs leading-5 text-muted">{story.cover.title}</figcaption>
            </figure>
          </header>

          <div className="mx-auto mt-11 max-w-2xl border-t border-border pt-9 md:mt-18">
            <div className="space-y-5 text-base leading-7 text-ink/90 md:text-lg md:leading-8">
              {story.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <p className="mt-7 font-display text-xl italic leading-snug text-brand">{story.closing}</p>
            <Link href={collectionPath} className="shop-button mt-7">Explore {story.relatedCollection.name} <span aria-hidden="true">↗</span></Link>
          </div>
        </article>

        {related.length > 0 && (
          <section aria-labelledby="story-pieces" className="mt-14 border-t border-border pt-7 md:mt-20">
            <h2 id="story-pieces" className="font-display text-3xl">Related jewelry</h2>
            <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
              {related.map((product) => <ProductTile key={product.slug} product={product} />)}
            </div>
          </section>
        )}

        <section aria-labelledby="more-stories" className="mt-14 md:mt-20">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
            <h2 id="more-stories" className="font-display text-3xl tracking-tight md:text-4xl">More design stories</h2>
            <Link href="/stories" className="py-2 text-sm font-medium text-brand underline underline-offset-4">All stories</Link>
          </div>
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {otherStories.map((other) => <StoryCard key={other.slug} story={other} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
