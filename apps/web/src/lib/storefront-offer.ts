export type StorefrontVariant = {
  id: string;
  sku: string;
  name: string;
  unitPriceCents: number;
  stock: number;
  photoUrls?: string[];
};

export type LiveOffer = Pick<StorefrontVariant, 'id' | 'sku' | 'unitPriceCents' | 'stock'>;

export function applyLiveOffer(variant: StorefrontVariant, offers: ReadonlyMap<string, LiveOffer> | null): StorefrontVariant {
  if (!offers) return variant;
  const offer = offers.get(variant.id);
  if (offer?.sku !== variant.sku) return { ...variant, stock: 0 };
  return { ...variant, stock: offer.stock, unitPriceCents: offer.unitPriceCents };
}

export const variantQueryKey = 'sku';

export function defaultCatalogSku(slug: string) {
  return `NC-${slug.toUpperCase()}`;
}

export function productOfferPath(slug: string, sku?: string) {
  const path = `/products/${slug}`;
  return sku ? `${path}?${new URLSearchParams({ [variantQueryKey]: sku })}` : path;
}

export function variantOption(variants: readonly StorefrontVariant[]) {
  const uniqueNames = new Set(variants.map(({ name }) => name.trim().toLowerCase())).size === variants.length;
  return uniqueNames ? 'Variant' : 'SKU';
}

export function variantTitle(name: string, variant: Pick<StorefrontVariant, 'name'>) {
  return `${name} – ${variant.name}`;
}

/** The variants arrive in the stable order used by the storefront export. */
export function storefrontOffer(variants: readonly StorefrontVariant[], basePriceCents: number) {
  const valid = variants.filter((variant) => variant.unitPriceCents > 0);
  const variant = valid.find((item) => item.stock > 0) ?? valid[0];
  return variant ? {
    variant,
    ...(valid.length > 1 ? { variants: valid } : {}),
    basePriceCents: variant.unitPriceCents,
    stock: variant.stock,
  } : { basePriceCents, stock: 0 };
}
