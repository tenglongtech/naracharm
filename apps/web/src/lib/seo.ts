import { siteConfig } from './site-config';
import type { StorefrontProduct } from './storefront';
export function absoluteUrl(path: string) { return new URL(path, `${siteConfig.url.replace(/\/$/, '')}/`).href; }
export function productSchema(product: StorefrontProduct) {
  return {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    description: product.description || product.subtitle || undefined,
    image: product.images.map(absoluteUrl), sku: product.slug,
    brand: { '@type': 'Brand', name: siteConfig.brand }, category: product.category,
    material: product.materials?.join(', '),
    offers: { '@type': 'Offer', price: (product.basePriceCents / 100).toFixed(2), priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/products/${product.slug}`) },
  };
}
