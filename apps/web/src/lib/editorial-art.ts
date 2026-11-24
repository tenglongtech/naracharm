import type { ArticleImage, BlogArticle } from './blog-data';

const images: Readonly<Partial<Record<string, ArticleImage>>> = {
  'tibetan-silver-vs-925-sterling-silver': {
    src: '/editorial/nara-amulet-study.webp',
    alt: 'Hand-hammered oxidized 925 sterling silver turquoise amulet bracelet and silver lotus beads on carved walnut wood and linen',
  },
  'natural-turquoise-vs-dyed-howlite-guide': {
    src: '/editorial/nara-caravan-study.webp',
    alt: 'Circular hammered silver filigree pendant set with a natural turquoise cabochon over terracotta woven cloth and dark slate',
  },
  'red-cord-bracelet-meaning-which-wrist': {
    src: '/editorial/cord-and-silver.webp',
    alt: 'Coiled deep crimson braided silk cord beside a hammered sterling silver lotus bead, turquoise cabochon and brass tweezers',
  },
  'meaningful-handmade-jewelry-gifts-under-100': {
    src: '/editorial/nara-gift-still-life.webp',
    alt: 'Celadon lotus pendant styled beside a cream note card and warm red ribbon for gifting',
  },
  'bead-size-guide-6mm-vs-8mm-vs-10mm-bracelets': {
    src: '/editorial/nara-collection-still-life.webp',
    alt: 'Polished stone bead bracelet with an engraved hammered silver lotus centerpiece on a carved walnut tray',
  },
  'history-of-gemstone-jewelry': {
    src: '/editorial/senebtisi-collar.webp',
    alt: 'Broad Egyptian beaded collar with curved bands of color, gold-toned drops and two falcon heads',
    caption: 'Broad collar of Senebtisi, Egypt, Middle Kingdom, ca. 1850–1775 BCE.',
    credit: { url: 'https://www.metmuseum.org/art/collection/search/544168', label: 'The Met, 08.200.30 · Public Domain' },
  },
  'choosing-openwork-earrings': { src: '/products/studio/ink-window-drops.webp', alt: 'Dark silver openwork wire earrings casting tall rectangular shadows' },
  'why-jewelry-looks-different-in-photos': { src: '/editorial/studio-materials.webp', alt: 'Braided cord, silver openwork, a pale green pendant and a red phone charm arranged on linen' },
  'how-to-layer-necklaces-and-bracelets': { src: '/editorial/layering.webp', alt: 'Layered necklaces and bracelets showing balanced spacing, colors and textures' },
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
  'choose-a-meaningful-jewelry-gift': { src: '/editorial/gifting.webp', alt: 'Lotus pendant styled with a blank personal note and warm red ribbon' },
  'best-jewelry-gifts-for-mom': { src: '/editorial/nara-gift-still-life.webp', alt: 'Lotus-shaped green pendant on a blank note beside a rust-colored ribbon' },
  'anniversary-wedding-crystal-gift-guide': {
    src: '/editorial/anniversary-jewelry-pair.webp',
    alt: 'A mauve beaded bracelet and a pale lilac pendant on cream woven cloth',
    caption: 'Purple tones and silver-colored details connect two distinct shapes.',
  },
  'everyday-jewelry-care-storage': { src: '/editorial/care.webp', alt: 'Jewelry stored separately beside a soft dry polishing cloth and linen pouch' },
  'amethyst-meaning-healing-properties': { src: '/editorial/amethyst-daylight.webp', alt: 'Round violet amethyst beads compared beside faceted purple stones in natural daylight' },
  'moonstone-meaning-intuition-new-beginnings': { src: '/editorial/moonstone-sheen.webp', alt: 'Pale domed moonstone pendant showing a localized blue sheen' },
  'complete-crystal-cleansing-guide': { src: '/editorial/bead-care-cloth.webp', alt: 'Strand of smooth stone beads resting on a clean dry cotton cloth' },
  'beaded-jewelry-care-guide': { src: '/editorial/nara-bracelet-cord-care.webp', alt: 'Relaxed beaded bracelet showing the cord and knot between two drilled stone beads' },
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
