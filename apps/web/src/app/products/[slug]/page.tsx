import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile } from '@/components/product-tile';
import { ProductMeasurementsLink, ProductPurchase } from '@/components/add-to-cart-form';
import { ProductOfferPrice, ProductOfferSection } from '@/components/product-offer-provider';
import { ProductGallery, ProductPhotoInquiryLink, VariantProductGallery } from '@/components/product-gallery';
import { WishlistToggle } from '@/components/wishlist-toggle';
import { DesignPalette } from '@/components/design-palette';
import { LotusMark } from '@/components/lotus-mark';
import { getProductBySlug, getActiveProducts } from '@/lib/storefront';
import { priceLabel, productCard } from '@/lib/catalog';
import { absoluteUrl, catalogProductSchema, productSchema, serializeJsonLd } from '@/lib/seo';
import { variantProductMedia } from '@/lib/product-media';
import { pageMetadata, productShareImage } from '@/lib/page-metadata';
import { inquiryPath } from '@/lib/product-inquiry';
import { siteConfig } from '@/lib/site-config';
import { freeShippingFromLabel, RETURN_WINDOW_DAYS, standardShippingLabel } from '@/lib/store-policies';
import { COLLECTION_EDITORIALS } from '@/lib/collection-editorials';
import { STUDIO_SERIES } from '@/lib/studio-designs';
import { designArticles } from '@/lib/studio-editorial';
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

  const article = product.availability === 'preview' ? designArticles[slug] : undefined;
  const title = article?.title ?? (product.seoTitle || product.name);
  const description = (article ? article.detail.split('. ', 1)[0].replace(/\.$/, '') + '.' : product.seoDescription) || product.description || product.subtitle || `Explore ${product.name} by ${siteConfig.brand}.`;
  return {
    ...pageMetadata({ title, description, path: `/products/${slug}`, image: productShareImage({
      name: product.name, ...variantProductMedia(product, product.variant),
    }) }),
    ...(product.availability === 'preview' && !article ? { robots: { index: false, follow: true } } : {}),
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
const fitGuides = {
  bracelet: {
    href: '/size-guide#bracelet-fit', label: 'Measure your wrist',
    note: 'Compare your wrist with the bracelet’s inside circumference when closed. Bead diameter describes the size of each bead.',
    measurements: 'the closed inside circumference and, for an adjustable bracelet, the smallest and largest settings',
  },
  necklace: {
    href: '/size-guide#necklace-fit', label: 'Check necklace length',
    note: 'Use the wearable chain or cord length to see where the necklace sits. Check the pendant dimensions separately.',
    measurements: 'the wearable chain or cord length, any adjustment range, and the pendant dimensions',
  },
  earrings: {
    href: '/size-guide#earring-fit', label: 'Compare earring drops',
    note: 'Compare the full drop from hook or post to the lowest point. Weight per earring can help you judge comfort.',
    measurements: 'the total drop length from hook or post to the lowest point and the weight per earring',
  },
  'phone-charm': {
    href: '/blog/does-my-phone-case-fit-a-charm', label: 'Check your phone case',
    note: 'Check the attachment loop against your case opening and leave enough room for the charm to clear the charging port.',
    measurements: 'the hanging length and the size and type of attachment loop',
  },
};
const buyingGuides: Record<string, string> = {
  'tibetan-amulet-925-bracelet': 'tibetan-silver-vs-925-sterling-silver',
  'caravan-fusion-necklace': 'tibetan-silver-vs-925-sterling-silver',
  'miao-filigree-drop-earrings': 'choosing-jewelry-for-a-group-photo',
  'han-jade-lotus-pendant': 'meaningful-handmade-jewelry-gifts-under-100',
  'hadas-knot-red-cord': 'red-cord-bracelet-meaning-which-wrist',
  'mongolian-road-knot-cord': 'red-cord-bracelet-meaning-which-wrist',
  'amethyst-calm-bracelet': 'bead-size-guide-6mm-vs-8mm-vs-10mm-bracelets',
  'amethyst-peace-bracelet': 'bead-size-guide-6mm-vs-8mm-vs-10mm-bracelets',
  'amethyst-earrings-silver': 'amethyst-meaning-healing-properties',
  'turquoise-sky-bracelet': 'natural-turquoise-vs-dyed-howlite-guide',
  'howlite-turquoise-bracelet': 'natural-turquoise-vs-dyed-howlite-guide',
  'unakite-bracelet-balance': 'natural-variation-in-bead-jewelry',
  'strawberry-quartz-bracelet': 'natural-variation-in-bead-jewelry',
  'citrine-bracelet-abundance': 'earth-tone-jewelry-pairing',
  'mixed-crystal-bracelet': 'how-to-style-two-textures-of-jewelry',
};

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const isPreview = product.availability === 'preview';
  const designArticle = isPreview ? designArticles[slug] : undefined;
  const { checkoutEnabled } = siteConfig;
  const variant = product.variant ?? { id: product.id, name: 'Standard', sku: slug, unitPriceCents: product.basePriceCents, stock: product.stock };
  const care = careGuides[product.category];
  const collection = product.collectionSlug && product.collectionName
    ? { href: `/collections/${product.collectionSlug}`, label: product.collectionName }
    : undefined;
  const series = STUDIO_SERIES.find((item) => item.slug === product.collectionSlug);
  const editorial = COLLECTION_EDITORIALS.find((item) => item.slug === product.collectionSlug);
  const sharedMedia = { primaryImage: product.primaryImage, images: product.images.length ? product.images : product.primaryImage ? [product.primaryImage] : [], imageKind: product.imageKind };
  const gallery = variantProductMedia({ ...sharedMedia, availability: product.availability }, product.variant);
  const photoInquiry = !isPreview && gallery.imageKind !== 'photo'
    ? inquiryPath(product.name, variant.sku, variant.name, { type: 'photo' })
    : undefined;
  const variantGallery = !isPreview && product.variant && product.variants?.some(({ photoUrls }) => photoUrls?.length)
    ? { variant: product.variant, variants: product.variants }
    : undefined;
  const fallback = (
    <figure>
      <div className={styles.placeholder}>
        {product.palette ? <DesignPalette palette={product.palette} /> : <LotusMark className="h-14 w-14" />}
      </div>
      <figcaption className={styles.note}>{product.palette ? 'Proposed color palette' : 'Image pending'}</figcaption>
    </figure>
  );
  const designInquiryHref = `/contact?topic=studio&piece=${encodeURIComponent(product.name)}`;
  const fit = fitGuides[product.category];
  const category = CATEGORIES.find(({ productType }) => productType === product.category);
  const categoryGuide = !isPreview && category
    ? CATEGORY_EDITORIAL[category.slug].guides.find(({ slug: candidate }) => `/blog/${candidate}` !== fit.href)
    : undefined;
  const guideSlug = designArticle?.guide ?? series?.relatedGuide ?? buyingGuides[slug] ?? categoryGuide?.slug;
  const article = guideSlug ? getArticleBySlug(guideSlug) : undefined;
  const guide = article && isPublishedGuide(article) ? article : undefined;
  const catalog = await getActiveProducts();
  const sharedIllustration = !isPreview && !variantGallery && gallery.imageKind === 'illustration' && gallery.images[0]
    ? catalog.find((item) => item.slug !== slug && item.availability !== 'preview'
      && item.imageKind === 'illustration' && item.primaryImage === gallery.images[0])
    : undefined;
  const related = catalog
    .filter((item) => item.slug !== slug && (item.availability === 'preview') === isPreview)
    .filter((item) => item.collectionSlug === product.collectionSlug || (!isPreview && item.category === product.category))
    .sort((a, b) => Number(b.collectionSlug === product.collectionSlug) - Number(a.collectionSlug === product.collectionSlug))
    .slice(0, 4);

  return (
    <>
      {(!isPreview || designArticle) && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(
        designArticle ? {
          '@context': 'https://schema.org', '@type': 'VisualArtwork', name: product.name,
          description: designArticle.detail, url: absoluteUrl(`/products/${slug}`),
          ...(product.primaryImage ? { image: [absoluteUrl(product.primaryImage)] } : {}),
          creator: { '@type': 'Organization', name: siteConfig.brand, url: absoluteUrl('/about') },
        } : checkoutEnabled ? productSchema(product) : catalogProductSchema(product)
      ) }} />}
      <SiteHeader />
      <main id="main" className={editorial ? `${styles.page} ${collectionStyles.tone}` : styles.page} data-tone={editorial?.tone}>
        <div className={`${styles.shell} ${styles.crumb}`}>
          <Breadcrumb items={[
            isPreview ? { label: 'Studio', href: '/studio' } : { label: 'Collections', href: '/collections' },
            ...(collection ? [collection] : []),
            { label: product.name },
          ]} />
        </div>
        <ProductOfferSection key={slug} slug={!isPreview && checkoutEnabled ? slug : null} className={`${styles.shell} ${styles.hero}`} headingId="piece-title">
          <header className={styles.identity}>
            <p className={styles.kicker}>{isPreview && !designArticle ? 'Studio design preview' : typeNames[product.category]}</p>
            <h1 id="piece-title">{product.name}</h1>
            {!designArticle && product.basePriceCents > 0 && !(product.variants && product.variants.length > 1) && (isPreview || !checkoutEnabled
              ? <p className={styles.price}>{isPreview ? 'Planned price' : 'Guide price'} {priceLabel(product.basePriceCents)}</p>
              : <ProductOfferPrice variant={variant} compareAt={product.compareAtPriceCents} />)}
          </header>

          <div className={styles.media}>
            {variantGallery ? (
              <VariantProductGallery name={product.name} media={sharedMedia} {...variantGallery} fallback={fallback} />
            ) : gallery.images.length ? (
              <ProductGallery key={slug} name={product.name} images={gallery.images} kind={gallery.imageKind} preview={isPreview} photoInquiry={photoInquiry} showCaption={!designArticle} />
            ) : <>{fallback}{photoInquiry && <ProductPhotoInquiryLink href={photoInquiry} />}</>}
            {sharedIllustration && (
              <p className={`${styles.note} mt-2`}>
                This studio image is also shared with the{' '}
                <Link prefetch={false} href={`/products/${sharedIllustration.slug}`} className="font-medium underline underline-offset-4">{sharedIllustration.name}</Link>.
                Include the item code when asking about either piece.
              </p>
            )}
          </div>

          <div className={styles.purchase}>
            {(product.description || product.subtitle) && <p className={styles.description}>{designArticle && slug === 'warm-light-pendant'
              ? 'A honey-colored oval framed by a slender bezel on a fine chain.'
              : product.description || product.subtitle}</p>}
            {isPreview ? (
              <div className={styles.order}>
                {!designArticle && <p className={styles.note}>This design is in development. Final materials, measurements and availability are pending.</p>}
                <Link prefetch={false} href={designInquiryHref} className="shop-button mt-3">Ask about this design <span aria-hidden="true">↗</span></Link>
              </div>
            ) : (
              <ProductPurchase
                key={slug}
                product={{ id: product.id, name: product.name, slug, image: product.primaryImage, heritage: product.heritage }}
                variant={variant}
                variants={product.variants}
                checkoutEnabled={checkoutEnabled}
              />
            )}
            <div className={styles.pieceDetails}>
              {!isPreview && <>
                <ul aria-label="Order assurances" className={styles.assurances}>
                  <li>{checkoutEnabled ? 'Secure Stripe Checkout' : 'Small-batch studio'}</li>
                  <li>Gift-ready pouch included</li>
                  <li>Worldwide delivery</li>
                </ul>
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
                </nav>
                <div className={styles.specifications}>
                  {product.materials?.length ? (
                    <details open>
                      <summary>Materials &amp; details</summary>
                      <ul>{product.materials.map((item) => <li key={item}>{item.replace(/(\d)(mm|cm)\b/g, '$1 $2')}</li>)}</ul>
                    </details>
                  ) : null}
                  <section id="piece-fit" aria-labelledby="piece-fit-title" className={styles.fitPanel} tabIndex={-1}>
                    <h2 id="piece-fit-title">Size &amp; fit</h2>
                    <p>{fit.note}</p>
                    <div className={styles.fitLinks}>
                      <Link prefetch={false} href={fit.href}>{fit.label} <span aria-hidden="true">↗</span></Link>
                      <ProductMeasurementsLink piece={product.name} variant={variant} variants={product.variants} measurements={fit.measurements} />
                    </div>
                  </section>
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
        </ProductOfferSection>

        {(designArticle || product.craftStory || guide) && (
          <section className={styles.story} aria-labelledby="piece-story">
            <div className={styles.shell}>
              <h2 id="piece-story">{isPreview ? 'Design notes' : 'The story behind the piece'}</h2>
              <div className={styles.storyCopy}>
                {designArticle ? (<>
                  <p>{designArticle.detail}</p>
                  <h3 className="font-display text-xl text-ink">How to style it</h3>
                  <p>{designArticle.styling}</p>
                </>) : product.craftStory?.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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
