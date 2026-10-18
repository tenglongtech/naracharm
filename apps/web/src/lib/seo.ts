import { siteConfig } from './site-config';
import type { StorefrontProduct } from './storefront';
import { STATIC_REVIEWS } from './storefront-data';

export function absoluteUrl(path: string) { return new URL(path, `${siteConfig.url.replace(/\/$/, '')}/`).href; }

export function productSchema(product: StorefrontProduct) {
  const returnWindowDays = siteConfig.returnWindowDays || 30;
  const isFreeShipping = (product.basePriceCents / 100) >= siteConfig.freeShippingThresholdUsd;

  const reviews = ((STATIC_REVIEWS as Record<string, Array<{ authorName?: string; rating?: number; title?: string; text?: string; createdAt?: string }>>)[product.id] || []);
  let aggregateRating: object | undefined;
  let reviewList: object[] | undefined;

  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = (sum / reviews.length).toFixed(1);
    aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg,
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    };
    reviewList = reviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName || 'Verified Customer' },
      datePublished: r.createdAt ? r.createdAt.slice(0, 10) : '2026-08-01',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating || 5),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.text || r.title || 'Beautiful handcrafted piece.',
    }));
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.subtitle || undefined,
    image: product.images.map(absoluteUrl),
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: siteConfig.brand,
    },
    category: product.category,
    material: product.materials?.join(', '),
    itemCondition: 'https://schema.org/NewCondition',
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(reviewList ? { review: reviewList } : {}),
    offers: {
      '@type': 'Offer',
      price: (product.basePriceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/products/${product.slug}`),
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: ['US', 'CA', 'GB', 'AU'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: returnWindowDays,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: isFreeShipping ? '0' : '9.99',
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['US', 'CA', 'GB', 'AU'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'd',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 10,
            unitCode: 'd',
          },
        },
      },
    },
  };
}
