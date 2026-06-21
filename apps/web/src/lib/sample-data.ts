/**
 * 产品数据中心 (基于真实产品图片)
 *
 * ⚠️ 命名/材质/价格为占位,基于图片识别的推断,待用户确认后修正。
 * 产品以「天然水晶/宝石圆珠手链 + 民族风手机挂链」为主。
 * 图片在 /products/p01.jpg .. p21.jpg
 *
 * 故事按 STORY_DOCTRINE 四层结构 (docs/brand/STORY_DOCTRINE.md)
 * Phase 2: 替换为 Payload Local API 查询
 */

export type ProductCard = {
  slug: string;
  name: string;
  heritage: string;
  price: string;
  compareAt?: string | null;
  tag?: string | null;
  image?: string; // 主图路径
};

export type FullProduct = ProductCard & {
  shortDesc: string;
  seoDescription?: string;
  collectionSlug: string;
  collectionName: string;
  reviewCount: number;
  saveLabel: string;
  colors: string[];
  colorSwatches: string[];
  sizes: string[];
  images: string[]; // 多角度图
  storyTitle: string;
  craftStory: string[];
  storyLayers: string[];
  materials: string[];
  specs: string[];
  care: string[];
  reviews: { name: string; text: string }[];
};

// ─── 首页 Best Sellers (轻量) ──────────────────────────────────────────
export const BEST_SELLERS: ProductCard[] = [
  { slug: 'amethyst-peace-bracelet', name: 'Amethyst Peace Bracelet', heritage: 'Handmade', price: '$38', compareAt: '$52', tag: 'Bestseller', image: '/products/p01.jpg' },
  { slug: 'strawberry-quartz-bracelet', name: 'Strawberry Quartz Bracelet', heritage: 'Handmade', price: '$42', compareAt: null, tag: null, image: '/products/p02.jpg' },
  { slug: 'rose-quartz-bracelet', name: 'Rose Quartz Bracelet', heritage: 'Handmade', price: '$36', compareAt: '$48', tag: null, image: '/products/p03.jpg' },
  { slug: 'obsidian-guard-charm', name: 'Obsidian Guard Phone Charm', heritage: 'Handmade', price: '$28', compareAt: null, tag: 'New', image: '/products/p04.jpg' },
  { slug: 'mixed-crystal-bracelet', name: 'Mixed Crystal Bracelet', heritage: 'Handmade', price: '$45', compareAt: null, tag: null, image: '/products/p06.jpg' },
  { slug: 'lotus-jade-bracelet', name: 'Lotus Jade Bracelet', heritage: 'Handmade', price: '$48', compareAt: '$64', tag: null, image: '/products/p09.jpg' },
  { slug: 'cinnabar-cord-charm', name: 'Cinnabar Cord Phone Charm', heritage: 'Handmade', price: '$26', compareAt: null, tag: null, image: '/products/p15.jpg' },
  { slug: 'turquoise-sky-bracelet', name: 'Turquoise Sky Bracelet', heritage: 'Handmade', price: '$44', compareAt: '$58', tag: 'Limited', image: '/products/p19.jpg' },
];

// ─── 完整产品数据 (PDP 用) ──────────────────────────────────────────────
export const SAMPLE_PRODUCTS: FullProduct[] = [
  {
    slug: 'amethyst-peace-bracelet',
    name: 'Amethyst Peace Bracelet',
    heritage: 'Handmade',
    price: '$38',
    compareAt: '$52',
    saveLabel: '27%',
    tag: 'Bestseller',
    image: '/products/p01.jpg',
    shortDesc:
      'Natural amethyst beads hand-strung with Miao silver accents — the stone of calm, worn to quiet a busy mind.',
    collectionSlug: 'crystal',
    collectionName: 'Crystal Collection',
    reviewCount: 96,
    colors: ['Amethyst Purple'],
    colorSwatches: ['#8B6FA8', '#B08D57', '#3A2E2B'],
    sizes: ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)'],
    images: ['/products/p01.jpg', '/products/p07.jpg', '/products/p13.jpg'],
    storyTitle: 'The Stone That Quiets',
    craftStory: [
      'Amethyst has been worn for calm across cultures for thousands of years — from Tibetan prayer beads to the rings of ancient scholars. It is the stone you reach for when the world is too loud.',
      'Each bead here is natural amethyst, graded and matched by eye, then strung by hand with small Miao silver accents. No two beads share the exact shade — the variation is the mark of something real.',
      'You may not believe in the power of stones. But there is a kind of quiet that comes from wearing something chosen, made by hand, and carried from far away. That quiet is what this is for.',
    ],
    storyLayers: ['Origin: Natural amethyst', 'Craft: Hand-strung with Miao silver', 'Meaning: Calm and clarity', 'Resonance: For the busy mind'],
    materials: ['Natural amethyst beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    specs: ['Bead size: 8mm', 'Stretch fit', 'Unisex design', 'Weight: ~12g'],
    care: ['Avoid prolonged water contact', 'Clean with soft cloth', 'Silver accents may patina over time', 'Store away from direct sunlight'],
    reviews: [
      { name: 'Emma R.', text: 'The color is even richer in person. Feels substantial without being heavy — I wear it every day.' },
      { name: 'Liu W.', text: 'You can tell the stones are real, each bead slightly different. Love the silver accents.' },
    ],
  },
  {
    slug: 'strawberry-quartz-bracelet',
    name: 'Strawberry Quartz Bracelet',
    heritage: 'Handmade',
    price: '$42',
    compareAt: null,
    saveLabel: '',
    tag: null,
    image: '/products/p02.jpg',
    shortDesc:
      'Strawberry quartz beads with a warm, glowing red — the stone of love and gentle joy, hand-strung with silver.',
    collectionSlug: 'crystal',
    collectionName: 'Crystal Collection',
    reviewCount: 71,
    colors: ['Strawberry Red'],
    colorSwatches: ['#C4745A', '#8B3A3A', '#B08D57'],
    sizes: ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)'],
    images: ['/products/p02.jpg', '/products/p08.jpg', '/products/p14.jpg'],
    storyTitle: 'The Color of Joy',
    craftStory: [
      'Strawberry quartz catches the light like a summer berry — warm, translucent, alive. In crystal tradition, it is the stone of love: not the loud kind, but the steady, patient kind.',
      'These beads are hand-selected for their depth of color, then strung slowly by hand. The silver beads between them are Miao work, coiled and finished by artisans who have practiced for decades.',
      'Wear it as a small, daily reminder that joy does not have to shout. Sometimes it just glows, quietly, on your wrist.',
    ],
    storyLayers: ['Origin: Natural strawberry quartz', 'Craft: Hand-strung with Miao silver', 'Meaning: Love and joy', 'Resonance: A quiet daily glow'],
    materials: ['Natural strawberry quartz beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    specs: ['Bead size: 8mm', 'Stretch fit', 'Unisex', 'Weight: ~12g'],
    care: ['Avoid prolonged water contact', 'Clean with soft cloth', 'Keep away from harsh chemicals'],
    reviews: [
      { name: 'Sarah K.', text: 'The red is gorgeous — like a ripe strawberry catches light. Gets compliments constantly.' },
    ],
  },
  {
    slug: 'rose-quartz-bracelet',
    name: 'Rose Quartz Bracelet',
    heritage: 'Handmade',
    price: '$36',
    compareAt: '$48',
    saveLabel: '25%',
    tag: null,
    image: '/products/p03.jpg',
    shortDesc:
      'Rose quartz — the stone of unconditional love, in soft blush pink beads hand-strung with silver.',
    collectionSlug: 'crystal',
    collectionName: 'Crystal Collection',
    reviewCount: 58,
    colors: ['Blush Pink'],
    colorSwatches: ['#E8B4B8', '#B08D57'],
    sizes: ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)'],
    images: ['/products/p03.jpg', '/products/p10.jpg'],
    storyTitle: 'The Stone of Love',
    craftStory: [
      'Rose quartz is the oldest love charm known — worn in Egypt, Rome, and Tibet, always for the same thing: to soften the heart, toward others and toward oneself.',
      'These soft pink beads are natural rose quartz, matched for their gentle, cloudy translucence. Strung by hand with small silver accents, the piece feels as gentle as it looks.',
      'Some stones you wear for protection. This one you wear for tenderness — a small pink weight on the wrist, reminding you to be kind.',
    ],
    storyLayers: ['Origin: Natural rose quartz', 'Craft: Hand-strung', 'Meaning: Unconditional love', 'Resonance: For tenderness'],
    materials: ['Natural rose quartz beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    specs: ['Bead size: 8mm', 'Stretch fit', 'Unisex', 'Weight: ~11g'],
    care: ['Avoid prolonged water contact', 'Clean with soft cloth', 'Color may deepen gently with wear'],
    reviews: [
      { name: 'Mira T.', text: 'The pink is so soft and pretty. Feels calming just to look at.' },
    ],
  },
  {
    slug: 'obsidian-guard-charm',
    name: 'Obsidian Guard Phone Charm',
    heritage: 'Handmade',
    price: '$28',
    compareAt: null,
    saveLabel: '',
    tag: 'New',
    image: '/products/p04.jpg',
    shortDesc:
      'A phone charm of black obsidian and hand-braided cord — the protective stone, carried everywhere you go.',
    collectionSlug: 'charms',
    collectionName: 'Phone Charms',
    reviewCount: 43,
    colors: ['Black Obsidian', 'Blush Accent'],
    colorSwatches: ['#1A1A1A', '#E8B4B8', '#B08D57'],
    sizes: ['One size'],
    images: ['/products/p04.jpg', '/products/p11.jpg', '/products/p17.jpg'],
    storyTitle: 'The Stone That Guards',
    craftStory: [
      'Black obsidian has been used as a protective stone since the Stone Age — sharp enough to cut, dark enough to absorb. In many traditions it is worn to guard against the bad days.',
      'This charm pairs obsidian beads with a hand-braided cord in the traditional style, finished with a small blush accent bead. The braiding is done by hand, each knot deliberate.',
      'Your phone goes everywhere with you. Now something old and protective goes with it — a small, dark weight of calm in a noisy pocket.',
    ],
    storyLayers: ['Origin: Natural black obsidian', 'Craft: Hand-braided cord', 'Meaning: Protection', 'Resonance: A guard for every day'],
    materials: ['Natural black obsidian beads', 'Hand-braided waxed cord', 'Miao silver accent bead'],
    specs: ['Length: 18cm', 'Fits most phone cases', 'Lightweight', 'Weight: ~6g'],
    care: ['Cord is water-resistant', 'Obsidian is durable', 'Hand-braided — slight variation is natural'],
    reviews: [
      { name: 'Tom B.', text: 'Looks way better in person. The braided cord feels quality, not cheap.' },
    ],
  },
  {
    slug: 'mixed-crystal-bracelet',
    name: 'Mixed Crystal Bracelet',
    heritage: 'Handmade',
    price: '$45',
    compareAt: null,
    saveLabel: '',
    tag: null,
    image: '/products/p06.jpg',
    shortDesc:
      'A blend of natural crystals — amethyst, quartz, and accent stones — hand-combined for balance and beauty.',
    collectionSlug: 'crystal',
    collectionName: 'Crystal Collection',
    reviewCount: 39,
    colors: ['Mixed'],
    colorSwatches: ['#8B6FA8', '#E8B4B8', '#B08D57'],
    sizes: ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)'],
    images: ['/products/p06.jpg', '/products/p12.jpg'],
    storyTitle: 'When Stones Meet',
    craftStory: [
      'Some pieces are not about one stone, but about the conversation between many. This bracelet brings together amethyst, rose quartz, and accent crystals — each chosen for how it speaks to the others.',
      'The arrangement is not random. Each crystal is placed to balance color and meaning: calm next to love, depth next to light. Strung by hand with silver between.',
      'It is, in a small way, a philosophy you can wear — that different things, put together with care, can become more beautiful than any one alone.',
    ],
    storyLayers: ['Origin: Mixed natural crystals', 'Craft: Hand-composed arrangement', 'Meaning: Balance', 'Resonance: Harmony in difference'],
    materials: ['Natural amethyst, rose quartz, accent crystals', 'Miao silver beads', 'Elastic cord'],
    specs: ['Bead size: 8mm mixed', 'Stretch fit', 'Unisex', 'Weight: ~13g'],
    care: ['Avoid prolonged water contact', 'Clean with soft cloth', 'Each piece unique in stone arrangement'],
    reviews: [
      { name: 'Claire D.', text: 'Love that every bead is different. Feels like a one-of-a-kind piece.' },
    ],
  },
  {
    slug: 'lotus-jade-bracelet',
    name: 'Lotus Jade Bracelet',
    heritage: 'Handmade',
    price: '$48',
    compareAt: '$64',
    saveLabel: '25%',
    tag: null,
    image: '/products/p09.jpg',
    shortDesc:
      'Jade-green beads with a silver lotus accent — the stone of wisdom, paired with the symbol of purity.',
    collectionSlug: 'crystal',
    collectionName: 'Crystal Collection',
    reviewCount: 47,
    colors: ['Jade Green'],
    colorSwatches: ['#5B8C6E', '#B08D57', '#D4AF37'],
    sizes: ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)'],
    images: ['/products/p09.jpg', '/products/p16.jpg'],
    storyTitle: 'The Stone of Wisdom',
    craftStory: [
      'In the East, jade has been treasured above gold for thousands of years. It is the stone of wisdom — slow, deep, patient — worn by scholars and emperors alike.',
      'These jade-green beads are paired with a small silver lotus, hand-finished. The lotus is the oldest symbol of purity: something clean, risen from mud.',
      'Together, they are a quiet argument for depth — that the most valuable things are not the loudest, but the ones that take a lifetime to understand.',
    ],
    storyLayers: ['Origin: Jade-tone stone', 'Craft: Silver lotus accent', 'Meaning: Wisdom and purity', 'Resonance: For the patient heart'],
    materials: ['Jade-tone stone beads (8mm)', 'Miao silver lotus accent', 'Elastic cord'],
    specs: ['Bead size: 8mm', 'Stretch fit', 'Unisex', 'Weight: ~12g'],
    care: ['Avoid prolonged water contact', 'Clean with soft cloth', 'Silver lotus may patina beautifully over time'],
    reviews: [
      { name: 'Anna L.', text: 'The green is calming and the little lotus detail is so pretty.' },
      { name: 'Joon H.', text: 'Feels substantial and meaningful. My favorite piece.' },
    ],
  },
  {
    slug: 'cinnabar-cord-charm',
    name: 'Cinnabar Cord Phone Charm',
    heritage: 'Handmade',
    price: '$26',
    compareAt: null,
    saveLabel: '',
    tag: null,
    image: '/products/p15.jpg',
    shortDesc:
      'A phone charm of warm red beads and hand-braided cord — the color of blessing and good fortune.',
    collectionSlug: 'charms',
    collectionName: 'Phone Charms',
    reviewCount: 35,
    colors: ['Cinnabar Red'],
    colorSwatches: ['#C4745A', '#8B2E2E', '#B08D57'],
    sizes: ['One size'],
    images: ['/products/p15.jpg', '/products/p20.jpg'],
    storyTitle: 'The Color of Blessing',
    craftStory: [
      'Across Asia, red is not just a color — it is a ward. From Tibetan protection threads to Chinese wedding reds, it is the color chosen to carry blessing and good fortune.',
      'This charm takes that meaning into a small, daily object. Warm red beads are strung on a hand-braided cord, finished with silver. The braiding is done slowly, knot by knot.',
      'Your phone lights up a hundred times a day. Now, each time, a small red weight of good fortune lights up with it.',
    ],
    storyLayers: ['Origin: Cinnabar-red tradition', 'Craft: Hand-braided cord', 'Meaning: Blessing and fortune', 'Resonance: Good fortune, daily'],
    materials: ['Red stone beads', 'Hand-braided waxed cord', 'Miao silver accent bead'],
    specs: ['Length: 18cm', 'Fits most phone cases', 'Lightweight', 'Weight: ~5g'],
    care: ['Cord is water-resistant', 'Clean beads with soft cloth', 'Hand-braided — slight variation is natural'],
    reviews: [
      { name: 'Ploy S.', text: 'The red is warm and rich, not garish. Cord feels well-made.' },
    ],
  },
  {
    slug: 'turquoise-sky-bracelet',
    name: 'Turquoise Sky Bracelet',
    heritage: 'Handmade',
    price: '$44',
    compareAt: '$58',
    saveLabel: '24%',
    tag: 'Limited',
    image: '/products/p19.jpg',
    shortDesc:
      'Turquoise beads — the color of an open sky — hand-strung with silver, the protective stone of the high places.',
    collectionSlug: 'crystal',
    collectionName: 'Crystal Collection',
    reviewCount: 52,
    colors: ['Sky Turquoise'],
    colorSwatches: ['#5DADE2', '#B08D57'],
    sizes: ['Small (15cm)', 'Medium (17cm)', 'Large (19cm)'],
    images: ['/products/p19.jpg', '/products/p21.jpg'],
    storyTitle: 'A Piece of Open Sky',
    craftStory: [
      'In Tibet, turquoise is not a stone — it is a piece of the sky that fell and stayed. It is given at birth, worn through life, and considered protective and sacred.',
      'Each bead here is natural turquoise, graded by eye. No two beads are identical; the variation and the matrix lines are the mark of something real, not made in a factory.',
      'To wear it is to carry a small, still piece of open sky — even on the grayest of days.',
    ],
    storyLayers: ['Origin: Natural turquoise', 'Craft: Hand-graded beads', 'Meaning: The sky held still', 'Resonance: Open sky on gray days'],
    materials: ['Natural turquoise beads (8mm)', 'Miao silver accent beads', 'Elastic cord'],
    specs: ['Bead size: 8mm', 'Stretch fit', 'Unisex', 'Weight: ~12g'],
    care: ['Turquoise is porous — avoid water and chemicals', 'Color may deepen with skin oils', 'Store away from sunlight'],
    reviews: [
      { name: 'Claire D.', text: 'The variations in the turquoise make it feel genuinely handmade and real. Beautiful.' },
    ],
  },
];

// ─── 查询函数 ───────────────────────────────────────────────────────────
export function getProductBySlug(slug: string): FullProduct | undefined {
  return SAMPLE_PRODUCTS.find((p) => p.slug === slug);
}

export function getRelated(slug: string, count: number): ProductCard[] {
  const current = getProductBySlug(slug);
  return SAMPLE_PRODUCTS.filter((p) => p.slug !== slug)
    .filter((p) => !current || p.collectionSlug === current.collectionSlug || p.heritage === current.heritage)
    .slice(0, count)
    .map((p) => ({ slug: p.slug, name: p.name, heritage: p.heritage, price: p.price, compareAt: p.compareAt, tag: p.tag, image: p.image }));
}

// ─── 系列数据 ───────────────────────────────────────────────────────────
export type Symbol = { name: string; meaning: string };
export type Material = { name: string; origin: string; desc: string };

export type Collection = {
  slug: string;
  name: string;
  heritage: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  intro: string[];
  symbols: Symbol[];
  materials: Material[];
  stylingTips: string[];
};

export const COLLECTIONS: Collection[] = [
  {
    slug: 'crystal',
    name: 'Crystal Collection',
    heritage: 'Natural stones · Hand-strung',
    tagline: 'Stones with a story',
    heroTitle: 'The Crystal Collection',
    heroSubtitle: 'Natural stones, each carrying a meaning older than memory.',
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
      { name: 'Natural Crystal Beads', origin: 'Graded by eye', desc: 'Genuine stones — amethyst, quartz, turquoise, jade. No two beads alike.' },
      { name: 'Miao Silver Accents', origin: 'Southwest China', desc: 'Hand-finished silver beads from Miao silversmiths.' },
      { name: 'Elastic Cord', origin: 'Hand-strung', desc: 'Durable stretch cord, knotted by hand for a comfortable fit.' },
    ],
    stylingTips: [
      'Stack two or three crystal bracelets together — different stones for different moods.',
      'A single statement piece (like turquoise) reads beautifully against neutral tones.',
      'Crystal bracelets layer well with metal watches and bangles.',
    ],
  },
  {
    slug: 'charms',
    name: 'Phone Charms',
    heritage: 'Hand-braided · Protective',
    tagline: 'Meaning, carried everywhere',
    heroTitle: 'The Phone Charm Collection',
    heroSubtitle: 'Small charms of stone and cord, that follow you everywhere.',
    intro: [
      'Your phone goes everywhere with you. It made sense, then, to make something for it that carries meaning — not just decoration, but a small weight of intention.',
      'Each charm pairs natural protective stones (obsidian, turquoise, cinnabar red) with hand-braided cord in the traditional style. The braiding is done slowly, knot by knot, by hand.',
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
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function getProductsByCollection(collectionSlug: string): ProductCard[] {
  return SAMPLE_PRODUCTS.filter((p) => p.collectionSlug === collectionSlug).map((p) => ({
    slug: p.slug, name: p.name, heritage: p.heritage, price: p.price, compareAt: p.compareAt, tag: p.tag, image: p.image,
  }));
}

// ─── 品类 (Category) ────────────────────────────────────────────────────
export type Category = {
  slug: string;
  name: string;
  icon: string;
  desc: string;
  heroSubtitle: string;
};

export const CATEGORIES: Category[] = [
  { slug: 'phone-charms', name: 'Phone Charms', icon: '📱', desc: 'Stone & cord charms', heroSubtitle: 'Small charms that follow you everywhere.' },
  { slug: 'necklaces', name: 'Necklaces', icon: '📿', desc: 'Beaded & pendant', heroSubtitle: 'Worn close, where the heart listens.' },
  { slug: 'bracelets', name: 'Bracelets', icon: '⭕', desc: 'Stretch & cord', heroSubtitle: 'Worn on the wrist, carried on the road.' },
  { slug: 'earrings', name: 'Earrings', icon: '👂', desc: 'Studs & drops', heroSubtitle: 'The smallest pieces, the finest detail.' },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProductsByCategory(slug: string): ProductCard[] {
  const map: Record<string, RegExp> = {
    'phone-charms': /charm/i,
    necklaces: /necklace|choker/i,
    bracelets: /bracelet/i,
    earrings: /earring/i,
  };
  const re = map[slug];
  if (!re) return [];
  return SAMPLE_PRODUCTS.filter((p) => re.test(p.name)).map((p) => ({
    slug: p.slug, name: p.name, heritage: p.heritage, price: p.price, compareAt: p.compareAt, tag: p.tag, image: p.image,
  }));
}
