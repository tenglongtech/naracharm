import { JOURNAL_GUIDES } from './journal-guides';
import { ARCHIVED_WELLNESS_GUIDES, JOURNAL_MATERIAL_REVISIONS } from './journal-material-revisions';

/**
 * Blog/SEO 内容文章数据
 *
 * 每篇文章:
 * - 针对高搜索量关键词优化 (title/description/keywords)
 * - 含 Article JSON-LD (Google 富片段)
 * - 关联产品 (文章内链到产品页)
 * - 接 STORY_DOCTRINE 文化叙事
 */

export type ArticleImage = {
  src: string;
  alt: string;
  caption?: string;
  credit?: { url: string; label: string };
};

export type BlogArticle = {
  slug: string;
  title: string;           // SEO title (含关键词)
  description: string;     // meta description
  keywords: string[];      // SEO keywords
  category: 'Crystal Meanings' | 'Symbolism' | 'Styling' | 'Care Guide' | 'Gift Guide' | 'Materials' | 'Fit & Buying';
  author: 'Nara Charm';
  publishedAt: string;     // ISO date
  updatedAt: string;
  readingTime: string;     // "5 min read"
  heroImage?: string;
  relatedProducts: string[]; // product slugs
  relatedArticles?: string[]; // article slugs
  editorialLink?: string;
  publication?: 'archived';
  sources?: readonly { title: string; url: string }[];
  content: { heading: string; body: string[]; image?: ArticleImage & { width: number; height: number } }[];
};

const legacyArticles: BlogArticle[] = [
{
  "slug": "how-to-layer-necklaces-and-bracelets",
  "title": "How to Layer Jewelry: A Simple Guide to Color, Balance & Fit",
  "description": "Build an everyday jewelry combination with a focal piece, a shared color and comfortable spacing. Simple ideas for necklaces and bracelet stacks.",
  "keywords": [
    "how to layer jewelry"
  ],
  "category": "Styling",
  "author": "Nara Charm",
  "publishedAt": "2026-09-22",
  "updatedAt": "2026-09-22",
  "readingTime": "3 min read",
  "relatedProducts": [
    "tibetan-amulet-925-bracelet",
    "mongolian-road-knot-cord",
    "han-jade-lotus-pendant"
  ],
  "relatedArticles": [
      "choose-a-meaningful-jewelry-gift",
      "everyday-jewelry-care-storage",
      "how-to-layer-necklaces"
    ],
  "content": [
    {
      "heading": "Start with one piece you love",
      "body": [
        "Choose one necklace or bracelet as the focal point. It might be the most colorful piece you own, a pendant with personal meaning or the bracelet you reach for every morning. Put it on before adding anything else.",
        "Build around a detail already in that piece: a cord color, a bead shape or a metal tone. Repeating one detail makes different designs feel connected without turning them into a matching set."
      ]
    },
    {
      "heading": "Give each necklace some space",
      "body": [
        "Try a shorter, simpler necklace beside a longer pendant. Check the actual lengths in the product information; a photograph cannot tell you where a necklace will sit on your body. If dimensions are not listed, ask before ordering.",
        "Look at the combination with the neckline you plan to wear. Move, bend and turn your head. Chains that repeatedly catch each other may be better worn separately."
      ]
    },
    {
      "heading": "Keep a bracelet stack comfortable",
      "body": [
        "Start with two bracelets rather than filling your wrist. Pair a finer cord like our [Mongolian Road Knot Cord](/products/mongolian-road-knot-cord) with a more substantial design like the [Tibetan Amulet 925 Bracelet](/products/tibetan-amulet-925-bracelet), then check that neither presses into your skin when you type or bend your wrist.",
        "Leave extra room if stacking several pieces. A close-fitting bracelet may feel tighter beside other bracelets, and heavy metal edges can rub softer beads. Separate pieces that knock against each other."
      ]
    },
    {
      "heading": "Make the combination yours",
      "body": [
        "For a quiet look, repeat one color in different textures. For more contrast, set a colorful stone bracelet beside a plain cord. These are starting points, not rules: the combination should feel comfortable and suit the clothes you actually wear.",
        "Before putting jewelry away, separate the layers so chains and cords do not tangle. Explore our [handmade bracelet collection](/collections/bracelets) and [crystal necklaces](/collections/necklaces), and use our [size guide](/size-guide) to ensure a comfortable fit."
      ]
    }
  ]
},
{
  "slug": "choose-a-meaningful-jewelry-gift",
  "title": "How to Choose a Meaningful Jewelry Gift",
  "description": "Choose a jewelry gift around personal style, fit and a shared memory. A practical checklist for bracelets, necklaces, earrings and phone charms.",
  "keywords": [
    "how to choose a meaningful jewelry gift"
  ],
  "category": "Gift Guide",
  "author": "Nara Charm",
  "publishedAt": "2026-09-22",
  "updatedAt": "2026-09-22",
  "readingTime": "3 min read",
  "relatedProducts": [
    "tibetan-amulet-925-bracelet",
    "mongolian-road-knot-cord",
    "han-jade-lotus-pendant"
  ],
  "relatedArticles": [
      "how-to-layer-necklaces-and-bracelets",
      "everyday-jewelry-care-storage",
      "meaningful-gift-note-for-jewelry"
    ],
  "content": [
    {
      "heading": "Begin with what they already wear",
      "body": [
        "Notice the pieces the recipient wears often. Are they fine or bold, colorful or neutral? Do they prefer a bracelet to a necklace? These everyday choices are more useful than guessing from a trend.",
        "A shared memory can guide your choice: a color from a trip, a small detail that recalls home, or a shape they love. You do not need to assign a universal meaning to a stone to make a gift personal."
      ]
    },
    {
      "heading": "Check the details that photographs cannot show",
      "body": [
        "Confirm dimensions, materials and fastening style before buying. For earrings, check whether the recipient has pierced ears and which closures they find comfortable. For necklaces, compare the stated length with one they already like.",
        "Do not assume a piece is adjustable or suitable for sensitive skin. Read the specific material information and contact us if it leaves a question unanswered. Material preferences matter more than a broad label such as “silver-colored.”"
      ]
    },
    {
      "heading": "Plan for arrival and the possibility of a return",
      "body": [
        "Read the current shipping information for the destination and leave room for transit and customs. A delivery estimate is not a guarantee for a birthday or anniversary. Contact us before ordering if timing is essential.",
        "Read the return policy and its conditions, especially for a gift. Keep the order information so you can help the recipient if they need support."
      ]
    },
    {
      "heading": "Add your own words",
      "body": [
        "Write a short note about why you chose the piece. A sentence about a shared day or a quality you appreciate can carry more meaning than a long explanation of symbolism.",
        "Browse by the recipient’s preferred category, narrow the choice by their favorite color and check the practical details before checkout. Our gift guide and product pages are useful places to begin."
      ]
    }
  ]
},
{
  "slug": "everyday-jewelry-care-storage",
  "title": "Everyday Jewelry Care: Wearing, Cleaning & Storage",
  "description": "A gentle routine for mixed-material jewelry: read the care notes, avoid unnecessary moisture, separate pieces and store them without tangles.",
  "keywords": [
    "everyday jewelry care"
  ],
  "category": "Care Guide",
  "author": "Nara Charm",
  "publishedAt": "2026-09-22",
  "updatedAt": "2026-09-22",
  "readingTime": "3 min read",
  "relatedProducts": [
    "tibetan-amulet-925-bracelet",
    "mongolian-road-knot-cord",
    "han-jade-lotus-pendant"
  ],
  "relatedArticles": [
      "how-to-layer-necklaces-and-bracelets",
      "choose-a-meaningful-jewelry-gift",
      "cleanse-crystal-jewelry-daily-weekly"
    ],
  "content": [
    {
      "heading": "Read the care notes for your piece first",
      "body": [
        "Jewelry can combine metal, stone, cord and other materials. A cleaning method suitable for one part may damage another, so begin with the instructions on the individual product page.",
        "If the materials or care instructions are unclear, ask before using a cleaner. Do not assume every natural stone, plated finish or cord can be treated in the same way."
      ]
    },
    {
      "heading": "Keep the routine gentle",
      "body": [
        "Put jewelry on after applying cosmetics, perfume or lotion, once your skin is dry. Remove pieces before swimming, showering or activities where they may snag, be pulled or be exposed to cleaning products.",
        "After wearing, gently wipe the piece with a soft, dry cloth. Avoid soaking mixed-material jewelry or using abrasive products unless the specific care instructions recommend it."
      ]
    },
    {
      "heading": "Store pieces separately",
      "body": [
        "Fasten necklaces before storing them and give chains enough space to avoid knots. Keep earrings together and separate metal edges from softer surfaces that could scratch.",
        "Use a clean, dry pouch or divided compartment. Avoid leaving jewelry in a damp bathroom or in direct sunlight, and do not stretch elastic or cord around a storage stand."
      ]
    },
    {
      "heading": "Pause when something feels different",
      "body": [
        "Check clasps, cords and connections before wearing. If a cord is fraying or a setting feels loose, stop wearing the piece and ask about the next step instead of pulling or tightening it with tools.",
        "Keep the product name and order details available when contacting support. A description of the issue helps us understand the piece and provide appropriate guidance."
      ]
    }
  ]
},
  // ═══════════════════════════════════════════════════════════════
  // 文章 1: Amethyst Meaning (月搜 ~30K+)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 2: Rose Quartz Meaning (月搜 ~25K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'rose-quartz-meaning-love-stone',
    title: "Rose Quartz Meaning, Color & Jewelry",
    description: "Explore the pink tones of rose quartz and why it often appears in gifts about affection, friendship and care.",
    keywords: ["rose quartz meaning","rose quartz jewelry","pink quartz"],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-11-18',
    readingTime: '1 min read',
    relatedProducts: ['rose-quartz-bracelet', 'strawberry-quartz-bracelet'],
    relatedArticles: ['amethyst-meaning-healing-properties', 'turquoise-meaning-protection-stone', 'rose-quartz-vs-rhodonite-love-stone'],
    content: [
      {"heading":"Read the shade and translucence","body":["Compare the bead in two kinds of natural light. A soft translucent bead can look pale against cream and deeper against charcoal. Real examples vary in clouding and brightness, so ask for a product photo when exact color matters."]},
      {"heading":"Give the color a meaning","body":["Rose quartz is often chosen as a symbol of affection. It might remind you of a pink scarf a friend used to lend you, or mark a relationship that has grown more important over time. Use the stone or its color to tell your own story."]},
      {"heading":"Choose the shape you will wear","body":["A row of round pink beads shows variations across a wrist. A single pale stone on a dark cord keeps the color more concentrated. Try the shade beside something you already own. For the exact material and bead size of a specific bracelet, check its listing."]},
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 3: Turquoise Meaning (月搜 ~20K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'turquoise-meaning-protection-stone',
    title: "Turquoise Meaning, Color & Jewelry",
    description: "Explore why the color of turquoise recalls the sky, and check stone descriptions when choosing blue-green jewelry.",
    keywords: ["turquoise meaning","turquoise color","turquoise jewelry"],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-11-18',
    readingTime: '1 min read',
    relatedProducts: ['turquoise-sky-bracelet'],
    relatedArticles: ['amethyst-meaning-healing-properties', 'tibetan-jewelry-symbols-meaning', 'how-to-choose-turquoise-color-jewelry'],
    content: [
      {"heading":"Start with the blue-green you like","body":["Some pieces look clear sky blue. Others lean into a stronger green or show dark markings across the surface. Compare photographs on a neutral background if you want to match a piece with another color."]},
      {"heading":"Keep symbolism attached to the story","body":["People can give blue-green jewelry different meanings, including connection to an open landscape or remembrance of a journey. For a piece associated with a named tradition, read the maker’s explanation of that individual object before assigning it a meaning."]},
      {"heading":"Read the material line before buying","body":["Turquoise and turquoise-colored material can look similar in a photograph. Look for the specific material and any coloring or treatment details. A narrow blue-green accent works well beside dark cord or wool, while a wider oval can carry a plain white neckline by itself."]},
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 4: Tibetan Jewelry Symbols (月搜 ~15K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'tibetan-jewelry-symbols-meaning',
    title: 'Tibetan Jewelry Symbols & Meanings: A Guide to Sacred Adornment',
    description: 'Explore the meaning behind Tibetan jewelry symbols — the lotus, endless knot, turquoise, and Dzi beads. Learn what these sacred symbols mean and why they\'re worn.',
    keywords: ['tibetan jewelry meaning', 'tibetan bracelet meaning', 'tibetan symbols', 'endless knot meaning', 'lotus meaning jewelry', 'dzi bead meaning', 'tibetan silver'],
    category: 'Symbolism',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-11-19',
    readingTime: '7 min read',
    relatedProducts: ['tibetan-amulet-925-bracelet'],
    relatedArticles: ['turquoise-meaning-protection-stone', 'tibetan-prayer-beads-mala-meaning', 'endless-knot-meaning'],
    content: [
      {
        heading: 'Why Tibetan Jewelry Is Different',
        body: [
          'Tibetan jewelry is unlike jewelry from any other tradition. At the roof of the world — where the air is thin, the sky presses close, and the landscape is vast and unforgiving — every object made by hand must justify the effort of its making.',
          'This means Tibetan jewelry is never purely decorative. Each piece carries meaning, blessing, or protection. Symbols are not chosen for aesthetics alone — they are chosen for what they do, for the spiritual power they are believed to hold.',
          'If you wear Tibetan jewelry, you are carrying a tradition that has been shaped by altitude, faith, and centuries of devotion.',
        ],
      },
      {
        heading: 'The Most Common Tibetan Jewelry Symbols',
        body: [
          '**The Lotus (Padma)** — The lotus is one of the most important symbols in Tibetan Buddhism. It represents purity — specifically, the ability to rise above difficult circumstances (represented by mud) and bloom into something beautiful. A piece of jewelry with a lotus is a reminder that you can grow through hardship.',
          '**The Endless Knot (Shriovatsa)** — This intricate, interwoven knot symbolizes the interdependence of all things. It has no beginning and no end, representing the infinite nature of wisdom and compassion. It is one of the Eight Auspicious Symbols of Buddhism.',
          '**The Dharma Wheel (Dharmachakra)** — The wheel represents the teachings of the Buddha and the cycle of spiritual growth. Its eight spokes correspond to the Noble Eightfold Path.',
          '**The Conch Shell (Dungkar)** — The conch symbolizes the spreading of truth and the deep, far-reaching sound of the Dharma. It is often used as a trumpet in Tibetan ceremonies.',
          '**The Vajra (Dorje)** — The vajra, or "diamond thunderbolt," symbolizes the indestructible nature of wisdom and the power to cut through ignorance. It is a symbol of spiritual authority.',
        ],
      },
      {
        heading: 'Turquoise in Tibetan Jewelry',
        body: [
          'Turquoise is the most important stone in Tibetan jewelry — so important that it is almost inseparable from Tibetan identity. As we explore in our [turquoise meaning guide](/blog/turquoise-meaning-protection-stone), Tibetans consider turquoise a piece of the sky that fell to earth.',
          'In Tibetan jewelry, turquoise is:',
          '- Given to children at birth for protection and good fortune',
          '- Set into silver rings, bracelets, and pendants',
          '- Combined with coral (red) to represent the union of sky and earth',
          '- Worn throughout life and often buried with the deceased',
          'No piece of Tibetan jewelry feels complete without at least one turquoise stone.',
        ],
      },
      {
        heading: 'Dzi Beads: The Most Mysterious Tibetan Stone',
        body: [
          'Dzi beads are perhaps the most mysterious and coveted item in Tibetan jewelry. These agate beads, with distinctive eyes or line patterns, are believed to be of divine origin — some traditions say they were dropped by gods, others that they were insects turned to stone.',
          'Dzi beads are worn for protection, good fortune, and spiritual power. The number of "eyes" on a Dzi bead carries specific meanings:',
          '- **1-eye Dzi**: clarity, brilliance, and success',
          '- **3-eye Dzi**: wealth, health, and longevity',
          '- **9-eye Dzi**: the most coveted — ultimate protection and good fortune',
          'Authentic ancient Dzi beads can sell for tens of thousands of dollars. Modern Dzi-style beads are more affordable but still carry the symbolic meaning.',
        ],
      },
      {
        heading: 'Tibetan Silver vs. Sterling Silver',
        body: [
          'When shopping for Tibetan jewelry, you\'ll often see "Tibetan silver" — but this is different from sterling silver:',
          '**Sterling silver (925)** is 92.5% pure silver, a globally recognized standard.',
          '**Tibetan silver** is a traditional alloy that historically contained silver, but modern "Tibetan silver" is often a mix of copper, nickel, and other metals with a silver-like appearance.',
          'Check the metal listed for each component, including the pendant, spacers and fastenings. See the materials and size listed on our [Tibetan-Inspired Silver Amulet Bracelet](/products/tibetan-amulet-925-bracelet).',
        ],
      },
      {
        heading: 'How to Choose Tibetan Jewelry',
        body: [
          'When choosing Tibetan jewelry for its spiritual meaning:',
          '**Look for symbols that resonate.** Choose a lotus for growth, an endless knot for connection, turquoise for protection. Let the meaning guide you.',
          '**Check the materials.** Ask which component contains the stated stone or metal. The appearance of a matrix or a silver-colored finish is a starting point for questions about the listing.',
          '**Respect the tradition.** Tibetan symbols are sacred. Wear them with awareness of their meaning, not just as fashion.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 6: Obsidian Meaning (月搜 ~18K)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'obsidian-meaning-protection-stone',
    title: "Obsidian Meaning and Black Jewelry",
    description: "Explore obsidian as a dark, glassy detail in beads and charms, and see how to wear its distinctive surface.",
    keywords: ["obsidian meaning","black obsidian jewelry","obsidian phone charm"],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-11-18',
    readingTime: '1 min read',
    relatedProducts: ['obsidian-guard-charm', 'obsidian-guardian-charm'],
    relatedArticles: ['turquoise-meaning-protection-stone', 'tibetan-jewelry-symbols-meaning', 'black-onyx-meaning-strength-protection'],
    content: [
      {"heading":"Notice the surface","body":["Polished obsidian can show a bright highlight against a deep background. A row of dark rounds therefore reads differently from a flat black textile strip. In a piece of mixed materials, the reflected edge helps tell one component from another."]},
      {"heading":"Use the dark detail as a personal symbol","body":["A small black bead can feel like a reminder of a place, a person or a time you made a change. Some wearers use dark stones as symbols of protection. Choose the meaning you want to carry with the piece."]},
      {"heading":"Choose a place where it will wear well","body":["A smooth round bead at the end of a phone charm shows clearly against a cream case. Check that the charm has a compatible anchor point and that the beads will stay away from the camera and charging port. Store the piece where it will have some space around it."]},
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 18: Clear Quartz (月搜 ~12K)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 19: Evil Eye Meaning (月搜 ~22K)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'evil-eye-meaning-protection-symbol',
    title: "The Evil Eye Motif in Jewelry",
    description: "Read the eye as a symbolic jewelry motif and look for the context behind a particular design.",
    keywords: ["evil eye motif","eye symbol in jewelry","evil eye jewelry"],
    category: 'Symbolism',
    author: 'Nara Charm',
    publishedAt: '2026-07-01',
    updatedAt: '2026-11-18',
    readingTime: '1 min read',
    relatedProducts: ['obsidian-guard-charm', 'turquoise-sky-bracelet'],
    relatedArticles: ['obsidian-meaning-protection-stone', 'tibetan-jewelry-symbols-meaning', 'hamsa-hand-meaning-protection-symbol'],
    content: [
      {"heading":"Read the outline first","body":["Many contemporary eye-shaped charms use concentric outlines or a dark center. Seen from a distance, the outer curve can carry most of the design. A single circle and dot will read more quietly than a wide set of colored rings."]},
      {"heading":"Ask what the specific design references","body":["Eye-shaped charms can carry protective symbolism for the people who make, give and wear them. A seller who connects a piece to a particular tradition should be able to explain which motif they referenced and where their design takes a different direction."]},
      {"heading":"Consider context when gifting","body":["Start from a motif the recipient already wears or recognizes. A short note can say what the gift means between you. Check pendant length or bracelet fit the same way you would for another piece."]},
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 20: Bracelet Size Guide (月搜 ~15K)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'bracelet-size-guide-how-to-measure',
    title: 'Bracelet Size Guide: How to Measure Your Wrist',
    description: 'Measure your wrist, read a bracelet size chart and check the closure before choosing a stretch, adjustable cord, clasp or bangle style.',
    keywords: ['bracelet size guide', 'how to measure wrist for bracelet', 'what size bracelet do i need', 'bracelet size chart', 'beaded bracelet size', 'stretch bracelet fit', 'wrist measurement guide'],
    category: 'Fit & Buying',
    author: 'Nara Charm',
    publishedAt: '2026-07-01',
    updatedAt: '2026-11-19',
    readingTime: '4 min read',
    relatedProducts: ['amethyst-peace-bracelet', 'rose-quartz-bracelet', 'turquoise-sky-bracelet'],
    relatedArticles: ['how-to-read-a-bracelet-closure', 'how-to-style-beaded-bracelets', 'beaded-jewelry-care-guide'],
    editorialLink: '/size-guide',
    content: [
      { heading: 'Measure Where the Bracelet Will Sit', body: [
        'Use a flexible tape measure or a strip of paper and a ruler. Wrap it around the spot on your wrist where you want the bracelet to sit. Keep it flat against the skin without pulling tight. Mark the point where the paper overlaps, then measure that length on a ruler.',
        'Write down your wrist circumference in centimeters or inches. Measure the wrist you plan to wear the bracelet on. If you intend to switch wrists, check both.',
      ] },
      { heading: 'Check What the Size Chart Measures', body: [
        'Start with the product’s own fit range. If your wrist measures 16 cm and a listing says “fits wrists 15.5 to 17 cm,” your measurement is within that range. If the listing gives only the bracelet’s length laid flat, ask for its closed fit range before choosing.',
        'Larger beads can take up more room inside the bracelet. Two strands with the same stated length can feel different, so compare how each listing measures its piece.',
      ] },
      { heading: 'Check the Closure Before You Order', body: [
        '**Stretch bracelet.** Check that it can pass over your hand comfortably and sit where you want it on the wrist.',
        '**Adjustable cord.** Compare the smallest and largest closed sizes with your wrist measurement. Check whether the bracelet opens or needs to slide over your hand.',
        '**Clasp bracelet.** Compare the closed length or stated fit range. Check how much extra room the extender adds, if there is one.',
        '**Rigid bangle.** Measure the widest part of your hand with your thumb tucked in, or measure the inside diameter of a bangle that already fits. Follow the size chart’s measurement method.',
      ] },
      { heading: 'Allow Room for the Way You Wear It', body: [
        'For a closer fit, a bracelet should still let you move your wrist comfortably. If you plan to wear it beside a watch, measure where each piece will sit so the clasp and beads have room.',
        '[See the jewelry size guide](/size-guide) or [browse bracelets](/collections/bracelets).',
      ] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 21: How to Layer Necklaces (月搜 ~10K)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'how-to-layer-necklaces',
    title: 'How to Layer Necklaces: The Complete Guide to Necklace Stacking',
    description: 'Learn how to layer necklaces like a stylist — which lengths to combine, how to mix pendants and chains, and the rules for creating a perfect layered necklace look.',
    keywords: ['how to layer necklaces', 'layered necklaces', 'necklace stacking', 'how to wear multiple necklaces', 'layering necklace guide', 'necklace lengths guide', 'stacking pendant necklaces'],
    category: 'Styling',
    author: 'Nara Charm',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    readingTime: '5 min read',
    relatedProducts: ['han-jade-lotus-pendant', 'caravan-fusion-necklace'],
    relatedArticles: ['necklace-length-paper-test', 'how-to-compare-pendant-widths', 'prevent-necklace-tangles'],
    content: [
      { heading: 'Why Layer Necklaces?', body: ['Layering necklaces is the jewelry equivalent of mixing patterns in fashion — it adds depth, personality, and visual interest that a single necklace cannot achieve alone. Done well, it looks effortless. Done poorly, it looks tangled.', 'Here\'s how to do it well.'] },
      { heading: 'Rule 1: Use Different Lengths', body: ['The most important rule of necklace layering is to use necklaces of **different lengths** so they don\'t bunch together. A classic three-layer combination:', '**16 inch (40cm)** — Sits at the collarbone. Best for a small pendant or choker-style piece.', '**18 inch (45cm)** — Sits just below the collarbone. The most common length; good for a medium pendant.', '**20 inch (50cm)** — Sits lower on the chest. Best for a larger pendant or statement piece.', 'This creates three visible tiers, each with its own focal point.'] },
      { heading: 'Rule 2: Mix Pendant Sizes', body: ['If all three necklaces have large pendants, the look becomes heavy. Instead, vary the sizes:', '**Shortest necklace:** Small pendant or no pendant (just a chain).', '**Middle necklace:** Medium pendant (a lotus, a small stone, a charm).', '**Longest necklace:** Largest pendant (a jade piece, a statement stone).', 'This creates a visual cascade from small to large.'] },
      { heading: 'Rule 3: Stick to a Color Story', body: ['For a cohesive look, keep your metals and stones in the same color family:', '**Silver + cool stones:** Silver chain + amethyst pendant + turquoise pendant.', '**Gold + warm stones:** Gold chain + citrine pendant + carnelian pendant.', '**Mixed metals (advanced):** Silver + gold + rose gold, kept delicate. Works best with thin chains and tiny pendants.'] },
      { heading: 'Rule 4: Odd Numbers Work Best', body: ['In visual design, odd numbers are more pleasing than even. **Three necklaces** is the sweet spot for layering — enough for visual impact, not so many that they tangle.', 'If you want to go bolder, try five — but keep each necklace thin and lightweight.'] },
      { heading: 'Preventing Tangles', body: ['The biggest frustration with layered necklaces is tangling. Here\'s how to prevent it:', '**Use a necklace spacer/clasp** — a small clip that holds the chains apart at the back of your neck.', '**Choose different chain styles** — a cable chain, a rope chain, and a bead chain tangle less than three identical chains.', '**Keep the shortest necklace snug** — a choker-length necklace won\'t slide into the longer ones.', '[Shop necklaces for layering →](/collections/necklaces)'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 22: Citrine Meaning (月搜 ~6K)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'citrine-meaning-merchants-stone',
    title: "Citrine Meaning and Golden Jewelry",
    description: "Explore how people use golden citrine as a symbol of a beginning, a milestone or a favorite color.",
    keywords: ["citrine meaning","golden quartz jewelry","citrine bracelet"],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-07-01',
    updatedAt: '2026-11-18',
    readingTime: '1 min read',
    relatedProducts: ['mixed-crystal-bracelet'],
    relatedArticles: ['carnelian-meaning-stone-of-motivation', 'healing-crystals-101-beginners-guide', 'crystal-birthstones-by-month-guide'],
    content: [
      {"heading":"Compare the golden tones","body":["Look at the piece against paper in ordinary window light. Pale yellow is a quiet companion to white or light gray. An amber-colored bead can appear darker and richer next to a lighter textile cord."]},
      {"heading":"Choose the connection yourself","body":["Citrine’s golden color is often associated with celebration. A bracelet could mark a first job, the end of a long project or a summer trip. The reason you choose the color is part of the gift."]},
      {"heading":"Check the material and treatment details","body":["A warm yellow image alone cannot tell you whether a bead is citrine or how it was treated. Read the listing and ask which description applies to the exact piece. For a gift, save that material information with your note."]},
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 23: Mother's Day Crystal Gift (月搜 ~8K seasonal)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'best-jewelry-gifts-for-mom',
    title: 'Jewelry Gifts for Mom That Fit Her Everyday Style',
    description: 'Choose a jewelry gift for Mom by the colors she wears, the fastenings she likes and the fit of a piece she already owns.',
    keywords: ['jewelry gifts for mom', 'Mother’s Day jewelry', 'bracelet gift for mom', 'pendant gift for mom'],
    category: 'Gift Guide',
    author: 'Nara Charm',
    publishedAt: '2026-07-01',
    updatedAt: '2026-11-19',
    readingTime: '3 min read',
    editorialLink: '/gift-guide',
    relatedProducts: ['rose-quartz-bracelet', 'han-jade-lotus-pendant', 'amethyst-calm-bracelet'],
    relatedArticles: ['best-crystal-gift-guide', 'rose-quartz-meaning-love-stone', 'meaningful-gift-note-for-jewelry'],
    content: [
      { heading: 'Start with the piece she reaches for', body: [
        'Think of the piece she wore the last time you saw her on an ordinary day. A narrow bracelet she puts on beside her watch tells you more about her taste than a dramatic piece she only wore to a wedding. Notice whether she keeps to one metal tone and whether her jewelry usually sits close to the skin.',
        'If she rarely wears bracelets, look at her pendants or earrings instead. Pick one detail she already likes and change one thing, such as the color of the stone or the shape of the drop.',
      ] },
      { heading: 'Choose one color she can wear easily', body: [
        'For someone who wears cream, gray or faded denim, a [rose quartz bracelet](/products/rose-quartz-bracelet) brings in soft pink without needing an outfit built around it. If she wears charcoal or warm brown, the deeper violet of the [Amethyst Calm Bracelet](/products/amethyst-calm-bracelet) has more contrast. Check the materials and ask about the specific piece if color matters.',
        'A [jade-tone lotus pendant](/products/han-jade-lotus-pendant) is another option if she usually wears necklaces. Hold a paper shape about the pendant’s size against a neckline she wears to see how prominent it will look.',
      ] },
      { heading: 'Check fit and fastening before you order', body: [
        'If you can borrow an everyday necklace, measure it laid flat from end to end, including the clasp. For a bracelet, check the listed wrist range. Larger beads take up more room inside the loop, so its outside length can give the wrong impression of fit.',
        'Our [wrist measuring guide](/blog/bracelet-size-guide-how-to-measure) shows a simple paper-strip method. If it is a surprise and you cannot check her wrist size, choose a piece with a confirmed adjustment range or ask about an exchange before ordering.',
      ] },
      { heading: 'Write a note about why you chose it', body: [
        'Mention one thing she will recognize. “The purple reminded me of the scarf you always wore on our Sunday walks” tells her why this particular piece made you think of her. If the gift has to travel, confirm packaging and delivery timing before counting on a date.',
      ] },
    ],
  },

// ═══════════════════════════════════════════════════════════════
// 文章 27: History of Gemstone Jewelry (新鲜内容 · 2026-07-07)
// ═══════════════════════════════════════════════════════════════
{
  slug: 'history-of-gemstone-jewelry',
  title: 'Gemstone Jewelry History Through Three Museum Objects',
  description: 'Look closely at an Egyptian beaded collar, a Roman carnelian ring and a Qing nephrite pendant using photographs and object records from The Met.',
  keywords: ['history of gemstone jewelry', 'Egyptian broad collar', 'Roman carnelian intaglio', 'Qing nephrite pendant'],
  category: 'Symbolism',
  author: 'Nara Charm',
  publishedAt: '2026-07-07',
  updatedAt: '2026-11-19',
  readingTime: '4 min read',
  editorialLink: '/stories',
  relatedProducts: ['caravan-fusion-necklace', 'han-jade-lotus-pendant'],
  relatedArticles: ['tibetan-jewelry-symbols-meaning', 'healing-crystals-101-beginners-guide', 'evil-eye-meaning-protection-symbol'],
  sources: [
    { title: 'Broad collar of Senebtisi, The Metropolitan Museum of Art', url: 'https://www.metmuseum.org/art/collection/search/544168' },
    { title: 'Carnelian intaglio portrait ring of Tiberius, The Metropolitan Museum of Art', url: 'https://www.metmuseum.org/art/collection/search/256197' },
    { title: 'Qing nephrite pendant, The Metropolitan Museum of Art', url: 'https://www.metmuseum.org/art/collection/search/43932' },
  ],
  content: [
    { heading: 'Color in rows on an Egyptian broad collar', body: [
      'Start with the broad collar associated with the burial of Senebtisi, dated by The Met to around 1850–1775 BCE. Follow the repeated bead rows from the center out to the two falcon-head ends. Red, blue-green and gold-colored bands travel together around the curve. The individual pieces are small, but viewed together they create a broad surface of color.',
      'The museum lists faience, gold, carnelian and turquoise, and records restoration of the falcon heads and leaf pendants. That distinction matters when looking at the image today. The blue-green areas show why color alone is a poor way to identify a material. This piece includes both turquoise and faience.',
    ] },
    { heading: 'A portrait cut into a Roman carnelian ring', body: [
      'A Roman ring from around 14–37 CE gives one small stone a different job. The Met identifies the reddish stone as carnelian and the portrait as Tiberius. An intaglio is cut into the surface. Look at the contour of the face and the short lines that give the hair shape. The gold rim frames the portrait without repeating those lines.',
      'The museum lists the ring at 2.1 cm overall. The enlarged photograph makes the carving easy to read. The measurement helps you imagine the scale on a hand. A date and a sitter are documented here. Who wore the ring is a separate question.',
    ], image: {
      src: '/editorial/tiberius-intaglio-ring.webp',
      alt: 'Gold ring framing an incised profile on an oval red-brown carnelian',
      width: 1229, height: 1536,
      caption: 'Roman gold and carnelian ring with an intaglio portrait of Tiberius, ca. 14–37 CE.',
      credit: { url: 'https://www.metmuseum.org/art/collection/search/256197', label: 'The Met, 1994.230.7 · Public Domain' },
    } },
    { heading: 'Open space in a Qing nephrite pendant', body: [
      'On an eighteenth- to nineteenth-century Chinese pendant, The Met identifies the material as nephrite. Look around the circular center and the pale carving that holds it in place. Openings between the carved areas let the darker background show through. In this photograph, those gaps do as much to make the pattern legible as the pale stone itself.',
      'Compare the shape to the Roman ring. The ring uses a rim to separate a small portrait from the rest of the object. On the pendant, the edge and the open pattern are part of the same design. Looking at the openings is a useful way to compare carvings before focusing on their color.',
    ], image: {
      src: '/editorial/qing-nephrite-pendant.webp',
      alt: 'Pale carved nephrite pendant with openwork around a circular motif, suspended on a dark blue cord',
      width: 798, height: 1536,
      caption: 'Carved nephrite pendant, China, Qing dynasty, eighteenth to nineteenth century.',
      credit: { url: 'https://www.metmuseum.org/art/collection/search/43932', label: 'The Met, 02.18.574 · Public Domain' },
    } },
    { heading: 'Use those same details when looking at jewelry today', body: [
      'Pick a visible detail to study, such as repeated color in a row, a small center framed by metal or space left around a carved shape. Then read the material description and dimensions. A [jade-tone lotus pendant](/products/han-jade-lotus-pendant) can be compared by silhouette and scale. Check the listing for its material, since color alone cannot identify it. A [mixed-material pendant](/products/caravan-fusion-necklace) gives you a different comparison, where a woven cord and a metal border contribute to the overall shape.',
    ] },
  ],
},

// ═══════════════════════════════════════════════════════════════
// 文章 33: Gemstone Color Meanings (月搜 ~15K)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 文章 34: Crystal Cleansing Guide (月搜 ~10K)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 文章 35: Anniversary & Wedding Crystal Gift Guide (月搜 ~8K)
// ═══════════════════════════════════════════════════════════════
{
  slug: 'anniversary-wedding-crystal-gift-guide',
  title: 'Jewelry Gifts for Couples on Anniversaries and Weddings',
  description: 'Choose a single jewelry gift or build a pair around one shared detail. Check both fits and plan delivery before an anniversary or wedding.',
  keywords: ['anniversary jewelry gift', 'wedding jewelry gifts for couples', 'coordinating jewelry gifts', 'anniversary gemstone jewelry'],
  category: 'Gift Guide',
  author: 'Nara Charm',
  publishedAt: '2026-07-10',
  updatedAt: '2026-11-19',
  readingTime: '3 min read',
  editorialLink: '/gift-guide',
  relatedProducts: ['amethyst-calm-bracelet', 'caravan-fusion-necklace', 'mongolian-road-knot-cord'],
  relatedArticles: ['best-crystal-gift-guide', 'rose-quartz-meaning-love-stone', 'gift-coordinating-jewelry-without-matching'],
  content: [
    { heading: 'Decide whether to give one piece or two', body: [
      'For a wedding gift from a guest, start with what you know about both people’s taste. If only one wears jewelry regularly, a single piece tied to a shared memory can feel more personal than two pieces bought simply to make a pair.',
      'For an anniversary, choose an object that points to a specific day or place. A red-brown cord might recall a favorite trail. A quiet stone color might pick up a detail from a photograph you both keep.',
    ] },
    { heading: 'Repeat one detail across two different pieces', body: [
      'Start with one connection you can see at a glance: cool silver tones, a purple accent or a woven cord. The illustration shows how purple and a silver-colored fitting can link a round-bead bracelet to an oval pendant, giving each person a separate silhouette.',
      'For a textile-led pairing, compare the [Mongolian Road Knot Cord](/products/mongolian-road-knot-cord) with the woven cord on the [Caravan Fusion Necklace](/products/caravan-fusion-necklace). Look at the color of the material against the clothes each person wears and select sizes separately.',
    ] },
    { heading: 'Check each fit on its own', body: [
      'Measure a favorite necklace to find where a pendant normally sits. For a bracelet, check wrist circumference and how the fastening works. A sliding knot and an elastic loop feel different, especially if the wearer takes jewelry off often for work.',
      'Compare listings for exact materials, including findings that touch the skin. If you are considering the [Amethyst Calm Bracelet](/products/amethyst-calm-bracelet) for its violet beads, confirm the wrist range and current color before choosing it for a specific person.',
    ] },
    { heading: 'Plan around the date', body: [
      'Write the date, place or shared detail on a short note. If you are sending two pieces, label which is for whom. Check [delivery estimates](/shipping) for the destination and confirm availability before planning to open them together.',
    ] },
  ],
},

  // ═══════════════════════════════════════════════════════════════
  // 文章 50: How to Read Crystal Properties (新鲜内容 · 2026-07-21)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 51: How to Clean Your Crystal Jewelry (2026-07-22)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 52: Aquamarine Meaning (2026-07-22)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 53: Crystal Jewelry with Evening Wear (2026-07-22)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'crystal-jewelry-evening-wear-guide',
    title: 'How to Style Gemstone Jewelry for an Evening Outfit',
    description: 'Match a pendant, earrings or bracelet to your evening outfit. Test the neckline, color and fit under the light you will actually be in.',
    keywords: ['gemstone jewelry for evening wear', 'jewelry for a V-neck', 'evening jewelry styling', 'jewelry for an evening event'],
    category: 'Styling',
    author: 'Nara Charm',
    publishedAt: '2026-07-22',
    updatedAt: '2026-11-19',
    readingTime: '3 min read',
    editorialLink: '/collections/necklaces',
    relatedProducts: ['caravan-fusion-necklace', 'miao-filigree-drop-earrings', 'amethyst-peace-bracelet'],
    relatedArticles: ['how-to-style-beaded-bracelets', 'gemstone-color-meanings', 'choosing-jewelry-for-a-group-photo'],
    content: [
      { heading: 'Try one focal piece under a warm lamp', body: [
        'Put on the clothes you plan to wear and step back from the mirror. A deep purple bead can be hard to see beside a navy cuff under warm indoor light. Try a lighter sleeve or a shape with a clearer edge. If the look already works at arm’s length, a second large piece can make it harder to see where to look.',
        'A pale cloth shows more of the outline and color of pieces such as the [Amethyst Peace Bracelet](/products/amethyst-peace-bracelet). If you want a subtle effect, try the same bracelet beside a dark sleeve and look for the small silver-colored accents.',
      ] },
      { heading: 'Let the neckline decide where the pendant sits', body: [
        'For a V-neck, try a pendant inside the opening with room between the setting and the point of the fabric. Bend forward and turn to see whether the pendant drops under the edge. The [necklace length paper test](/blog/necklace-length-paper-test) lets you check the position with string and a paper cutout before you choose a piece.',
        'On a high collar, try either a necklace long enough to sit clearly below the seam or move the focus above the collar with earrings. A piece like the [Caravan Fusion Necklace](/products/caravan-fusion-necklace) has both a pendant and a visible woven cord. Check where each will meet the neckline.',
      ] },
      { heading: 'Check earrings against your collar and hair', body: [
        'Wear your hair as you will at the event and turn your head to both sides. Compare the [Miao Filigree Drop Earrings](/products/miao-filigree-drop-earrings) with a shorter pair if an open shape brushes the collar. Openwork can read clearly against one solid color, especially when hair is tucked behind the ear.',
      ] },
      { heading: 'Do a movement check before leaving', body: [
        'Put on your coat, sit down and rest your wrists on a table. If a hook catches on the lining or a pendant keeps tapping against a button, change the length or choose a lower-profile piece. For an event with a photographer, take one test photo from a few steps away and check the jewelry at the size you will actually see it.',
      ] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 59: Understanding Chakra Jewelry (2026-07-25)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 60: Summer Solstice Crystal Guide (2026-07-26)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 61: How to Tell if Crystals Are Real (2026-07-26)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 62: Amethyst & Sleep (2026-07-27)
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // 文章 63: Crystal Gift Guide for Every Occasion (2026-07-28)
  // ═══════════════════════════════════════════════════════════════
];

export const BLOG_ARTICLES: BlogArticle[] = [
  ...JOURNAL_MATERIAL_REVISIONS, ...JOURNAL_GUIDES, ...legacyArticles, ...ARCHIVED_WELLNESS_GUIDES,
];

export function isPublishedGuide(article: BlogArticle): boolean {
  return article.publication !== 'archived';
}

const articlesBySlug = new Map(BLOG_ARTICLES.map((article) => [article.slug, article]));

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return articlesBySlug.get(slug);
}

export function getArticlesByCategory(category: string): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.category === category && isPublishedGuide(a));
}

export function getRelatedArticles(slug: string, limit = 3): BlogArticle[] {
  const current = getArticleBySlug(slug);
  if (!current) return getRecentBlogArticles(limit);
  const explicit = (current.relatedArticles ?? [])
    .map(getArticleBySlug)
    .filter((article): article is BlogArticle => Boolean(article && isPublishedGuide(article)));
  const candidates = [...explicit, ...getArticlesByCategory(current.category)];
  return [...new Map(candidates.filter((article) => article.slug !== slug).map((article) => [article.slug, article])).values()].slice(0, limit);
}

// ─── 日期辅助函数 ────────────────────────────────────────────────────────

/** 多少天以内的文章算 "New" (新鲜度标记) */
const DAYS_TO_CONSIDER_NEW = 30;

/** 判断文章是否在新鲜度时间窗口内 */
export function isNewArticle(article: BlogArticle): boolean {
  const daysSince = (Date.now() - new Date(article.publishedAt).getTime()) / 86_400_000;
  return daysSince >= 0 && daysSince <= DAYS_TO_CONSIDER_NEW;
}

/** 取最新 N 篇已发表的文章 (按 publishedAt 降序) */
export function getRecentBlogArticles(count = 3): BlogArticle[] {
  return BLOG_ARTICLES.filter(isPublishedGuide)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, count);
}

/** 格式化日期为 "Jul 8, 2026" 风格 */
export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** 格式化日期为 "Jul 8" 风格(短格式) */
export function formatBlogDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** 检查文章是否在近期被更新过 (14天内) */
export function isRecentlyUpdated(article: BlogArticle): boolean {
  if (article.publishedAt === article.updatedAt) return false;
  const daysSince = (Date.now() - new Date(article.updatedAt).getTime()) / 86_400_000;
  return daysSince <= 14;
}
