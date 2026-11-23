export const COLLECTION_EDITORIALS = [
  {
    slug: 'tibetan-silver',
    title: 'Tibetan Silver',
    note: 'Hammered silver, turquoise and braided cord',
    image: '/editorial/nara-amulet-study.webp',
    alt: 'Hammered sterling silver turquoise amulet bracelet and silver lotus beads on carved walnut wood and linen',
    tone: 'olive',
  },
  {
    slug: 'caravan-fusion',
    title: 'Caravan Fusion',
    note: 'Filigree silver, turquoise and woven cord',
    image: '/editorial/nara-caravan-study.webp',
    alt: 'Circular hammered silver filigree pendant with a turquoise cabochon on woven cord over terracotta cloth and dark slate',
    tone: 'clay',
  },
  {
    slug: 'han-jade',
    title: 'Han Jade',
    note: 'Celadon lotus carvings and quiet lines',
    image: '/editorial/nara-jade-study.webp',
    alt: 'Carved celadon jade-tone lotus pendant and matching jade bead bracelet on green slate and handmade paper',
    tone: 'jade',
  },
] as const;

type CollectionArtwork = { image: string; alt: string; tone: string };

const detailArtwork: Partial<Record<string, CollectionArtwork>> = {
  crystal: {
    image: '/editorial/amethyst-daylight.webp',
    alt: 'Polished amethyst beads beside two faceted stones in natural daylight',
    tone: 'amethyst',
  },
  charms: {
    image: '/products/redesigned/cinnabar-cord-charm.webp',
    alt: 'Red beaded phone charm with a braided cord knot and silver accents',
    tone: 'clay',
  },
  'mongolian-steppe': {
    image: '/products/redesigned/mongolian-road-knot-cord.webp',
    alt: 'Dark braided cord bracelet showing a sliding knot and two silver end beads',
    tone: 'steppe',
  },
  'southwest-filigree': {
    image: '/editorial/nara-filigree-study.webp',
    alt: 'Two open silver-wire floral earrings and slender ear hooks against gray stone',
    tone: 'silver',
  },
  'tai-silk': {
    image: '/editorial/nara-silk-loop-study.webp',
    alt: 'Braided red silk cord loop and silver lotus detail on textured paper',
    tone: 'silk',
  },
  'caravan-fusion': {
    image: '/products/redesigned/caravan-fusion-necklace-slate.webp',
    alt: 'Turquoise-centered hammered silver pendant on woven cord against dark green slate',
    tone: 'caravan',
  },
};

export function getCollectionArtwork(slug: string): CollectionArtwork | undefined {
  return Object.hasOwn(detailArtwork, slug) ? detailArtwork[slug] : COLLECTION_EDITORIALS.find((entry) => entry.slug === slug);
}
