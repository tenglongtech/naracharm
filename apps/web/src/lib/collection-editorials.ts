export const COLLECTION_EDITORIALS = [
  {
    slug: 'tibetan-silver',
    title: 'Tibetan Silver',
    note: 'Dark silver and amulet shapes',
    image: '/editorial/nara-amulet-study.webp',
    alt: 'Illustrative study of a dark silver lotus amulet and red stone beads on a carved wooden plate',
    tone: 'olive',
  },
  {
    slug: 'caravan-fusion',
    title: 'Caravan Fusion',
    note: 'Stone, metal and woven texture',
    image: '/editorial/nara-caravan-study.webp',
    alt: 'Illustrative study of green stone drops in warm metal settings on rust-colored woven fabric',
    tone: 'clay',
  },
  {
    slug: 'han-jade',
    title: 'Han Jade',
    note: 'Soft greens and carved forms',
    image: '/editorial/nara-jade-study.webp',
    alt: 'Illustrative study of a carved jade-tone pendant resting on paper and deep green stone',
    tone: 'jade',
  },
] as const;

type CollectionArtwork = { image: string; alt: string; tone: string };

const detailArtwork: Partial<Record<string, CollectionArtwork>> = {
  crystal: {
    image: '/editorial/amethyst-daylight.webp',
    alt: 'Illustrative study of polished amethyst beads beside two faceted stones in daylight',
    tone: 'amethyst',
  },
  charms: {
    image: '/products/redesigned/cinnabar-cord-charm.webp',
    alt: 'Illustration of a red beaded phone charm with a cord knot and silver-colored spacers',
    tone: 'clay',
  },
  'mongolian-steppe': {
    image: '/products/redesigned/mongolian-road-knot-cord.webp',
    alt: 'Illustration of a dark braided bracelet showing a sliding knot and two end beads',
    tone: 'steppe',
  },
  'southwest-filigree': {
    image: '/editorial/nara-filigree-study.webp',
    alt: 'Illustrative study of two open silver-wire flowers and their fine ear hooks against gray stone',
    tone: 'silver',
  },
  'tai-silk': {
    image: '/editorial/nara-silk-loop-study.webp',
    alt: 'Illustrative study of a braided red cord loop and a silver-colored attachment on textured paper',
    tone: 'silk',
  },
  'caravan-fusion': {
    image: '/products/redesigned/caravan-fusion-necklace-slate.webp',
    alt: 'Illustration of a turquoise-centered silver pendant on woven cord against a dark green surface',
    tone: 'caravan',
  },
};

export function getCollectionArtwork(slug: string): CollectionArtwork | undefined {
  return Object.hasOwn(detailArtwork, slug) ? detailArtwork[slug] : COLLECTION_EDITORIALS.find((entry) => entry.slug === slug);
}
