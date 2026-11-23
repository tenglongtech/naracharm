import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductCatalog } from '@/components/product-catalog';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';
import { catalogEntry } from '@/lib/catalog';
import styles from '../catalog-page.module.css';

export const metadata: Metadata = {
  title: 'Search Jewelry', robots: { index: false, follow: true }, alternates: { canonical: '/search' },
};

export default async function SearchPage() {
  const [products, collections] = await Promise.all([getActiveProducts(), getAllCollections()]);
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.page}>
        <header className={styles.intro}>
          <div className={`${styles.shell} ${styles.heading}`}>
            <h1>Search jewelry</h1>
          </div>
        </header>
        <div className={`${styles.shell} ${styles.catalog}`}>
          <ProductCatalog products={products.map(catalogEntry)} collections={collections.map(({ slug, name, kind }) => ({ slug, name, kind }))} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
