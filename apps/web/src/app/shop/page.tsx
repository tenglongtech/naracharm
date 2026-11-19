import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductCatalog } from '@/components/product-catalog';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';
import { catalogEntry } from '@/lib/catalog';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
import styles from '../catalog-page.module.css';

export const metadata = pageMetadata({
  title: 'Shop Bracelets, Necklaces, Earrings & Phone Charms',
  description: 'Find bracelets, necklaces, earrings and phone charms by collection, category and material. Browse current catalog pieces and designs from the Nara Charm studio.',
  path: '/shop',
  image: { url: '/editorial/nara-collection-still-life.webp', alt: 'Illustrative jewelry still life with red beads, an engraved silver bead and linen' },
});

export default async function ShopPage() {
  const [products, collections] = await Promise.all([getActiveProducts(), getAllCollections()]);
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.page}>
        <header className={styles.intro}>
          <div className={styles.shell}>
            <div className={styles.heading}>
              <h1>Shop jewelry</h1>
              <p>{siteConfig.checkoutEnabled
                ? 'Find pieces ready to order, or explore new designs in the studio.'
                : 'Browse the jewelry catalog and inquire about a piece. Studio previews show designs in development.'}</p>
            </div>
            <nav aria-label="Shop by category" className={styles.categories}>
              {CATEGORIES.map(({ slug, name }) => (
                <Link prefetch={false} key={slug} href={`/collections/${slug}`}>{name} <span aria-hidden="true">↗</span></Link>
              ))}
            </nav>
          </div>
        </header>
        <div className={`${styles.shell} ${styles.catalog}`}>
          <ProductCatalog products={products.map(catalogEntry)} collections={collections.map(({ slug, name }) => ({ slug, name }))} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
