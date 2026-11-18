import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { ProductTile } from '@/components/product-tile';
import { getActiveProducts } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';

export const metadata = pageMetadata({
  title: 'Featured Jewelry and Phone Charms',
  description: 'Browse Nara Charm’s featured bracelets, necklaces, earrings and phone charms available to order.',
  path: '/best-sellers',
  image: { url: '/editorial/nara-worn-close.webp', alt: 'Illustrative styling with red beads, hammered silver and a green drop earring' },
});

export default async function FeaturedJewelryPage() {
  const inStock = (await getActiveProducts()).filter((product) => product.stock > 0 && product.availability !== 'preview');
  const featured = [...inStock].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)).slice(0, 8);

  return (
    <>
      <SiteHeader />
      <main id="main" className="section-wrap">
        <h1 className="font-display text-5xl tracking-tight md:text-7xl">Featured jewelry.</h1>
        <p className="mt-4 max-w-lg leading-7 text-muted">Pieces we’ve chosen for the way they use color, cord and small details. Each is available to order.</p>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4">
          {featured.map((product) => <ProductTile key={product.slug} product={productCard(product)} />)}
        </div>
        <Link href="/shop" className="shop-button mt-9">Shop all jewelry ↗</Link>
      </main>
      <SiteFooter />
    </>
  );
}
