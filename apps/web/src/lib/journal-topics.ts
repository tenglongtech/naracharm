import type { BlogArticle } from './blog-data';

type Topic = {
  slug: string;
  category: BlogArticle['category'];
  title: string;
  description: string;
  featured: string;
  backdrop: string;
  cover: { src: string; alt: string };
};

export const JOURNAL_TOPICS: Topic[] = [
  {
    slug: 'materials', category: 'Materials', title: 'Materials & Finishes',
    description: 'Read stone, textile and metal descriptions, compare finishes in everyday light and know what to ask when a listing is unclear.',
    featured: 'matte-vs-polished-beads', backdrop: '#dedacb',
    cover: { src: '/editorial/studio-materials.webp', alt: 'Illustration of woven cords, pale stone and silver openwork on linen' },
  },
  {
    slug: 'fit', category: 'Fit & Buying', title: 'Fit & Buying',
    description: 'Check the size and construction of a bracelet, pendant, earring or phone charm before you choose it.',
    featured: 'bracelet-size-guide-how-to-measure', backdrop: '#e6dcc5',
    cover: { src: '/products/studio/long-horizon-braid.webp', alt: 'Illustration of a flat braided bracelet and its folded closure' },
  },
  {
    slug: 'styling', category: 'Styling', title: 'Jewelry Styling',
    description: 'Practical ways to combine different textures, necklines and colors with pieces you wear often.',
    featured: 'how-to-layer-necklaces-and-bracelets', backdrop: '#e8d7cb',
    cover: { src: '/editorial/nara-stone-and-silver.webp', alt: 'Illustration of a red beaded silver pendant against an ivory neckline' },
  },
  {
    slug: 'care', category: 'Care Guide', title: 'Jewelry Care',
    description: 'Store pieces separately, spot wear early and take everyday care of cord, beads and delicate findings.',
    featured: 'complete-crystal-cleansing-guide', backdrop: '#e3ddcc',
    cover: { src: '/editorial/bead-care-cloth.webp', alt: 'Illustration of a strand of beads resting on a clean dry cloth' },
  },
  {
    slug: 'gifting', category: 'Gift Guide', title: 'Jewelry Gifts',
    description: 'Choose jewelry with the recipient’s habits, fit and meaningful details in mind.',
    featured: 'choose-a-meaningful-jewelry-gift', backdrop: '#e9d6d3',
    cover: { src: '/editorial/gifting.webp', alt: 'Illustration of a pendant, blank note and red ribbon' },
  },
  {
    slug: 'motifs', category: 'Symbolism', title: 'Motifs & Meaning',
    description: 'Look closely at petals, lines, knots and the personal connections people give to jewelry.',
    featured: 'how-to-choose-a-lotus-design', backdrop: '#e0e6d9',
    cover: { src: '/editorial/nara-jade-study.webp', alt: 'Illustration of the petal and leaf lines in a carved jade-tone pendant' },
  },
  {
    slug: 'stones', category: 'Crystal Meanings', title: 'Stone Colors & Stories',
    description: 'Compare how gemstones look and wear, and explore the associations people bring to them.',
    featured: 'amethyst-meaning-healing-properties', backdrop: '#ddd8e1',
    cover: { src: '/editorial/amethyst-daylight.webp', alt: 'Illustration comparing purple beads and faceted stones in daylight' },
  },
];

export function getJournalTopic(category: BlogArticle['category']) {
  return JOURNAL_TOPICS.find((topic) => topic.category === category);
}
