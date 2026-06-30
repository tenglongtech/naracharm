/**
 * Blog/SEO 内容文章数据
 *
 * 每篇文章:
 * - 针对高搜索量关键词优化 (title/description/keywords)
 * - 含 Article JSON-LD (Google 富片段)
 * - 关联产品 (文章内链到产品页)
 * - 接 STORY_DOCTRINE 文化叙事
 */

export type BlogArticle = {
  slug: string;
  title: string;           // SEO title (含关键词)
  description: string;     // meta description
  keywords: string[];      // SEO keywords
  category: 'Crystal Meanings' | 'Symbolism' | 'Styling' | 'Care Guide' | 'Gift Guide';
  author: 'Nara Charm';
  publishedAt: string;     // ISO date
  updatedAt: string;
  readingTime: string;     // "5 min read"
  heroImage?: string;
  relatedProducts: string[]; // product slugs
  relatedArticles?: string[]; // article slugs
  content: { heading: string; body: string[] }[];
};

export const BLOG_ARTICLES: BlogArticle[] = [
  // ═══════════════════════════════════════════════════════════════
  // 文章 1: Amethyst Meaning (月搜 ~30K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'amethyst-meaning-healing-properties',
    title: 'Amethyst Meaning: Healing Properties, Benefits & How to Wear It',
    description: 'Discover the meaning and healing properties of amethyst — the stone of calm, protection, and spiritual wisdom. Learn what amethyst does, its benefits, and how to wear it.',
    keywords: ['amethyst meaning', 'amethyst healing properties', 'amethyst benefits', 'what does amethyst do', 'amethyst stone meaning', 'amethyst crystal', 'amethyst bracelet meaning'],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-06-30',
    readingTime: '6 min read',
    relatedProducts: ['amethyst-peace-bracelet', 'amethyst-calm-bracelet'],
    relatedArticles: ['rose-quartz-meaning-love-stone', 'turquoise-meaning-protection-stone'],
    content: [
      {
        heading: 'What Is Amethyst?',
        body: [
          'Amethyst is a violet variety of quartz, prized for thousands of years for its beauty and its believed spiritual properties. Its color ranges from pale lavender to deep purple, caused by natural irradiation of iron within the crystal.',
          'The name "amethyst" comes from the ancient Greek word *amethystos*, meaning "not intoxicated." The Greeks believed the stone could prevent drunkenness — a myth that speaks to amethyst\'s oldest and most enduring association: clarity of mind.',
          'Today, amethyst is one of the most popular healing crystals in the world, worn as bracelets, necklaces, and rings by people drawn to its calming energy and beautiful purple hue.',
        ],
      },
      {
        heading: 'Amethyst Meaning & Symbolism',
        body: [
          'Across cultures, amethyst has been a stone of calm, protection, and spiritual wisdom:',
          '**In ancient Greece and Rome**, amethyst was carved into drinking vessels and worn as amulets to prevent intoxication and keep the mind clear. It was a stone of sobriety — both literal and spiritual.',
          '**In Tibetan Buddhism**, amethyst is considered a sacred stone, used in prayer beads (mala) and meditation practices. It is associated with the crown chakra — the energy center connected to higher consciousness and spiritual connection.',
          '**In medieval Europe**, amethyst was a stone of royalty and the clergy, symbolizing piety, humility, and spiritual wisdom. Catholic bishops wore amethyst rings, earning it the nickname "bishop\'s stone."',
          'At its core, amethyst means **calm in chaos** — the ability to stay centered when the world is loud.',
        ],
      },
      {
        heading: 'Amethyst Healing Properties',
        body: [
          'In crystal healing traditions, amethyst is believed to offer these benefits:',
          '**Calming the mind.** Amethyst is the stone most associated with stress relief and emotional balance. Many people wear it to quiet anxiety, reduce racing thoughts, and find mental clarity.',
          '**Deepening meditation.** Because of its connection to the crown and third-eye chakras, amethyst is considered a powerful aid for meditation, intuition, and spiritual insight.',
          '**Protection.** Like many purple and dark stones, amethyst has a long history as a protective talisman — believed to ward off negative energy and psychic attacks.',
          '**Better sleep.** Amethyst is often placed under pillows or worn at night to promote restful sleep and vivid, meaningful dreams.',
          '**Sobriety and addiction support.** The stone\'s ancient Greek association with clarity has made it a symbol for those on recovery journeys.',
        ],
      },
      {
        heading: 'Which Chakra Is Amethyst?',
        body: [
          'Amethyst is primarily associated with two chakras:',
          '**The Crown Chakra (Sahasrara)** — located at the top of the head, this chakra governs spiritual connection, universal consciousness, and enlightenment. Amethyst\'s purple color resonates with this energy center.',
          '**The Third Eye Chakra (Ajna)** — located between the eyebrows, this chakra governs intuition, perception, and inner wisdom. Amethyst is believed to stimulate this chakra, enhancing insight and spiritual awareness.',
        ],
      },
      {
        heading: 'How to Wear Amethyst',
        body: [
          'The most popular ways to wear amethyst for its healing properties:',
          '**Amethyst bracelets** are the most common choice — worn on the left wrist (the receiving side of the body in crystal healing), they keep the stone\'s calming energy close to you all day.',
          '**Amethyst necklaces** keep the stone near your heart and throat, supporting emotional expression and communication.',
          '**Amethyst rings** on the middle finger are believed to enhance the stone\'s connection to intuition and inner wisdom.',
          'At Nara Charm, our amethyst bracelets are hand-strung with natural amethyst beads and Miao silver accents — each bead slightly different, because natural stones are never identical. [Shop our Amethyst Peace Bracelet →](/products/amethyst-peace-bracelet)',
        ],
      },
      {
        heading: 'How to Cleanse Amethyst',
        body: [
          'To keep your amethyst energetically vibrant, cleanse it regularly:',
          '**Moonlight.** Place your amethyst under the full moon overnight to cleanse and recharge it.',
          '**Running water.** Briefly rinse under cool running water (avoid prolonged soaking, as it can fade the color over time).',
          '**Sage or palo santo.** Pass the stone through the smoke of burning sage or palo santo to clear accumulated energy.',
          '**Avoid prolonged sunlight.** Amethyst can fade in direct sunlight over time. Store it away from bright windows.',
        ],
      },
      {
        heading: 'Amethyst vs. Other Purple Stones',
        body: [
          'Amethyst is sometimes confused with other purple stones. Here\'s how to tell them apart:',
          '**Amethyst** is translucent purple quartz — the most common and affordable purple gemstone.',
          '**Charoite** is a deeper, swirled purple stone with white and black patterns, rarer than amethyst.',
          '**Purple Fluorite** is often banded with green or yellow, and is softer than amethyst.',
          'If your purple stone is a consistent, translucent violet — especially in bead form — it is most likely amethyst.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 2: Rose Quartz Meaning (月搜 ~25K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'rose-quartz-meaning-love-stone',
    title: 'Rose Quartz Meaning: The Stone of Love, Healing & Self-Compassion',
    description: 'Discover the meaning and healing properties of rose quartz — the stone of unconditional love. Learn what rose quartz does, how it heals the heart, and how to wear it.',
    keywords: ['rose quartz meaning', 'rose quartz healing properties', 'rose quartz benefits', 'what does rose quartz do', 'rose quartz love stone', 'rose quartz bracelet', 'stone of love'],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-06-30',
    readingTime: '5 min read',
    relatedProducts: ['rose-quartz-bracelet', 'rose-quartz-tenderness-bracelet'],
    relatedArticles: ['amethyst-meaning-healing-properties', 'turquoise-meaning-protection-stone'],
    content: [
      {
        heading: 'What Is Rose Quartz?',
        body: [
          'Rose quartz is a pink variety of quartz, ranging from the palest blush to a deeper rosy hue. Its soft, cloudy translucence gives it a gentle, soothing appearance — perfectly matched to its meaning.',
          'It is one of the most beloved crystals in the world, and has been associated with love — in all its forms — for thousands of years. From ancient Egypt to modern crystal healing, rose quartz has been the stone people reach for when they seek love, healing, and emotional peace.',
        ],
      },
      {
        heading: 'Rose Quartz Meaning: The Stone of Unconditional Love',
        body: [
          'Rose quartz is universally known as **the stone of love** — but this "love" is broader than romance alone:',
          '**Self-love.** Rose quartz is the stone most recommended for building self-acceptance, self-worth, and self-compassion. It is the crystal of learning to be gentle with yourself.',
          '**Romantic love.** In many traditions, rose quartz is believed to attract love and deepen existing relationships. It is often given as a gift between partners.',
          '**Universal love.** Beyond the personal, rose quartz represents love for all beings — compassion, empathy, and a sense of connection to the world around you.',
          'At its core, rose quartz means **tenderness** — the courage to keep your heart open, even after it has been hurt.',
        ],
      },
      {
        heading: 'Rose Quartz Healing Properties',
        body: [
          'In crystal healing, rose quartz is believed to offer:',
          '**Emotional healing.** Rose quartz is the premier stone for grief, heartbreak, and emotional wounds. It is believed to help release old pain and open the heart to new experiences.',
          '**Self-acceptance.** For those struggling with self-criticism or low self-worth, rose quartz is said to foster a kinder inner voice and deeper self-compassion.',
          '**Relationship harmony.** Placed in a bedroom or worn daily, rose quartz is believed to attract loving energy and smooth conflicts in partnerships.',
          '**Calming energy.** Like amethyst, rose quartz has a gentle, soothing vibration that can reduce stress — but where amethyst calms the mind, rose quartz soothes the heart.',
        ],
      },
      {
        heading: 'Which Chakra Is Rose Quartz?',
        body: [
          'Rose quartz is associated with **the Heart Chakra (Anahata)** — the energy center located at the center of the chest, governing love, compassion, forgiveness, and emotional balance.',
          'When the heart chakra is open and balanced, we feel connected, loving, and at peace. When it is blocked, we may feel isolated, resentful, or afraid to love.',
          'Rose quartz is believed to gently open and balance the heart chakra, allowing love — for self and others — to flow more freely.',
        ],
      },
      {
        heading: 'How to Wear Rose Quartz',
        body: [
          'Rose quartz is most effective when worn close to the body, especially near the heart:',
          '**Rose quartz bracelets** are popular and practical — worn on the left wrist, they keep the stone\'s loving energy circulating through your body all day.',
          '**Rose quartz necklaces** keep the stone directly over the heart chakra, maximizing its effect on emotional healing.',
          '**Rose quartz rings** on the ring finger of the left hand are associated with attracting and strengthening romantic love.',
          'At Nara Charm, our rose quartz bracelets are hand-strung with natural rose quartz beads, paired with Miao silver accents. [Shop our Rose Quartz Bracelet →](/products/rose-quartz-bracelet)',
        ],
      },
      {
        heading: 'Rose Quartz and Amethyst Together',
        body: [
          'Rose quartz and amethyst are one of the most popular crystal pairings — and for good reason. Where amethyst calms the mind, rose quartz heals the heart. Together, they create a powerful combination of mental clarity and emotional peace.',
          'Many people stack an amethyst bracelet with a rose quartz bracelet, or alternate beads on a single strand. The two stones are believed to amplify each other\'s gentle, balancing energy.',
          '[Shop Amethyst + Rose Quartz together →](/collections/crystal)',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 3: Turquoise Meaning (月搜 ~20K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'turquoise-meaning-protection-stone',
    title: 'Turquoise Meaning: The Stone of Protection, Sky & Sacred Wisdom',
    description: 'Discover the meaning and healing properties of turquoise — a sacred stone of protection, wisdom, and the sky. Learn what turquoise means across cultures and how to wear it.',
    keywords: ['turquoise meaning', 'turquoise healing properties', 'turquoise stone meaning', 'what does turquoise mean', 'turquoise protection', 'turquoise bracelet meaning', 'tibetan turquoise'],
    category: 'Crystal Meanings',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-06-30',
    readingTime: '6 min read',
    relatedProducts: ['turquoise-sky-bracelet'],
    relatedArticles: ['amethyst-meaning-healing-properties', 'tibetan-jewelry-symbols-meaning'],
    content: [
      {
        heading: 'What Is Turquoise?',
        body: [
          'Turquoise is one of the oldest known gemstones — used in jewelry for over 7,000 years. Its distinctive blue-green color, often with dark veins (matrix) running through it, makes it instantly recognizable.',
          'Unlike many gemstones, turquoise is opaque — its beauty comes not from transparency but from its rich, varied color and the natural patterns of the matrix lines. No two turquoise stones are ever identical.',
          'Turquoise has been sacred to cultures across the world — from Native American tribes to Tibetan Buddhists to ancient Egyptians. It is, perhaps, the most universally revered stone in human history.',
        ],
      },
      {
        heading: 'Turquoise Meaning Across Cultures',
        body: [
          '**In Tibet**, turquoise is not just a decoration — it is considered a piece of the sky that fell to earth. It is given to children at birth, worn throughout life, and is believed to offer protection, good fortune, and a connection to the divine. The Dalai Lama himself is often seen wearing turquoise.',
          '**Among Native American tribes** (especially the Navajo, Zuni, and Hopi), turquoise is a sacred stone of protection, used in ceremonial jewelry and believed to bring rain, health, and spiritual power.',
          '**In ancient Egypt**, turquoise was associated with the goddess Hathor and was used in royal jewelry and burial amulets. The famous mask of Tutankhamun contains turquoise inlays.',
          '**In ancient Persia** (modern Iran), turquoise was worn around the neck or wrist to protect against unnatural death. The Persian word *pirouzeh* means "victory" — the stone\'s name itself carries a blessing.',
        ],
      },
      {
        heading: 'Turquoise Healing Properties',
        body: [
          'In crystal healing, turquoise is believed to offer:',
          '**Protection.** Turquoise has been a protective stone in nearly every culture that has used it. It is believed to ward off evil, absorb negative energy, and keep the wearer safe — especially during travel.',
          '**Communication.** Turquoise is associated with the throat chakra, supporting honest, clear communication and self-expression.',
          '**Spiritual connection.** Because of its sky-blue color, turquoise is considered a bridge between heaven and earth — a stone that connects the wearer to higher wisdom and spiritual guidance.',
          '**Physical healing.** In traditional practices, turquoise is believed to support the immune system, reduce inflammation, and aid detoxification.',
        ],
      },
      {
        heading: 'Tibetan Turquoise: Why It\'s Special',
        body: [
          'In Tibetan culture, turquoise holds a unique place. It is one of the most common stones in Tibetan jewelry — more valued than gold in some contexts.',
          'Tibetan turquoise tends to be greener and more matrix-rich than American turquoise, with natural variations that Tibetans consider marks of authenticity. Perfectly uniform "turquoise" is often dyed howlite; real turquoise has character.',
          'A traditional Tibetan saying: *"Wear turquoise, and the sky will always watch over you."*',
          'At Nara Charm, our turquoise bracelets use natural turquoise beads — each one slightly different, with genuine matrix lines. [Shop our Turquoise Sky Bracelet →](/products/turquoise-sky-bracelet)',
        ],
      },
      {
        heading: 'How to Wear Turquoise',
        body: [
          '**Turquoise bracelets** are the most popular way to wear the stone for daily protection and grounding energy.',
          '**Turquoise necklaces** keep the stone near the throat chakra, supporting communication.',
          '**Turquoise rings** on the index finger are believed to enhance leadership and self-confidence.',
          'Turquoise pairs beautifully with silver — especially Tibetan silver, which has a darkened, antiqued patina that complements the stone\'s blue-green perfectly.',
        ],
      },
      {
        heading: 'How to Care for Turquoise',
        body: [
          'Turquoise is a relatively soft, porous stone, requiring special care:',
          '**Avoid water and chemicals.** Turquoise can absorb liquids, which can change its color over time. Remove turquoise jewelry before showering, swimming, or washing dishes.',
          '**Avoid prolonged sunlight.** Like amethyst, turquoise can fade in direct sunlight. Store it in a soft pouch away from light.',
          '**Avoid cosmetics.** Put turquoise jewelry on after applying lotion, perfume, or hairspray — these can stain or damage the stone.',
          '**Clean gently.** Wipe with a soft, dry cloth. Never use ultrasonic cleaners or steam.',
        ],
      },
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
    updatedAt: '2026-06-30',
    readingTime: '7 min read',
    relatedProducts: ['tibetan-amulet-925-bracelet'],
    relatedArticles: ['turquoise-meaning-protection-stone', 'amethyst-meaning-healing-properties'],
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
          'At Nara Charm, we use genuine 925 sterling silver in our Tibetan-inspired pieces, combined with traditional hand-chasing techniques. [Shop our Tibetan Amulet 925 Bracelet →](/products/tibetan-amulet-925-bracelet)',
        ],
      },
      {
        heading: 'How to Choose Tibetan Jewelry',
        body: [
          'When choosing Tibetan jewelry for its spiritual meaning:',
          '**Look for symbols that resonate.** Choose a lotus for growth, an endless knot for connection, turquoise for protection. Let the meaning guide you.',
          '**Check the materials.** Real turquoise has matrix lines and natural variation. Real silver has weight and develops a patina. If it looks too perfect, it may be synthetic.',
          '**Respect the tradition.** Tibetan symbols are sacred. Wear them with awareness of their meaning, not just as fashion.',
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 文章 5: How to Style Boho Beaded Bracelets (月搜 ~10K+)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'how-to-style-beaded-bracelets',
    title: 'How to Style Beaded Bracelets: Stacking, Layering & Boho Looks',
    description: 'Learn how to style and stack beaded bracelets for any look — boho, minimalist, or bold. Tips on layering natural stone bracelets, mixing colors, and creating your own stack.',
    keywords: ['how to style beaded bracelets', 'stacking bracelets', 'layering bracelets', 'boho bracelet stack', 'how to wear bracelets', 'beaded bracelet styling', 'bracelet stacking guide'],
    category: 'Styling',
    author: 'Nara Charm',
    publishedAt: '2026-06-30',
    updatedAt: '2026-06-30',
    readingTime: '5 min read',
    relatedProducts: ['amethyst-peace-bracelet', 'rose-quartz-bracelet', 'turquoise-sky-bracelet'],
    relatedArticles: ['amethyst-meaning-healing-properties', 'rose-quartz-meaning-love-stone'],
    content: [
      {
        heading: 'Why Beaded Bracelets Are the Perfect Accessory',
        body: [
          'Beaded bracelets are the most versatile piece of jewelry you can own. They\'re comfortable enough for everyday wear, meaningful enough to carry intention, and infinitely stackable — which means you can create a completely different look just by changing how you combine them.',
          'Unlike metal bangles or watches, beaded bracelets are soft, quiet, and never feel heavy. They move with you. And because each bead is a natural stone, no two bracelets are ever exactly alike.',
          'Here\'s how to style them — from a single understated piece to a full boho stack.',
        ],
      },
      {
        heading: 'The Single-Bracelet Look (Minimalist)',
        body: [
          'Sometimes one bracelet is all you need. This is the minimalist approach — clean, intentional, and quietly powerful.',
          '**How to wear it:** Choose a bracelet with a stone whose meaning matters to you that day. Amethyst for a stressful workday. Rose quartz for a date. Turquoise for travel.',
          '**Best for:** Professional settings, minimalist wardrobes, days when you want meaning without flash.',
          '**Pro tip:** Wear it on your non-dominant hand. In crystal healing, the left hand is the "receiving" side — the side that absorbs the stone\'s energy.',
        ],
      },
      {
        heading: 'The Two-Bracelet Stack (Balanced)',
        body: [
          'Two bracelets create balance without overwhelm. This is the sweet spot for most people — intentional but not busy.',
          '**Best combinations:**',
          '- Amethyst + Rose Quartz (calm mind + open heart)',
          '- Turquoise + Amethyst (protection + clarity)',
          '- Rose Quartz + Turquoise (love + courage)',
          '**Best for:** Everyday wear, casual outfits, weekend looks.',
          '[Shop our Crystal Collection for stacking →](/collections/crystal)',
        ],
      },
      {
        heading: 'The Full Boho Stack (3+ Bracelets)',
        body: [
          'Three or more bracelets is where the boho magic happens. This is the free-spirited, layered look that says "I collect meaningful things."',
          '**How to build a great stack:**',
          '1. **Start with a base.** Choose your "anchor" bracelet — usually your most meaningful stone (e.g., turquoise for protection).',
          '2. **Add contrast.** Pair it with a complementary color (e.g., rose quartz\'s soft pink against turquoise\'s blue-green).',
          '3. **Mix bead sizes.** Combine 8mm beads with smaller 6mm beads for visual rhythm.',
          '4. **Add texture.** Mix in a cord bracelet (like a Mongolian knot) alongside smooth stone beads.',
          '5. **Don\'t overthink it.** The beauty of a boho stack is its imperfection. Trust your instincts.',
        ],
      },
      {
        heading: 'Color Combinations That Work',
        body: [
          'Not sure which colors to combine? Here are proven palettes:',
          '**Earth & Sky:** Turquoise + Amethyst + Lapis Lazuli (blue-purple spectrum, grounding)',
          '**Love & Light:** Rose Quartz + Clear Quartz + Citrine (warm pink-gold, uplifting)',
          '**Protection Stack:** Black Obsidian + Turquoise + Red Agate (dark-blue-red, powerful)',
          '**All-Purple:** Amethyst + Charoite + Lepidolite (deep spiritual energy)',
          '**Mix & Match:** Combine any 3-4 stones that feel right. There are no wrong answers.',
        ],
      },
      {
        heading: 'Mixing Beaded Bracelets with Other Jewelry',
        body: [
          'Beaded bracelets don\'t exist in isolation. Here\'s how to mix them with other pieces:',
          '**With a watch:** Wear beaded bracelets on the opposite wrist from your watch. This prevents scratching and creates visual balance.',
          '**With metal bangles:** Mix 1-2 beaded bracelets with thin metal bangles for a textured, eclectic look.',
          '**With a phone charm:** Yes, your phone charm counts as jewelry! Coordinate its stone with your bracelet for a cohesive look.',
          '**With necklaces:** Match the stone family — amethyst bracelet + amethyst pendant, for a coordinated set.',
        ],
      },
      {
        heading: 'Which Wrist to Wear Bracelets On',
        body: [
          'In crystal healing traditions, the wrist you choose matters:',
          '**Left wrist (receiving side):** Wear stones whose energy you want to absorb — calming stones (amethyst), love stones (rose quartz), healing stones. This is the most common choice.',
          '**Right wrist (giving side):** Wear stones whose energy you want to project outward — protection stones (turquoise, obsidian), confidence stones (tiger\'s eye).',
          '**Both wrists:** The full-power option. Wear receiving stones on the left, projecting stones on the right, for a complete energy circuit.',
        ],
      },
    ],
  },
];

// ─── 查询函数 ───────────────────────────────────────────────────────────
export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): BlogArticle[] {
  return BLOG_ARTICLES.filter((a) => a.category === category);
}

export function getRelatedArticles(slug: string, limit = 3): BlogArticle[] {
  const current = getArticleBySlug(slug);
  if (!current) return BLOG_ARTICLES.slice(0, limit);
  return BLOG_ARTICLES
    .filter((a) => a.slug !== slug)
    .filter((a) => current.relatedArticles?.includes(a.slug) || a.category === current.category)
    .slice(0, limit);
}
