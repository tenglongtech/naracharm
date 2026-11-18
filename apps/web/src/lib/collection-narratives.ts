type Narrative = {
  heroTitle: string;
  heroSubtitle: string;
  intro: string[];
  stylingTips: string[];
  guide: { slug: string; label: string };
};

const narratives: Partial<Record<string, Narrative>> = {
  crystal: {
    heroTitle: 'Crystal Bead Jewelry',
    heroSubtitle: 'Browse violet, pink, golden and green beads with matte or polished surfaces.',
    intro: ['Look at the finishes beside one another. A polished round catches a narrow band of light, while a matte bead has a softer edge. Both can give a bracelet a distinct shape even when the bead sizes are similar.'],
    stylingTips: ['Compare bead size when you stack a bracelet with a watch or another piece.', 'Start with a solid sleeve color if you want the differences between beads to show.'],
    guide: { slug: 'healing-crystals-101-beginners-guide', label: 'Choose your first piece of stone jewelry' },
  },
  charms: {
    heroTitle: 'Stone and Cord Phone Charms',
    heroSubtitle: 'Small loops and drops that pair cord, bead color and a visible fastening.',
    intro: ['Think about your phone case first. A narrow loop is a small accent on a busy case, while dark beads can set a clear edge against a light one. Compare the attachment loop with your case before choosing a charm.'],
    stylingTips: ['Use a case with a compatible lanyard opening.', 'Give the charm enough clearance around the camera and the charging port.'],
    guide: { slug: 'does-my-phone-case-fit-a-charm', label: 'Check whether your phone case fits a charm' },
  },
  'tibetan-silver': {
    heroTitle: 'Tibetan-Inspired Silver Jewelry',
    heroSubtitle: 'Amulet shapes, dark silver tones and small turquoise-colored accents.',
    intro: ['A dark outline can make a small blue-green center stand out. This collection takes its visual cues from the quiet contrast between an amulet shape, a narrow cord and an interruption of color.'],
    stylingTips: ['Give the central shape room beside a plain band or cuff.', 'Check the individual material listing if stone type or finish matters to you.'],
    guide: { slug: 'how-to-choose-turquoise-color-jewelry', label: 'Choose turquoise-colored jewelry' },
  },
  'mongolian-steppe': {
    heroTitle: 'Steppe-Inspired Cord Jewelry',
    heroSubtitle: 'Braided lines, sliding knots and deep, muted cord colors.',
    intro: ['The turn of a braided cord can be the part you notice first. A close crossing gives a slim wrist piece definition, while a narrow end bead can be the only bright point along a length of cord.'],
    stylingTips: ['Check how far a sliding loop opens over the hand.', 'Wear a low-profile cord with a loose cuff so the knot stays visible.'],
    guide: { slug: 'how-to-read-a-bracelet-closure', label: 'Compare bracelet closures' },
  },
  'southwest-filigree': {
    heroTitle: 'Miao-Inspired Openwork Jewelry',
    heroSubtitle: 'An exploration of thin wire, open flowers and the spaces between their outlines.',
    intro: ['Look at the part of the earring you can see through. In openwork, the gaps give individual lines room to show. A flower outline can read differently against dark hair than it does against a plain light collar.'],
    stylingTips: ['Compare the drop length to the collar or neckline you wear most often.', 'Try open shapes against a solid background before pairing them with a pattern.'],
    guide: { slug: 'choosing-openwork-earrings', label: 'Choose openwork earrings by shape and movement' },
  },
  'han-jade': {
    heroTitle: 'Jade-Tone Lotus and Cord Jewelry',
    heroSubtitle: 'Pale green shapes, clear edges and a restrained lotus detail.',
    intro: ['A pale lotus or narrow green edge is often easiest to see against a dark top. When choosing a piece, read the material description alongside the color and check how the cord sits near the neckline.'],
    stylingTips: ['Leave space between a small pendant and the edge of a collar.', 'Use the product’s material line to distinguish a jade-tone color from a specific stone.'],
    guide: { slug: 'what-jade-tone-means', label: 'Read jade-tone product descriptions' },
  },
  'tai-silk': {
    heroTitle: 'Thai-Inspired Silk Cord Charms',
    heroSubtitle: 'Folded cord and small metallic details that catch the light as they turn.',
    intro: ['A ribbon changes color where it bends toward the light. A small lotus or bead can make that movement easier to see without taking attention away from the textile.'],
    stylingTips: ['Choose a simple case color to make the cord’s folds visible.', 'Store a ribbon loop loosely, with room for the fabric and its hardware.'],
    guide: { slug: 'how-to-store-textile-jewelry', label: 'Store ribbon and textile jewelry' },
  },
  'caravan-fusion': {
    heroTitle: 'Caravan Fusion Jewelry',
    heroSubtitle: 'A meeting of open wire, a smooth center and the texture of cord.',
    intro: ['The point where two textures touch often carries the design. In the Caravan Fusion Necklace, an open wire detail gives the smoother pendant surface a defined edge. The woven cord changes the scale of the composition near the neckline.'],
    stylingTips: ['Let an open neckline frame the entire pendant.', 'For a layered look, repeat either a similar color or a similar surface finish.'],
    guide: { slug: 'how-to-style-two-textures-of-jewelry', label: 'Wear two jewelry textures together' },
  },
};

export function getCollectionNarrative(slug: string) {
  return narratives[slug];
}
