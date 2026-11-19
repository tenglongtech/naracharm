import { siteConfig } from '@/lib/site-config';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductTile } from '@/components/product-tile';
import { CategoryLanding } from '@/components/category-landing';
import { productCard } from '@/lib/catalog';
import { getStudioCover, STUDIO_SERIES } from '@/lib/studio-designs';
import { StudioSeriesPage } from '@/components/studio-series-page';
import { Breadcrumb } from '@/components/breadcrumb';
import { getCollectionBySlug, getProductsByCollection, getProductsByCategory, getAllCollections } from '@/lib/storefront';
import { getCollectionNarrative } from '@/lib/collection-narratives';
import { getCollectionArtwork } from '@/lib/collection-editorials';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_EDITORIAL } from '@/lib/category-editorial';
import { serializeJsonLd } from '@/lib/seo';
import { pageMetadata, productShareImage } from '@/lib/page-metadata';
import collectionStyles from '../../collection-tones.module.css';
import styles from './collection-editorial.module.css';

/**
 * /collections/[slug]
 * - 系列详情: 商品从 DB 读 + 叙事(symbols/intro)从静态映射
 * - 品类筛选: 商品从 DB 按 category 读
 */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (collection) {
    const narrative = getCollectionNarrative(slug);
    const title = narrative?.heroTitle ?? (collection.kind === 'studio' ? `${collection.name} | Studio Jewelry Collection` : `${collection.name} Jewelry Collection`);
    const description = narrative?.heroSubtitle || collection.description || `Explore the ${collection.name} jewelry collection and its design details.`;
    const artwork = getCollectionArtwork(slug);
    const isStudioSeries = STUDIO_SERIES.some((series) => series.slug === slug);
    const pieces = isStudioSeries || !artwork ? await getProductsByCollection(slug) : [];
    const studioCover = isStudioSeries ? getStudioCover(slug, pieces) : undefined;
    const image = studioCover ? { url: studioCover.src, alt: studioCover.alt }
      : artwork ? { url: artwork.image, alt: artwork.alt }
      : productShareImage(pieces.find(({ primaryImage }) => primaryImage));
    return pageMetadata({ title, description, path: `/collections/${slug}`, image });
  }
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (category) {
    const path = `/collections/${slug}`;
    const { seoTitle: title, seoDescription: description } = category;
    const { image } = CATEGORY_EDITORIAL[category.slug];
    return pageMetadata({ title, description, path, image: { url: image.src, alt: image.alt } });
  }
  return { title: 'Collection not found' };
}

export default async function CollectionPage({ params }: Params) {
  const { slug } = await params;
  const studioSeries = STUDIO_SERIES.find((series) => series.slug === slug);
  if (studioSeries) return <><SiteHeader /><StudioSeriesPage series={studioSeries} /><SiteFooter /></>;
  const allCollections = await getAllCollections();
  const collection = allCollections.find((item) => item.slug === slug);
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!collection && !cat) notFound();

  if (cat && !collection) {
    const products = (await getProductsByCategory(cat.slug)).filter((product) => product.availability !== 'preview').map(productCard);
    return <><SiteHeader /><CategoryLanding category={cat} products={products} /><SiteFooter /></>;
  }

  // 系列视图
  if (!collection) notFound();
  const n = getCollectionNarrative(slug);
  const artwork = getCollectionArtwork(slug);
  const products = (await getProductsByCollection(slug)).map((product) => {
    const card = productCard(product);
    if (!artwork || card.image !== artwork.image) return card;
    const alternate = product.images.find((image) => image !== artwork.image);
    return alternate ? { ...card, image: alternate } : card;
  });
  const relatedCollections = allCollections.filter((item) => item.slug !== slug && item.kind !== 'studio');
  const showNotesBesidePiece = Boolean(n?.intro.length && products.length === 1);
  const isStudio = collection.kind === 'studio';
  const notesCopy = n?.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>);

  // Collection + ItemList JSON-LD
  const siteUrl = siteConfig.url;
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: n?.heroSubtitle || collection.description || undefined,
    url: `${siteUrl}/collections/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteUrl}/products/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <SiteHeader />
      <main id="main" className={collectionStyles.tone} data-tone={artwork?.tone ?? 'neutral'}>
        <header className={styles.hero}>
          <div className={styles.shell}>
            <Breadcrumb items={[{ label: 'Collections', href: '/collections' }, { label: collection.name }]} />
            <div className={artwork ? styles.spread : styles.textOnly}>
              <div className={styles.copy}>
                <h1>{n?.heroTitle || collection.name}</h1>
                {(n?.heroSubtitle || collection.description) && <p>{n?.heroSubtitle || collection.description}</p>}
                <a href="#collection-pieces">{isStudio ? 'View the designs' : 'Browse the pieces'} <span aria-hidden="true">↓</span></a>
              </div>
              {artwork && (
                <figure className={styles.figure}>
                  <div className={styles.image}>
                    <Image src={artwork.image} alt={artwork.alt} fill preload sizes="(max-width: 767px) 89vw, (max-width: 1120px) 42vw, 512px" />
                  </div>
                  <figcaption>Illustrative material study</figcaption>
                </figure>
              )}
            </div>
          </div>
        </header>

        <section id="collection-pieces" aria-labelledby="collection-pieces-title" className={`${styles.shell} py-10 md:py-14`} tabIndex={-1}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="collection-pieces-title" className="font-display text-3xl md:text-4xl">{isStudio ? 'Pieces in the collection' : `Shop ${collection.name}`}</h2>
            <span className="text-sm text-muted">{products.length} {products.length === 1 ? 'piece' : 'pieces'}</span>
          </div>
          {products.length > 0 ? (
            <div className={showNotesBesidePiece ? styles.singlePiece : 'mt-5 grid grid-cols-2 gap-5 md:mt-7 md:grid-cols-4 lg:gap-6'}>
              {products.map((p) => (
                <ProductTile key={p.slug} product={p} sizes={showNotesBesidePiece ? '(max-width: 767px) 89vw, 400px' : undefined} />
              ))}
              {showNotesBesidePiece && (
                <div className={styles.pieceNotes}>
                  <h3>A closer look</h3>
                  {notesCopy}
                </div>
              )}
            </div>
          ) : (
            <Link href="/shop" className={styles.textLink}>Browse all jewelry <span aria-hidden="true">↗</span></Link>
          )}
        </section>

        {notesCopy && !showNotesBesidePiece && (
          <section className={styles.notes} aria-labelledby="collection-notes">
            <div className={styles.shell}>
              <h2 id="collection-notes">A closer look</h2>
              <div>{notesCopy}</div>
            </div>
          </section>
        )}

        {n && n.stylingTips.length > 0 && (
          <section className={`${styles.shell} ${styles.styling}`} aria-labelledby="collection-styling-title">
            <div>
              <h2 id="collection-styling-title">{slug === 'charms' || slug === 'tai-silk' ? 'Using a phone charm' : 'How to wear it'}</h2>
              <Link href={`/blog/${n.guide.slug}`} className={styles.textLink}>{n.guide.label} <span aria-hidden="true">↗</span></Link>
            </div>
            <ul>{n.stylingTips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>
        )}

        {relatedCollections.length > 0 && (
          <section className={styles.related} aria-labelledby="more-collections-title">
            <div className={styles.shell}>
              <div className={styles.relatedHeading}>
                <h2 id="more-collections-title">More collections</h2>
                <Link href="/collections" className={styles.textLink}>All collections <span aria-hidden="true">↗</span></Link>
              </div>
              <ul>
                {relatedCollections.map(({ slug, name }) => (
                  <li key={slug}><Link href={`/collections/${slug}`}>{name} <span aria-hidden="true">↗</span></Link></li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export async function generateStaticParams() {
  const collections = await getAllCollections();
  const slugs = new Set([...collections, ...CATEGORIES].map(({ slug }) => slug));
  return Array.from(slugs, (slug) => ({ slug }));
}
