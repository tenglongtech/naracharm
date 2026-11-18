import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { StudioCollectionGrid } from '@/components/studio-collections';
import { CATEGORIES } from '@/lib/categories';
import { COLLECTION_EDITORIALS } from '@/lib/collection-editorials';
import { isExternalProductImage } from '@/lib/product-media';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import { getAllCollections, getActiveProducts, type StorefrontProduct } from '@/lib/storefront';
import { STUDIO_SERIES } from '@/lib/studio-designs';
import tones from '../collection-tones.module.css';
import styles from './collection-index.module.css';

const hero = {
  src: '/editorial/nara-collection-still-life.webp',
  alt: 'Red stone beads and a lotus-engraved silver bead on a dark walnut tray beside natural linen',
};

export const metadata = pageMetadata({
  title: 'Jewelry Collections | Shop and Studio',
  description: 'Explore stone bracelets, silver pendants, earrings and cord charms by collection. Find Tibetan Silver, Han Jade, Caravan Fusion and studio design studies.',
  path: '/collections',
  image: { url: hero.src, width: 1536, height: 1024, alt: hero.alt },
});

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default async function CollectionsIndexPage() {
  const [collections, products] = await Promise.all([getAllCollections(), getActiveProducts()]);
  const shopCollections = collections.filter(({ kind }) => kind !== 'studio');
  const shopSlugs = new Set(shopCollections.map(({ slug }) => slug));
  const features = COLLECTION_EDITORIALS.filter(({ slug }) => shopSlugs.has(slug));
  const featureSlugs = new Set<string>(features.map(({ slug }) => slug));
  const directory = shopCollections.filter(({ slug }) => !featureSlugs.has(slug));
  const covers = new Map<string, StorefrontProduct>();
  for (const product of products) {
    if (!product.collectionSlug || !product.primaryImage || product.availability === 'preview') continue;
    const current = covers.get(product.collectionSlug);
    if (!current || (current.imageKind !== 'photo' && product.imageKind === 'photo')) covers.set(product.collectionSlug, product);
  }

  const collectionLinks = [
    ...features.map(({ slug, title }) => ({ name: title, slug })),
    ...directory,
    ...STUDIO_SERIES,
    { slug: 'studio-edit', name: 'Original Studio Edit' },
  ];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nara Charm Jewelry Collections',
    url: absoluteUrl('/collections'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collectionLinks.map(({ slug, name }, index) => ({
        '@type': 'ListItem', position: index + 1, name, url: absoluteUrl(`/collections/${slug}`),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <SiteHeader />
      <main id="main" className={styles.index}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <h1>Jewelry <em>collections.</em></h1>
            <p>Discover the stone, silver and woven cord behind each collection. Browse pieces to wear, then see what’s taking shape in the studio.</p>
            <div className={styles.heroLinks}>
              {shopCollections.length ? <Link href="#shop-collections" className={styles.primaryLink}>Explore the collections <span aria-hidden="true">↓</span></Link> : null}
              <Link href="#design-collections" className={styles.textLink}>Studio designs <span aria-hidden="true">↓</span></Link>
            </div>
          </div>
          <figure className={styles.heroImage}>
            <Image src={hero.src} alt={hero.alt} fill preload sizes="(max-width: 819px) 100vw, 60vw" />
            <figcaption>AI material illustration</figcaption>
          </figure>
        </header>

        <nav aria-label="Shop by category" className={styles.categoryBar}>
          <ul className={styles.shell}>
            {CATEGORIES.map(({ slug, name }) => (
              <li key={slug}><Link href={`/collections/${slug}`}>{name} <Arrow /></Link></li>
            ))}
          </ul>
        </nav>

        {shopCollections.length > 0 && (
          <section id="shop-collections" aria-labelledby="shop-collections-title" className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <h2 id="shop-collections-title">Shop collections</h2>
              <Link href="/shop" className={styles.textLink}>Shop all jewelry <Arrow /></Link>
            </div>

            {features.length > 0 && (
              <>
                <ul className={styles.features}>
                  {features.map(({ slug, title, note, image, tone }) => (
                    <li key={slug}>
                      <Link href={`/collections/${slug}`} className={`${styles.feature} ${tones.tone}`} data-tone={tone}>
                        <div className={styles.featureImage}>
                          <Image src={image} alt="" fill sizes="(max-width: 639px) 92vw, (max-width: 1439px) 30vw, 420px" />
                        </div>
                        <div className={styles.featureCopy}>
                          <h3>{title}</h3>
                          <p>{note}</p>
                          <Arrow />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className={styles.studyNote}>Illustrative material studies</p>
              </>
            )}

            {directory.length > 0 && (
              <ul className={styles.directory} aria-label="More shop collections">
                {directory.map(({ name, slug, productCount }) => {
                  const cover = covers.get(slug);
                  return (
                    <li key={slug}>
                      <Link href={`/collections/${slug}`} className={styles.directoryLink}>
                        {cover?.primaryImage && (
                          <div className={styles.directoryImage}>
                            <Image src={cover.primaryImage} alt="" fill sizes="112px" unoptimized={isExternalProductImage(cover.primaryImage)} />
                          </div>
                        )}
                        <div>
                          <h3>{name}</h3>
                          <p>{productCount} {productCount === 1 ? 'piece' : 'pieces'}{cover?.primaryImage && cover.imageKind !== 'photo' && ' · Illustrated cover'}</p>
                        </div>
                        <Arrow />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        )}

        <section id="design-collections" aria-labelledby="design-collections-title" className={styles.studio}>
          <div className={`${styles.shell} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <h2 id="design-collections-title">Studio designs</h2>
              <Link href="/studio" className={styles.textLink}>Visit the studio <Arrow /></Link>
            </div>
            <p className={styles.studioLead}>Illustrated previews of new jewelry, organized by material, pattern and silhouette.</p>
            <StudioCollectionGrid />
            <Link href="/collections/studio-edit" className={`${styles.textLink} ${styles.studioEdit}`}>Original Studio Edit <Arrow /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
