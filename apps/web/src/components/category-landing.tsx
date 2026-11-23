import Link from 'next/link';
import Image from '@/components/storefront-image';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { CATEGORIES, type Category } from '@/lib/categories';
import { CATEGORY_EDITORIAL } from '@/lib/category-editorial';
import { absoluteUrl, serializeJsonLd } from '@/lib/seo';
import tones from '@/app/collection-tones.module.css';
import styles from './category-landing.module.css';

export function CategoryLanding({ category, products }: { category: Category; products: ProductCard[] }) {
  const { slug, name, heroSubtitle, seoDescription } = category;
  const { tone, image, guides } = CATEGORY_EDITORIAL[slug];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: seoDescription,
    url: absoluteUrl(`/collections/${slug}`),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem', position: index + 1, name: product.name, url: absoluteUrl(`/products/${product.slug}`),
      })),
    },
  };

  return (
    <main id="main" className={tones.tone} data-tone={tone}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <header className={styles.hero}>
        <div className={styles.shell}>
          <Breadcrumb items={[{ label: 'Collections', href: '/collections' }, { label: name }]} />
          <div className={styles.spread}>
            <div className={styles.heroCopy}>
              <h1>{name}</h1>
              <p>{heroSubtitle}</p>
              <div className={styles.actions}>
                <a href="#category-pieces" className={styles.primaryLink}>Browse the pieces <span aria-hidden="true">↓</span></a>
                <a href="#category-guides" className={styles.textLink}>What to look for <span aria-hidden="true">↓</span></a>
              </div>
            </div>
            <figure className={styles.artwork}>
              <Image src={image.src} alt={image.alt} fill preload sizes="(max-width: 819px) 90vw, (max-width: 1439px) 48vw, 700px" />
            </figure>
          </div>
        </div>
      </header>

      <nav aria-label="Shop by category" className={styles.categoryBar}>
        <ul className={styles.shell}>
          {CATEGORIES.map(({ slug: itemSlug, name: itemName }) => (
            <li key={itemSlug}>
              <Link prefetch={false} href={`/collections/${itemSlug}`} aria-current={itemSlug === slug ? 'page' : undefined}>{itemName}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`${styles.shell} ${styles.layout}`}>
        <section id="category-pieces" aria-labelledby="category-pieces-title" tabIndex={-1}>
          <div className={styles.piecesHeading}>
            <h2 id="category-pieces-title">Shop {name.toLowerCase()}</h2>
            <p>{products.length} {products.length === 1 ? 'piece' : 'pieces'}</p>
          </div>
          {products.length ? (
            <div className={products.length <= 2 ? styles.pair : styles.grid}>
              {products.map((product) => (
                <ProductTile key={product.slug} product={product}
                  sizes={products.length <= 2 ? '(max-width: 979px) 44vw, 400px' : '(max-width: 639px) 44vw, (max-width: 979px) 29vw, 295px'} />
              ))}
            </div>
          ) : (
            <>
              <p>This category is between listings.</p>
              <Link prefetch={false} href="/shop" className={styles.textLink}>Browse all jewelry <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </section>

        <aside id="category-guides" aria-labelledby="category-guides-title" className={styles.guides} tabIndex={-1}>
          <h2 id="category-guides-title">Before you choose</h2>
          <ul>
            {guides.map(({ slug: guide, label, note }) => (
              <li key={guide}>
                <Link prefetch={false} href={`/blog/${guide}`} className={styles.guideLink}>
                  <span>{label}</span><span aria-hidden="true">↗</span>
                </Link>
                <p>{note}</p>
              </li>
            ))}
          </ul>
          <Link prefetch={false} href="/studio" className={styles.textLink}>Explore studio designs <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </main>
  );
}
