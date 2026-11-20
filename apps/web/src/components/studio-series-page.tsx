import Image from '@/components/storefront-image';
import Link from 'next/link';
import { Breadcrumb } from './breadcrumb';
import { DesignPalette } from './design-palette';
import { getArticleBySlug, isPublishedGuide } from '@/lib/blog-data';
import { getProductsByCollection, type StorefrontProduct } from '@/lib/storefront';
import { getStudioCover, type STUDIO_SERIES } from '@/lib/studio-designs';
import { isExternalProductImage } from '@/lib/product-media';
import { priceLabel } from '@/lib/catalog';
import { catalogFragment, defaultCatalogFilters } from '@/lib/catalog-location';
import { CATEGORIES } from '@/lib/categories';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import { designArticles, seriesEditorial } from '@/lib/studio-editorial';
import { siteConfig } from '@/lib/site-config';

function listingLabel(design: StorefrontProduct) {
  if (design.availability === 'preview') return 'Design preview';
  if (!siteConfig.checkoutEnabled) return 'Catalog piece';
  return design.stock > 0 ? priceLabel(design.basePriceCents) : 'Sold out';
}

export async function StudioSeriesPage({ series }: { series: (typeof STUDIO_SERIES)[number] }) {
  const designs = await getProductsByCollection(series.slug);
  const editorial = seriesEditorial[series.slug];
  const featured = designs.filter((design) => design.availability === 'preview' && designArticles[design.slug]);
  const cover = getStudioCover(series.slug, designs);
  const otherDesigns = designs.filter(({ slug }) => slug !== cover?.lead.slug);
  const gallery = otherDesigns.flatMap((item) => item.primaryImage ? [{ design: item, src: item.primaryImage }] : []);
  const studies = otherDesigns.filter(({ primaryImage }) => !primaryImage);
  const allIllustratedPreviews = gallery.every(({ design }) => design.availability === 'preview' && design.imageKind === 'illustration');
  const guide = getArticleBySlug(series.relatedGuide);
  const designTypes = new Set(designs.map(({ category }) => category));
  const orderedDesigns = [...(cover ? [cover.lead] : []), ...gallery.map(({ design }) => design), ...studies];
  const schema = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: series.name, description: editorial.summary, url: absoluteUrl(`/collections/${series.slug}`),
    ...(cover ? { image: absoluteUrl(cover.src) } : {}),
    mainEntity: {
      '@type': 'ItemList', numberOfItems: orderedDesigns.length,
      itemListElement: orderedDesigns.map((design, index) => ({
        '@type': 'ListItem', position: index + 1, name: design.name, url: absoluteUrl(`/products/${design.slug}`),
      })),
    },
  };

  return (
    <main id="main" className="mx-auto max-w-[1392px] px-[1.125rem] md:px-9">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <Breadcrumb items={[{ label: 'Studio', href: '/studio' }, { label: series.name }]} />
      <section className="mt-4 grid gap-y-6 border-b border-border pb-8 md:mt-7 md:grid-cols-[1.32fr_1fr] md:gap-x-[5.5vw] md:pb-12">
        <div className="md:col-start-2 md:row-start-1 md:self-center">
          <p className="text-xs font-semibold tracking-wide text-brand">{series.heritage}</p>
          <h1 className="mt-3 font-display text-[clamp(3.1rem,6.5vw,6.5rem)] leading-[0.92] tracking-[-0.06em]">{series.name}</h1>
          <p className="mt-5 max-w-md text-lg leading-7">{editorial.summary}</p>
          <div className="mt-6 h-2 w-28"><DesignPalette palette={series.palette} /></div>
          <a href={gallery.length ? '#compare-designs' : '#design-list'} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand underline underline-offset-4">
            Compare the designs <span aria-hidden="true">↓</span>
          </a>
        </div>
        {cover && (
          <figure className="md:col-start-1 md:row-start-1">
            <Link href={`/products/${cover.lead.slug}`} prefetch={false} className="group block">
              <div className={`relative overflow-hidden bg-surface ${cover.campaign ? 'aspect-[4/3] md:aspect-[1.48]' : 'aspect-square'}`}>
                <Image src={cover.src} alt={cover.alt} unoptimized={isExternalProductImage(cover.src)} fill preload sizes="(max-width: 767px) 95vw, (max-width: 1400px) 53vw, 700px" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
              </div>
              <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 border-b border-border py-2">
                <span className="font-display text-xl group-hover:text-brand">{cover.lead.name}</span>
                <span aria-hidden="true" className="text-brand">↗</span>
              </div>
            </Link>
            <figcaption className="mt-2 text-xs text-muted">
              {cover.lead.imageKind === 'illustration' ? 'AI design illustration' : cover.lead.imageKind === 'photo' ? 'Product photograph' : 'Catalog image'} · {listingLabel(cover.lead)}
            </figcaption>
          </figure>
        )}
      </section>
      {gallery.length > 0 && (
        <section id="compare-designs" aria-labelledby="compare-designs-title" className="border-b border-border py-9 lg:py-14">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <h2 id="compare-designs-title" className="font-display text-3xl tracking-tight md:text-4xl">Pieces in the collection</h2>
              {allIllustratedPreviews && <p className="mt-2 text-xs text-muted">Design previews · AI illustrations</p>}
            </div>
            <nav aria-label="Browse this collection by jewelry type" className="flex flex-wrap gap-x-3 text-xs text-brand sm:gap-x-5 sm:text-sm">
              {CATEGORIES.filter(({ productType }) => designTypes.has(productType)).map(({ slug, productType, name }) => (
                <Link key={slug} href={`/shop${catalogFragment({
                  filters: { ...defaultCatalogFilters, collection: series.slug, category: productType }, pages: 1,
                })}`} prefetch={false} className="inline-flex min-h-11 items-center whitespace-nowrap underline underline-offset-4">
                  {name}
                </Link>
              ))}
            </nav>
          </div>
          <ul className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-3 sm:gap-y-9 md:mt-7 md:gap-x-6 lg:gap-y-12" aria-label="Design gallery">
            {gallery.map(({ design, src }) => (
              <li key={design.slug}>
                <Link href={`/products/${design.slug}`} prefetch={false}
                  className="group grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-center gap-3.5 border-b border-border pb-4 sm:block sm:border-b-0 sm:pb-0">
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    <Image src={src} alt="" unoptimized={isExternalProductImage(src)} fill sizes="(max-width: 639px) 44vw, (max-width: 1392px) 31vw, 420px" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-2 sm:border-b sm:border-border sm:pb-2 sm:pt-3">
                      <h3 className="font-display text-lg leading-tight group-hover:text-brand sm:text-2xl">{design.name}</h3>
                      <span aria-hidden="true" className="text-brand">↗</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">{design.description}</p>
                    {!allIllustratedPreviews && (
                      <p className="mt-2 text-xs text-brand">
                        {listingLabel(design)}{design.imageKind === 'illustration' && ' · AI illustration'}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section id="design-list" className="grid items-start gap-8 py-9 lg:grid-cols-[1fr_2fr] lg:gap-20 lg:py-14">
        <div>
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">Design notes</h2>
          <p className="mt-4 max-w-prose text-sm leading-7 text-muted">{series.designNotes}</p>
          {guide && isPublishedGuide(guide) && <Link className="mt-4 inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4" href={`/blog/${guide.slug}`} prefetch={false}>{guide.title} <span aria-hidden="true" className="ml-2">↗</span></Link>}
        </div>
        <div className="space-y-4">
          <h3 className="font-display text-2xl">What to look for</h3>
          <p className="max-w-prose leading-7">{editorial.detail}</p>
          <h3 className="font-display text-2xl">How to style it</h3>
          <p className="max-w-prose leading-7">{editorial.styling}</p>
          {featured.length > 0 && <ul className="space-y-2" aria-label="Design close-ups">
            {featured.map(({ slug, name }) => <li key={slug}><Link href={`/products/${slug}`} prefetch={false} className="text-brand underline underline-offset-4">{name} design details <span aria-hidden="true">↗</span></Link></li>)}
          </ul>}
        </div>
        {studies.length > 0 && (
          <div>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">More pieces in the collection</h2>
            <ul className="mt-4 grid border-t border-border" aria-label="Design descriptions">
              {studies.map((design) => (
                <li key={design.slug} className="border-b border-border">
                  <Link href={`/products/${design.slug}`} prefetch={false} className="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-4">
                    <h3 className="font-display text-xl leading-snug group-hover:text-brand sm:text-2xl">{design.name}</h3>
                    <span aria-hidden="true" className="mt-1 text-brand">↗</span>
                    <p className="col-start-1 mt-2 max-w-prose text-sm leading-6 text-muted">{design.description}</p>
                    <p className="col-start-1 mt-1.5 text-xs font-medium text-brand">{listingLabel(design)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="lg:col-span-2">
          <Link className="inline-flex min-h-11 items-center text-sm text-brand underline underline-offset-4" href="/studio" prefetch={false}>All studio collections ↗</Link>
        </div>
      </section>
    </main>
  );
}
