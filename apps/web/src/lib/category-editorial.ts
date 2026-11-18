import type { CategorySlug } from './categories';

type CategoryGuide = { slug: string; label: string; note: string };

type CategoryEditorial = {
  tone: 'clay' | 'caravan' | 'silver' | 'silk';
  image: { src: string; alt: string };
  guides: readonly CategoryGuide[];
};

export const CATEGORY_EDITORIAL: Record<CategorySlug, CategoryEditorial> = {
  bracelets: {
    tone: 'clay',
    image: {
      src: '/editorial/nara-collection-still-life.webp',
      alt: 'Illustration of a red beaded bracelet with a lotus-engraved accent on a dark wooden tray',
    },
    guides: [
      { slug: 'how-to-read-a-bracelet-closure', label: 'Compare bracelet closures', note: 'Check how far a sliding loop opens and whether a clasp needs two hands.' },
      { slug: 'how-to-read-bead-size-online', label: 'Picture the bead size', note: 'Use a ruler or a bead you already own to judge how far the bracelet will sit off your wrist.' },
      { slug: 'bracelets-with-a-watch', label: 'Wear it with a watch', note: 'Bend your wrist with the watch on to see how much room a second piece can use.' },
    ],
  },
  necklaces: {
    tone: 'caravan',
    image: {
      src: '/editorial/nara-stone-and-silver.webp',
      alt: 'Styling illustration of a red and silver-colored pendant necklace over a natural linen neckline',
    },
    guides: [
      { slug: 'necklace-length-paper-test', label: 'Try the necklace length', note: 'Use a piece of string and the top you wear most often to see where the pendant will sit.' },
      { slug: 'how-to-compare-pendant-widths', label: 'Compare pendant widths', note: 'Hold a paper outline over your neckline to see how much room the shape needs.' },
      { slug: 'prevent-necklace-tangles', label: 'Keep fine necklaces untangled', note: 'Fasten each clasp and give the necklace enough space to lie loosely between wears.' },
    ],
  },
  earrings: {
    tone: 'silver',
    image: {
      src: '/editorial/nara-filigree-study.webp',
      alt: 'Illustration of two silver-colored openwork flower earrings on a slate surface',
    },
    guides: [
      { slug: 'reading-earring-drop-length', label: 'Check the drop length', note: 'Mark the listed length on a paper strip and see where it ends beside your jaw or collar.' },
      { slug: 'how-to-choose-lightweight-earrings', label: 'Compare weight per earring', note: 'Ask for the weight of a single earring and check where the heaviest part hangs.' },
      { slug: 'choosing-openwork-earrings', label: 'Look through the openwork', note: 'Compare the outline against both a light and a dark background.' },
    ],
  },
  'phone-charms': {
    tone: 'silk',
    image: {
      src: '/editorial/nara-silk-loop-study.webp',
      alt: 'Illustration of a red braided phone charm with a narrow black attachment loop on cream paper',
    },
    guides: [
      { slug: 'does-my-phone-case-fit-a-charm', label: 'Find the point of attachment', note: 'Check your case for a dedicated lanyard hole or a compatible insert.' },
      { slug: 'choosing-phone-charm-length', label: 'Choose a length for daily use', note: 'Measure from the attachment. A longer loop takes up more room in a pocket.' },
      { slug: 'choosing-color-for-a-phone-case', label: 'Pair the charm with your case', note: 'Use your actual case as the background, including the phone color under a clear case.' },
    ],
  },
};
