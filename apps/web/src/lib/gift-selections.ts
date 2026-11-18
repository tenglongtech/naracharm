import type { StorefrontProduct } from './storefront';

const budgets = [
  {
    id: 'under-40', label: 'Under $40', from: 0, before: 4_000,
    description: 'Small pieces for a thank-you or a first gift.',
  },
  {
    id: '40-to-80', label: '$40 to under $80', from: 4_000, before: 8_000,
    description: 'Everyday pieces with room to choose a favorite material or finish.',
  },
  {
    id: '80-and-up', label: '$80 and up', from: 8_000, before: Infinity,
    description: 'Distinctive pieces for a milestone or an occasion.',
  },
] as const;

export function giftSelections(products: readonly StorefrontProduct[]) {
  const available = products.filter(({ availability, basePriceCents, stock }) =>
    availability !== 'preview' && stock > 0 && Number.isInteger(basePriceCents) && basePriceCents > 0,
  );
  available.sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured));

  return budgets.flatMap(({ id, label, description, from, before }) => {
    const picks = available.filter(({ basePriceCents }) => basePriceCents >= from && basePriceCents < before).slice(0, 4);
    return picks.length ? [{ id, label, description, picks }] : [];
  });
}
