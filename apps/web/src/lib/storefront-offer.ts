export type StorefrontVariant = {
  id: string;
  sku: string;
  name: string;
  unitPriceCents: number;
  stock: number;
};

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
