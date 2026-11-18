import type { BlogArticle } from './blog-data';
export function editorialArt(article: Pick<BlogArticle, 'slug' | 'category'>) {
  const images: Record<string, { src: string; alt: string }> = {
    'choosing-openwork-earrings': { src: '/products/studio/ink-window-drops.webp', alt: 'An illustration of dark silver wire earrings casting tall rectangular shadows' },
    'why-jewelry-looks-different-in-photos': { src: '/editorial/studio-materials.webp', alt: 'A studio illustration of a braided cord, silver openwork, a pale green pendant and a red phone charm on linen' },
    'how-to-layer-necklaces-and-bracelets': { src: '/editorial/layering.webp', alt: 'Illustration of separated necklaces and bracelets, showing balanced colors and textures' },
    'choose-a-meaningful-jewelry-gift': { src: '/editorial/gifting.webp', alt: 'Illustrative gift scene with a pendant, blank personal note and ribbon; packaging is illustrative' },
    'everyday-jewelry-care-storage': { src: '/editorial/care.webp', alt: 'Illustration of jewelry stored separately beside a dry cloth and linen pouch' },
    'amethyst-meaning-healing-properties': { src: '/editorial/amethyst-daylight.webp', alt: 'Illustration comparing round violet beads and two faceted purple stones in daylight' },
    'moonstone-meaning-intuition-new-beginnings': { src: '/editorial/moonstone-sheen.webp', alt: 'Illustration of a pale domed pendant with a localized blue sheen' },
    'complete-crystal-cleansing-guide': { src: '/editorial/bead-care-cloth.webp', alt: 'Illustration of a strand of cloudy beads resting on a clean dry cloth' },
    'beaded-jewelry-care-guide': { src: '/editorial/nara-bracelet-cord-care.webp', alt: 'Illustration of a relaxed beaded bracelet showing a dark cord and knot between two drilled beads' },
  };
  return images[article.slug];
}
