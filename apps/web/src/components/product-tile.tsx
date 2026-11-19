import { isExternalProductImage } from '@/lib/product-media';
import { siteConfig } from '@/lib/site-config';
import Link from 'next/link';
import Image from '@/components/storefront-image';
import { LotusMark } from './lotus-mark';
import { DesignPalette } from './design-palette';

export type ProductCard = {
  slug: string;
  href?: string;
  name: string;
  heritage: string;
  price: string | null;
  compareAt?: string | null;
  tag?: string | null;
  image?: string;
  isPreview?: boolean;
  isIllustration?: boolean;
  palette?: readonly [string, string, string];
};

export function ProductTile({
  product, sizes = '(max-width: 767px) 47vw, (max-width: 1392px) 24vw, 320px', heading: Heading = 'h3', prioritizeImage = false,
}: { product: ProductCard; sizes?: string; heading?: 'h3' | 'h4'; prioritizeImage?: boolean }) {
  const hasVisual = product.image || product.palette;
  const priceLabel = product.isPreview ? 'Planned price' : !siteConfig.checkoutEnabled ? 'Guide price' : null;
  const tag = product.tag === 'Sold out' && !siteConfig.checkoutEnabled ? null : product.tag;
  return (
    <Link href={product.href ?? `/products/${product.slug}`} prefetch={false} className="group block min-w-0">
      <div className={`relative overflow-hidden rounded-sm bg-surface ${product.palette && !product.image ? 'aspect-[4/1]' : 'aspect-square'}`}>
        {product.image ? (
          <Image
            src={product.image}
            unoptimized={isExternalProductImage(product.image)}
            alt={`${product.name}${product.isIllustration ? ' design illustration' : ''}`}
            fill
            sizes={sizes}
            loading={prioritizeImage ? 'eager' : undefined}
            fetchPriority={prioritizeImage ? 'high' : undefined}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : product.palette ? (
          <DesignPalette palette={product.palette} />
        ) : (
          <div className="flex h-full items-center justify-center text-muted/40"><LotusMark className="h-12 w-12" /></div>
        )}
        {tag && product.image && (
          <span className="absolute left-2 top-2 rounded-sm bg-bg px-2 py-1 text-[10px] font-medium text-brand">{tag}</span>
        )}
      </div>
      <p className="mt-3 text-xs text-muted">{product.heritage}</p>
      <Heading className="mt-1 font-display text-lg leading-snug group-hover:text-brand">{product.name}</Heading>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 text-sm tabular-nums">
        {product.price && <span>{priceLabel && <span className="text-xs text-muted">{priceLabel} </span>}{product.price}</span>}
        {siteConfig.checkoutEnabled && !product.isPreview && product.compareAt && <span className="text-muted line-through">{product.compareAt}</span>}
        {!product.image && (tag || !hasVisual) && <span className="text-xs text-muted">{tag ?? 'Photo pending'}</span>}
      </div>
      {product.isIllustration && <p className="mt-1 text-xs text-muted">Design illustration</p>}
    </Link>
  );
}
