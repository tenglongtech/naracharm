/**
 * 系列叙事内容 (静态映射)
 *
 * 每个系列的文化故事/Symbols/Materials/Styling。
 * 商品数据从 DB 动态读,叙事从这读。
 * 接 STORY_DOCTRINE 的五条根: 藏/蒙/西南/泰/汉 + 融合 + 水晶。
 */

export type CollectionSlug =
  | 'crystal'
  | 'charms'
  | 'tibetan-silver'
  | 'mongolian-steppe'
  | 'southwest-filigree'
  | 'han-jade'
  | 'tai-silk'
  | 'caravan-fusion';

type Narrative = {
  heroTitle: string;
  heroSubtitle: string;
  tagline?: string;
  intro?: string[];
  symbols?: { name: string; meaning: string }[];
  materials?: { name: string; origin: string; desc: string }[];
  stylingTips?: string[];
};

const NARRATIVES: Record<string, Narrative> = {
  crystal: {
    heroTitle: 'The Crystal Collection',
    heroSubtitle: 'Natural stones, each carrying a meaning older than memory.',
    tagline: 'Stones with a story',
    intro: [
      'For thousands of years, people have worn stones not just for beauty, but for what they believed the stones could do. Amethyst for calm. Rose quartz for love. Turquoise for protection. Jade for wisdom.',
      'This collection brings that tradition into the present. Every bead is natural stone, graded and matched by eye, then strung by hand with small Miao silver accents. No two beads are identical — the variation is the point.',
      'You do not have to believe in the power of stones to wear them. But there is a kind of meaning that comes from choosing a stone, knowing what it has meant to others, and carrying it with you.',
    ],
    symbols: [
      { name: 'Amethyst 紫水晶', meaning: 'The stone of calm — worn to quiet a busy, loud mind.' },
      { name: 'Rose Quartz 粉水晶', meaning: 'The stone of unconditional love — for tenderness, toward others and self.' },
      { name: 'Turquoise 绿松石', meaning: 'A piece of fallen sky — protective, sacred, given at birth.' },
      { name: 'Jade 玉', meaning: 'The stone of wisdom — slow, deep, patient, treasured above gold.' },
    ],
    materials: [
      { name: 'Natural Crystal Beads', origin: 'Graded by eye', desc: 'Genuine stones — amethyst, quartz, turquoise. No two beads alike.' },
      { name: 'Miao Silver Accents', origin: 'Southwest China', desc: 'Hand-finished silver beads from Miao silversmiths.' },
      { name: 'Elastic Cord', origin: 'Hand-strung', desc: 'Durable stretch cord, knotted by hand for a comfortable fit.' },
    ],
    stylingTips: [
      'Stack two or three crystal bracelets together — different stones for different moods.',
      'A single statement piece (like turquoise) reads beautifully against neutral tones.',
      'Crystal bracelets layer well with metal watches and bangles.',
    ],
  },

  charms: {
    heroTitle: 'The Phone Charm Collection',
    heroSubtitle: 'Small charms of stone and cord, that follow you everywhere.',
    tagline: 'Meaning, carried everywhere',
    intro: [
      'Your phone goes everywhere with you. It made sense, then, to make something for it that carries meaning — not just decoration, but a small weight of intention.',
      'Each charm pairs natural protective stones with hand-braided cord in the traditional style. The braiding is done slowly, knot by knot, by hand.',
      'A phone charm is a small thing. But a hundred times a day, your phone lights up — and now, each time, a small piece of old meaning lights up with it.',
    ],
    symbols: [
      { name: 'Obsidian 黑曜石', meaning: 'The protective stone — worn since the Stone Age to guard against bad days.' },
      { name: 'Red Cord 红绳', meaning: 'Across Asia, red is the color of blessing, protection, and good fortune.' },
      { name: 'The Knot 绳结', meaning: 'Each hand-tied knot is a small act of patience and devotion.' },
    ],
    materials: [
      { name: 'Natural Stone Beads', origin: 'Hand-selected', desc: 'Obsidian, turquoise, and cinnabar-red stones.' },
      { name: 'Hand-Braided Cord', origin: 'Traditional technique', desc: 'Waxed cord, knotted slowly by hand.' },
      { name: 'Miao Silver Accents', origin: 'Southwest China', desc: 'Small hand-finished silver details.' },
    ],
    stylingTips: [
      'A phone charm is a daily accessory — choose a stone whose meaning matters to you.',
      'Pair a protective charm (obsidian) with a brighter phone case for contrast.',
      'They also work as bag charms, keychains, or camera straps.',
    ],
  },

  'tibetan-silver': {
    heroTitle: 'The Tibetan Silver Collection',
    heroSubtitle: 'Silver that holds memory, from the roof of the world.',
    tagline: 'From the high plateau',
    intro: [
      'Tibetan silverwork was shaped by altitude. At the roof of the world, where the air thins and the sky presses close, every object made by hand must justify the effort of its making — so what is made, is made to last, and to mean something.',
      'For over a thousand years, Tibetan silversmiths have chased the same patterns: the lotus, the endless knot, the wheel. Turquoise is set into nearly everything, because in this tradition, turquoise is not decoration — it is a piece of fallen sky.',
      'This collection brings that craft down from the plateau. Each piece carries the weight of where it came from.',
    ],
    symbols: [
      { name: 'Lotus 莲花', meaning: 'Purity rising from mud — staying clean in an unclean world.' },
      { name: 'Endless Knot 无尽结', meaning: 'The interdependence of all things; a blessing without beginning or end.' },
      { name: 'Turquoise 绿松石', meaning: 'A piece of the sky. Protective, sacred, given at birth.' },
    ],
    materials: [
      { name: 'Tibetan Silver', origin: 'Hand-chased', desc: 'Patterns struck by hand with chisel and hammer.' },
      { name: 'Natural Turquoise', origin: 'Graded by eye', desc: 'No two stones alike — variation is the mark of the real.' },
      { name: 'Cord & Silk', origin: 'Hand-knotted', desc: 'Traditional knotting for protection on the road.' },
    ],
    stylingTips: [
      'Tibetan silver pairs beautifully with earth tones — olive, ochre, cream.',
      'A single silver-and-turquoise piece can anchor a whole outfit.',
      'Layer silver bracelets with simpler cord pieces for texture.',
    ],
  },

  'mongolian-steppe': {
    heroTitle: 'The Mongolian Steppe Collection',
    heroSubtitle: 'Braided cord and stone, from the land of endless sky.',
    tagline: 'For the road ahead',
    intro: [
      'On the steppe, every braid a mother ties for her traveling child is a silent count of the days until return. The cord goes with the rider — across grass, across seasons, across a thousand miles of sky.',
      'This collection takes the Mongolian endless knot and the braided cord tradition, hand-worked in waxed cord with protective stones. The knots are deliberate, slow, and counted — because a blessing, in this tradition, is never rushed.',
      'For anyone who carries the spirit of the open road, even in a city far from any grassland.',
    ],
    symbols: [
      { name: 'Endless Knot 蒙古结', meaning: 'A living blessing — never tied shut, because it must stay alive to travel.' },
      { name: 'Red Cord 红绳', meaning: 'Tied by mothers for travelers — a silent count of days until return.' },
      { name: 'Obsidian 黑曜石', meaning: 'Protection for the journey — the dark stone that guards the road.' },
    ],
    materials: [
      { name: 'Waxed Cord', origin: 'Hand-braided', desc: 'Traditional Mongolian knotting, each crossing deliberate.' },
      { name: 'Natural Stones', origin: 'Hand-selected', desc: 'Obsidian, agate, and accent stones chosen for protection.' },
      { name: 'Brass Accents', origin: 'Hand-finished', desc: 'Warm metal details that patina with the journey.' },
    ],
    stylingTips: [
      'Mongolian cord pieces pair well with denim, leather, and earth tones.',
      'A braided bracelet or charm adds texture to a minimalist outfit.',
      'These pieces are made to be worn daily and develop character over time.',
    ],
  },

  'southwest-filigree': {
    heroTitle: 'The Southwest Filigree Collection',
    heroSubtitle: 'Silver finer than hair, from the hands of Miao masters.',
    tagline: 'Inheritance in silver',
    intro: [
      'For the Miao people of southwest China, silver is not adornment — it is inheritance. A bride wears her family history around her neck, hammered over years into patterns that tell a story only her people can read.',
      'This collection carries that tradition. A craftsman draws silver into wire finer than a human hair, then coils it by hand into forms that tremble when you move. This single technique takes thirty years to master.',
      'To wear it is to carry a craft that has survived by being passed, hand to hand, mother to daughter, for centuries.',
    ],
    symbols: [
      { name: 'Filigree 银丝', meaning: 'Silver drawn finer than hair — a technique that takes a lifetime to master.' },
      { name: 'Dragon & Flower', meaning: 'Traditional Miao motifs, each carrying a clan story.' },
      { name: 'Silver as Lineage', meaning: 'For the Miao, silver is family history worn on the body.' },
    ],
    materials: [
      { name: 'Miao Silver Filigree', origin: 'Southwest China', desc: 'Hand-drawn wire, coiled into forms that tremble with movement.' },
      { name: '925 Silver', origin: 'Hand-finished', desc: 'Solid silver, polished to catch light from every angle.' },
    ],
    stylingTips: [
      'Filigree pieces are conversation starters — wear them where they catch light.',
      'A single filigree earring pair can elevate even a simple outfit.',
      'Let the detail lead; keep the rest of your look understated.',
    ],
  },

  'han-jade': {
    heroTitle: 'The Han Jade Collection',
    heroSubtitle: 'The stone of wisdom, treasured above gold for three thousand years.',
    tagline: 'The art of restraint',
    intro: [
      'In the East, jade has been treasured above gold for thousands of years. It is the stone of wisdom — slow, deep, patient — worn by scholars and emperors alike.',
      'This collection pairs jade and jade-tone stones with the restrained aesthetic of the Han tradition: clean lines, meaningful forms, and a belief that the most valuable things do not need to shout.',
      'Together, they are a quiet argument for depth — that the truest beauty reveals itself slowly, over a lifetime.',
    ],
    symbols: [
      { name: 'Jade 玉', meaning: 'Wisdom, patience, and integrity — the stone treasured above gold.' },
      { name: 'Lotus 莲花', meaning: 'Purity and awakening — the oldest symbol of rising clear of the mud.' },
      { name: 'Restraint 留白', meaning: 'The art of what is left unsaid — the Han aesthetic of meaningful space.' },
    ],
    materials: [
      { name: 'Jade & Jade-Tone Stone', origin: 'Hand-selected', desc: 'Genuine jade and natural stones in the jade palette.' },
      { name: 'Silver Lotus Accent', origin: 'Hand-finished', desc: 'A small silver lotus, the symbol of purity.' },
      { name: 'Silk Cord', origin: 'Traditional', desc: 'Fine cord in the Chinese knotting tradition.' },
    ],
    stylingTips: [
      'Jade reads beautifully against black, white, and deep green.',
      'A jade pendant on a silk cord is timeless — it never goes out of style.',
      'Pair with linen or silk for a refined, scholarly look.',
    ],
  },

  'tai-silk': {
    heroTitle: 'The Thai Silk Collection',
    heroSubtitle: 'Woven light, the color of rivers at dusk.',
    tagline: 'Slow light, woven by hand',
    intro: [
      'In northern Thailand, silk is woven on wooden looms that have barely changed in centuries. The weavers are women, taught by their mothers, who were taught by theirs. The thread shimmers because of how it catches light, the way a river does at dusk.',
      'This collection takes that silk and the symbols of Thai craft — the lotus, the slow turn of the seasons — and weaves them into small things you can carry. The tones are chosen for a wish: green for growth, gold for fortune, magenta for love.',
      'In a world that moves too fast, these pieces are an argument for slowness. For making things by hand. For letting light take its time.',
    ],
    symbols: [
      { name: 'Thai Silk 泰丝', meaning: 'Light made tangible — a river of thread, woven slowly by hand.' },
      { name: 'Lotus 莲花', meaning: 'Shared across Buddhist Asia — purity, awakening, rising clear of the mud.' },
      { name: 'Gold Tone 金色', meaning: 'Fortune and illumination — the color of temple roofs at dawn.' },
    ],
    materials: [
      { name: 'Thai Silk', origin: 'Hand-loomed in the north', desc: 'Naturally iridescent — different colors in different light.' },
      { name: 'Brass Accents', origin: 'Hand-finished', desc: 'Warm gold tone that patinas gracefully over time.' },
    ],
    stylingTips: [
      'A silk phone charm adds a quiet pop of color to a neutral outfit.',
      'Magenta and gold tones pair beautifully with black and olive.',
      'Let one silk piece be the focal point — they shimmer enough to stand alone.',
    ],
  },

  'caravan-fusion': {
    heroTitle: 'The Caravan Fusion Collection',
    heroSubtitle: 'Where the craft of one place meets the craft of another.',
    tagline: 'Two traditions, one piece',
    intro: [
      'For most of human history, craft traditions met on the road. Traders carried silver from Tibet down to the markets of the lowlands; silk traveled up from Thailand; Miao silverwork moved along the rivers of the southwest. At the inns and crossroads, techniques were traded, borrowed, and quietly fused.',
      'The Caravan Fusion Collection is our tribute to those crossroads. Each piece deliberately brings together two or more traditions — Tibetan silver with Miao filigree, Mongolian braiding with Thai silk — and lets them speak in one voice.',
      'A fusion piece is harder to make than a single-tradition one, because it asks two crafts to agree. The result, when it works, is something neither could have been alone.',
    ],
    symbols: [
      { name: 'The Crossroads', meaning: 'Where crafts and cultures met, traded, and became something new.' },
      { name: 'Caravan 商队', meaning: 'The travelers who carried technique across thousands of miles.' },
      { name: 'River 河流', meaning: 'The natural bridge — things flow downstream, and meet.' },
    ],
    materials: [
      { name: 'Mixed Heritage', origin: 'Two or more traditions', desc: 'Each material chosen for the craft it represents.' },
      { name: 'Hand-Assembled', origin: 'Studio-finished', desc: 'Components from different artisans, joined by hand.' },
    ],
    stylingTips: [
      'Fusion pieces are conversation starters — wear them where they can be seen.',
      'They layer well with single-tradition pieces from either of their roots.',
      'Let the story lead: each fusion piece comes with a card explaining what meets.',
    ],
  },
};

export function getCollectionNarrative(slug: string): Narrative | null {
  return NARRATIVES[slug] ?? null;
}
