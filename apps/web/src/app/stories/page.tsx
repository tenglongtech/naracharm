import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { StoryCard } from '@/components/story-card';
import { STORIES, storiesCover } from '@/lib/stories-data';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/page-metadata';

const title = 'Jewelry Design Stories';
const description = 'See how folded ribbon, open silverwork and simple stone shapes inform six Nara Charm collections.';

export const metadata = pageMetadata({ title, description, path: '/stories', image: storiesCover });

export default function StoriesIndexPage() {
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl('/stories'),
    primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(storiesCover.url) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: STORIES.length,
      itemListElement: STORIES.map((story, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/stories/${story.slug}`),
        name: story.title,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(collection) }} />
      <SiteHeader />
      <main id="main" className="mx-auto max-w-7xl px-5 pb-16 md:px-10 md:pb-24">
        <Breadcrumb items={[{ label: 'Stories' }]} />
        <header className="mt-6 grid gap-7 md:grid-cols-[4fr_5fr] md:items-center md:gap-12">
          <div className="py-4 md:py-10">
            <h1 className="font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-8xl">Jewelry design stories</h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-muted">{description}</p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-surface">
            <Image src={storiesCover.url} alt={storiesCover.alt} fill preload sizes="(min-width: 1280px) 670px, (min-width: 768px) 53vw, 92vw" className="object-cover" />
          </div>
        </header>
        <section aria-labelledby="collection-stories" className="mt-12 md:mt-20">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
            <h2 id="collection-stories" className="font-display text-3xl tracking-tight md:text-4xl">Stories by collection</h2>
            <Link href="/studio" className="py-2 text-sm font-medium text-brand underline underline-offset-4">Explore the studio</Link>
          </div>
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {STORIES.map((story) => <StoryCard key={story.slug} story={story} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
