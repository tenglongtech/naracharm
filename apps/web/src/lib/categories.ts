import type { StorefrontProduct } from './storefront';

/** Labels and search metadata for the category browse pages. */
export type CategorySlug = 'phone-charms' | 'necklaces' | 'bracelets' | 'earrings';

export type Category = {
  slug: CategorySlug;
  productType: StorefrontProduct['category'];
  name: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: 'phone-charms',
    productType: 'phone-charm',
    name: 'Phone Charms',
    heroSubtitle: 'Braided loops, polished beads and small charms for phone cases with an attachment point.',
    seoTitle: 'Beaded & Braided Phone Charms',
    seoDescription: 'Shop beaded and braided phone charms from Nara Charm. Explore dark stone beads, warm red cords and small silver details.',
  },
  {
    slug: 'necklaces',
    productType: 'necklace',
    name: 'Necklaces',
    heroSubtitle: 'Openwork pendants, softly colored stones and fine cord to wear at the neckline.',
    seoTitle: 'Pendants & Stone Necklaces',
    seoDescription: 'Shop necklaces from Nara Charm, including carved lotus and turquoise pendants with woven and adjustable cords.',
  },
  {
    slug: 'bracelets',
    productType: 'bracelet',
    name: 'Bracelets',
    heroSubtitle: 'Rounded stone beads, braided cords and small silver details, from single strands to pieces to layer.',
    seoTitle: 'Beaded & Braided Cord Bracelets',
    seoDescription: 'Shop beaded and cord bracelets from Nara Charm. Browse amethyst, rose quartz, turquoise and adjustable braided styles.',
  },
  {
    slug: 'earrings',
    productType: 'earrings',
    name: 'Earrings',
    heroSubtitle: 'Fine silver outlines and softly colored stone drops that leave room for light to show through.',
    seoTitle: 'Silver Openwork & Stone Drop Earrings',
    seoDescription: 'Explore Nara Charm earrings, from silver filigree flowers to amethyst drops on slender earwires.',
  },
];
