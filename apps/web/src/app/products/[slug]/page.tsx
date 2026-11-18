import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile } from '@/components/product-tile';
import { AddToCartForm } from '@/components/add-to-cart-form';
import { ProductGallery } from '@/components/product-gallery';
import { WishlistToggle } from '@/components/wishlist-toggle';
import { DesignPalette } from '@/components/design-palette';
import { LotusMark } from '@/components/lotus-mark';
import { getProductBySlug, getActiveProducts } from '@/lib/storefront';
import { priceLabel, productCard } from '@/lib/catalog';
import { productSchema, serializeJsonLd } from '@/lib/seo';
import { pageMetadata, productShareImage } from '@/lib/page-metadata';
import { siteConfig } from '@/lib/site-config';
import { freeShippingFromLabel, RETURN_WINDOW_DAYS, standardShippingLabel } from '@/lib/store-policies';
import { COLLECTION_EDITORIALS } from '@/lib/collection-editorials';
import { STUDIO_SERIES } from '@/lib/studio-designs';
import { getArticleBySlug, isPublishedGuide } from '@/lib/blog-data';
import { CATEGORIES } from '@/lib/categories';
import { CATEGORY_EDITORIAL } from '@/lib/category-editorial';
import collectionStyles from '../../collection-tones.module.css';
import styles from './product-detail.module.css';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || product.subtitle || `Explore ${product.name} by ${siteConfig.brand}.`;
  return {
    ...pageMetadata({ title, description, path: `/products/${slug}`, image: productShareImage(product) }),
    ...(product.availability === 'preview' ? { robots: { index: false, follow: true } } : {}),
  };
}

export async function generateStaticParams() {
  return (await getActiveProducts()).map(({ slug }) => ({ slug }));
}

const typeNames = { 'phone-charm': 'Phone charm', necklace: 'Necklace', bracelet: 'Bracelet', earrings: 'Earrings' };
const careGuides = {
  bracelet: { slug: 'beaded-jewelry-care-guide', label: 'Bracelet care guide' },
  necklace: { slug: 'complete-crystal-cleansing-guide', label: 'Stone and cord care guide' },
  earrings: { slug: 'what-to-do-with-a-loose-earring-hook', label: 'Care for earring hooks' },
  'phone-charm': { slug: 'how-to-store-textile-jewelry', label: 'Care for textile and cord pieces' },
};
const buyingGuides: Record<string, string> = {
  'amethyst-calm-bracelet': 'amethyst-bracelet-benefits',
  'amethyst-peace-bracelet': 'amethyst-bracelet-benefits',
  'amethyst-earrings-silver': 'amethyst-meaning-healing-properties',
  'howlite-turquoise-bracelet': 'how-to-read-crystal-properties',
};

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const isPreview = product.availability === 'preview';
  const care = careGuides[product.category];
  const collection = product.collectionSlug && product.collectionName
    ? { href: `/collections/${product.collectionSlug}`, label: product.collectionName }
    : undefined;
  const series = STUDIO_SERIES.find((item) => item.slug === product.collectionSlug);
  const editorial = COLLECTION_EDITORIALS.find((item) => item.slug === product.collectionSlug);
  const images = product.images.length ? product.images : product.primaryImage ? [product.primaryImage] : [];
  const productHref = `/contact?topic=${isPreview ? 'studio' : 'product'}&piece=${encodeURIComponent(product.name)}`;
  const fit = product.category === 'phone-charm'
    ? { href: '/blog/does-my-phone-case-fit-a-charm', label: 'Phone case fit' }
    : { href: '/size-guide', label: 'Size guide' };
  const category = CATEGORIES.find(({ productType }) => productType === product.category);
  const categoryGuide = !isPreview && category
    ? CATEGORY_EDITORIAL[category.slug].guides.find(({ slug: candidate }) => `/blog/${candidate}` !== fit.href)
    : undefined;
  const guideSlug = series?.relatedGuide ?? buyingGuides[slug] ?? categoryGuide?.slug;
  const article = guideSlug ? getArticleBySlug(guideSlug) : undefined;
  const guide = article && isPublishedGuide(article) ? article : undefined;
  const related = (await getActiveProducts())
    .filter((item) => item.slug !== slug && (item.availability === 'preview') === isPreview)
    .filter((item) => item.collectionSlug === product.collectionSlug || (!isPreview && item.category === product.category))
    .sort((a, b) => Number(b.collectionSlug === product.collectionSlug) - Number(a.collectionSlug === product.collectionSlug))
    .slice(0, 4);

  return (
    <>
      {!isPreview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema(product)) }} />}
      <SiteHeader />
      <main id="main" className={editorial ? `${styles.page} ${collectionStyles.tone}` : styles.page} data-tone={editorial?.tone}>
        <div className={`${styles.shell} ${styles.crumb}`}>
          <Breadcrumb items={[
            isPreview ? { label: 'Studio', href: '/studio' } : { label: 'Collections', href: '/collections' },
            ...(collection ? [collection] : []),
            { label: product.name },
          ]} />
        </div>
        <section className={`${styles.shell} ${styles.hero}`} aria-labelledby="piece-title">
          <header className={styles.identity}>
            <p className={styles.kicker}>{isPreview ? 'Studio design preview' : typeNames[product.category]}</p>
            <h1 id="piece-title">{product.name}</h1>
            {product.basePriceCents > 0 && (
              <p className={styles.price}>
                <span>{isPreview ? 'Planned price ' : ''}{priceLabel(product.basePriceCents)}</span>
                {(product.compareAtPriceCents ?? 0) > product.basePriceCents && (
                  <del><span className="sr-only">Previous price </span>{priceLabel(product.compareAtPriceCents!)}</del>
                )}
              </p>
            )}
          </header>

          <div className={styles.media}>
            {images.length ? (
              <ProductGallery key={slug} name={product.name} images={images} kind={product.imageKind} preview={isPreview} />
            ) : (
              <figure>
                <div className={styles.placeholder}>
                  {product.palette ? <DesignPalette palette={product.palette} /> : <LotusMark className="h-14 w-14" />}
                </div>
                <figcaption className={styles.note}>{product.palette ? 'Proposed color palette' : 'Image pending'}</figcaption>
              </figure>
            )}
          </div>

          <div className={styles.purchase}>
            {(product.description || product.subtitle) && <p className={styles.description}>{product.description || product.subtitle}</p>}
            {isPreview ? (
              <div className={styles.order}>
                <p className={styles.note}>This design is in development. Final materials, measurements and availability are pending.</p>
                <Link prefetch={false} href={productHref} className="shop-button mt-3">Ask about this design <span aria-hidden="true">↗</span></Link>
              </div>
            ) : (
              <div className={styles.order}>
                <div className={styles.orderDetails}>
                  <p className={styles.availability} data-in-stock={product.stock > 0}>{product.stock > 0 ? 'Available to order' : 'Currently sold out'}</p>
                  <Link prefetch={false} href={fit.href}>{fit.label} <span aria-hidden="true">↗</span></Link>
                </div>
                <AddToCartForm
                  key={slug}
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                  variantId={product.variant?.id ?? product.id}
                  variantName={product.variant?.name ?? 'Standard'}
                  sku={product.variant?.sku ?? product.slug}
                  unitPriceCents={product.basePriceCents}
                  image={product.primaryImage}
                  heritage={product.heritage}
                  maxStock={product.stock}
                />
              </div>
            )}
            <div className={styles.pieceDetails}>
              {!isPreview && <>
                <nav aria-label="Shopping information" className={styles.serviceLinks}>
                  <Link prefetch={false} href="/shipping#standard" className={styles.serviceRow}>
                    <span>Delivery</span>
                    <span className={styles.serviceDescription}>Standard {standardShippingLabel} · Free from {freeShippingFromLabel}</span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                  <Link prefetch={false} href={product.category === 'earrings' ? '/returns#return-exceptions' : '/returns#eligible-returns'} className={styles.serviceRow}>
                    <span>Returns</span>
                    <span className={styles.serviceDescription}>
                      {product.category === 'earrings' ? 'For defective earrings under our store policy' : `Request an eligible return within ${RETURN_WINDOW_DAYS} days`}
                    </span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                  <Link prefetch={false} href={productHref} className={styles.measurementsLink}>Confirm measurements</Link>
                </nav>
                <div className={styles.specifications}>
                  {product.materials?.length ? (
                    <details open>
                      <summary>Materials &amp; details</summary>
                      <ul>{product.materials.map((item) => <li key={item}>{item.replace(/(\d)(mm|cm)\b/g, '$1 $2')}</li>)}</ul>
                    </details>
                  ) : null}
                  <details>
                    <summary>Care</summary>
                    {product.careNotes && <p>{product.careNotes}</p>}
                    <Link prefetch={false} href={`/blog/${care.slug}`} className={styles.careLink}>{care.label} <span aria-hidden="true">↗</span></Link>
                  </details>
                </div>
              </>}
              <WishlistToggle slug={product.slug} />
            </div>
          </div>
        </section>

        {(product.craftStory || guide) && (
          <section className={styles.story} aria-labelledby="piece-story">
            <div className={styles.shell}>
              <h2 id="piece-story">{isPreview ? 'Design notes' : 'The story behind the piece'}</h2>
              <div className={styles.storyCopy}>
                {product.craftStory?.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {guide && <Link prefetch={false} href={`/blog/${guide.slug}`} className={styles.storyLink}>{guide.title} <span aria-hidden="true">↗</span></Link>}
              </div>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className={`${styles.shell} ${styles.related}`} aria-labelledby="related-pieces">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 id="related-pieces">{isPreview ? 'More from the studio' : 'You may also like'}</h2>
              {!isPreview && category && (
                <Link prefetch={false} href={`/collections/${category.slug}`} className={styles.storyLink}>
                  Browse all {category.name.toLowerCase()} <span aria-hidden="true">↗</span>
                </Link>
              )}
            </div>
            <div className={styles.relatedGrid}>
              {related.map((item) => <ProductTile key={item.slug} product={productCard(item)} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
