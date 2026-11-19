import type { ArticleImage, BlogArticle } from './blog-data';

const images: Readonly<Partial<Record<string, ArticleImage>>> = {
  'history-of-gemstone-jewelry': {
    src: '/editorial/senebtisi-collar.webp',
    alt: 'Broad Egyptian beaded collar with curved bands of color, gold-toned drops and two falcon heads',
    caption: 'Broad collar of Senebtisi, Egypt, Middle Kingdom, ca. 1850–1775 BCE.',
    credit: { url: 'https://www.metmuseum.org/art/collection/search/544168', label: 'The Met, 08.200.30 · Public Domain' },
  },
  'choosing-openwork-earrings': { src: '/products/studio/ink-window-drops.webp', alt: 'An illustration of dark silver wire earrings casting tall rectangular shadows' },
  'why-jewelry-looks-different-in-photos': { src: '/editorial/studio-materials.webp', alt: 'A studio illustration of a braided cord, silver openwork, a pale green pendant and a red phone charm on linen' },
  'how-to-layer-necklaces-and-bracelets': { src: '/editorial/layering.webp', alt: 'Illustration of separated necklaces and bracelets, showing balanced colors and textures' },
  'crystal-jewelry-evening-wear-guide': {
    src: '/editorial/evening-neckline-pendant.webp',
    alt: 'An oval blue-green pendant on a dark cord with space around it inside a navy V-neck',
    caption: 'The pendant stays clear of the fabric edge, with a thin silver-colored rim visible under warm light.',
  },
  'choosing-jewelry-for-a-group-photo': {
    src: '/editorial/group-photo-pendant-contrast.webp',
    alt: 'Three people in a group portrait, with a dark oval pendant visible against the center person’s light neckline',
    caption: 'The dark pendant is small, but its outline is still visible in the wider frame.',
  },
  'choose-a-meaningful-jewelry-gift': { src: '/editorial/gifting.webp', alt: 'Illustrative gift scene with a pendant, blank personal note and ribbon; packaging is illustrative' },
  'best-jewelry-gifts-for-mom': { src: '/editorial/nara-gift-still-life.webp', alt: 'Lotus-shaped green pendant on a blank note beside a rust-colored ribbon' },
  'anniversary-wedding-crystal-gift-guide': {
    src: '/editorial/anniversary-jewelry-pair.webp',
    alt: 'A mauve beaded bracelet and a pale lilac pendant on cream woven cloth',
    caption: 'Purple tones and silver-colored details connect two distinct shapes.',
  },
  'everyday-jewelry-care-storage': { src: '/editorial/care.webp', alt: 'Illustration of jewelry stored separately beside a dry cloth and linen pouch' },
  'amethyst-meaning-healing-properties': { src: '/editorial/amethyst-daylight.webp', alt: 'Illustration comparing round violet beads and two faceted purple stones in daylight' },
  'moonstone-meaning-intuition-new-beginnings': { src: '/editorial/moonstone-sheen.webp', alt: 'Illustration of a pale domed pendant with a localized blue sheen' },
  'complete-crystal-cleansing-guide': { src: '/editorial/bead-care-cloth.webp', alt: 'Illustration of a strand of cloudy beads resting on a clean dry cloth' },
  'beaded-jewelry-care-guide': { src: '/editorial/nara-bracelet-cord-care.webp', alt: 'Illustration of a relaxed beaded bracelet showing a dark cord and knot between two drilled beads' },
  'bracelet-size-guide-how-to-measure': {
    src: '/editorial/fit-wrist-paper-strip.webp',
    alt: 'Hands pinching the overlap of a plain paper strip wrapped flat around a bare wrist',
    caption: 'Mark the overlap before removing the paper. Lay it flat against a ruler to read the wrist circumference.',
  },
  'necklace-length-paper-test': {
    src: '/editorial/fit-necklace-string-template.webp',
    alt: 'Dark string with a small paper pendant template against an open linen neckline',
    caption: 'Use the string to test the necklace length. Place a paper cutout where the pendant would sit.',
  },
  'reading-earring-drop-length': {
    src: '/editorial/fit-earring-drop-template.webp',
    alt: 'An openwork drop earring next to a paper strip aligned with the top of the hook and the bottom of the drop',
    caption: 'Cut a paper strip to the full drop length, then hold it beside your ear to see where the earring would end.',
  },
  'does-my-phone-case-fit-a-charm': {
    src: '/editorial/fit-phone-case-lanyard-eyelet.webp',
    alt: 'A red phone charm attached to a case eyelet with the charging port still clear',
    caption: 'Look for a dedicated attachment point on the case and check that the charging port stays clear.',
  },
};

export function editorialArt(article: Pick<BlogArticle, 'slug'>) {
  return images[article.slug];
}

export function articleImagePaths(article: Pick<BlogArticle, 'slug' | 'content'>) {
  const cover = editorialArt(article);
  const figures = article.content.flatMap(({ image }) => image ? [image.src] : []);
  return [...new Set(cover ? [cover.src, ...figures] : figures)];
}
