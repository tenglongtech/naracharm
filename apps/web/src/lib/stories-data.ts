/**
 * 故事库 (静态内容 · 半静态) — 6 个故事覆盖 5 个文化脉络 + 1 个融合款
 * 对应 STORY_DOCTRINE 四层写法 (Origin / Craft / Meaning / Resonance)
 * 用于 /stories 列表 + /stories/[slug] 详情
 */

export type StorySlug =
  | 'silver-that-remembers'
  | 'the-knot-that-counts-home'
  | 'silver-as-inheritance'
  | 'jade-that-listens'
  | 'silk-that-holds-the-light'
  | 'where-the-caravan-meets';

export type Story = {
  slug: StorySlug;
  title: string;
  excerpt: string;
  icon: string;
  heritage: 'Tibetan Plateau' | 'Mongolian Steppe' | 'Miao Villages' | 'Han Literati' | 'Thai Tropics' | 'Caravan Road';
  heritageSlug: 'tibetan' | 'mongol' | 'southwest' | 'han' | 'tai' | 'fusion';
  readMinutes: number;
  publishedAt: string; // ISO date
  body: string[]; // 段落数组,每段一段
  closing: string;
  relatedProducts: { slug: string; name: string }[];
};

export const STORIES: Story[] = [
  {
    slug: 'silver-that-remembers',
    title: 'Silver That Remembers',
    icon: '🏔️',
    heritage: 'Tibetan Plateau',
    heritageSlug: 'tibetan',
    excerpt:
      'In Lhasa, a silversmith has chased the same lotus pattern for thirty years. He says silver holds the memory of every strike.',
    readMinutes: 3,
    publishedAt: '2026-05-12',
    body: [
      'In the workshops of Lhasa, silversmiths have been hammering small amulets like this one for as long as anyone remembers. The same hammer, the same chisel, the same prayer said under the breath with every strike.',
      'Each piece is hand-cut, hand-hammered, and set with a single turquoise stone chosen by eye. No two are quite the same. The slight unevenness in the petals is not a flaw — it is the mark of the hand that made it.',
      'Turquoise is what Tibetans call "the sky, held still" — a piece of fallen heaven, given at birth, carried for protection. In old photographs you can see grandmothers wearing it next to their skin, where the body heat slowly changes the color, the way a river changes a stone.',
      'A piece like this takes a silversmith three full days to finish. Not because the work is slow, but because the work is honest. A machine could stamp the pattern in seconds. The machine could not hold the meaning.',
    ],
    closing:
      'You may never walk the plateau. But the day you put this on, you carry a small piece of that sky with you — and a small piece of the hand that made it.',
    relatedProducts: [
      { slug: 'tibetan-amulet-925-bracelet', name: 'Tibetan Amulet 925 Bracelet' },
      { slug: 'amethyst-calm-bracelet', name: 'Amethyst Calm Bracelet' },
    ],
  },
  {
    slug: 'the-knot-that-counts-home',
    title: 'The Knot That Counts Home',
    icon: '🐎',
    heritage: 'Mongolian Steppe',
    heritageSlug: 'mongol',
    excerpt:
      'Every braid a mother ties for her traveling child is a silent count of the days until return.',
    readMinutes: 3,
    publishedAt: '2026-05-19',
    body: [
      'On the steppe, a mother ties a knot for her child before a long journey. One knot for every hundred miles of safe return. The child does not count them. The mother does. The knots hold, even if the road is long.',
      'The Mongolian road knot is not a clasp. There is no metal catching. There is only cord, braided by hand, knot by knot, in waxed cotton that softens with wear but does not break. The closure is a sliding knot — pull to tighten, pull to release — which means the piece can be passed from wrist to wrist, year to year, as the wearer changes.',
      'Black obsidian has been used as a protective stone since the Stone Age. It is volcanic glass — sharp, dark, and quiet. The Mongolians pair it with red cord, the color of blessing. A small piece of cooled lava, kept close, to remember that someone is on your side.',
    ],
    closing:
      'You may not be going anywhere. But every time you tie this on, you remember someone who was. Or someone you wish was.',
    relatedProducts: [
      { slug: 'mongolian-road-knot-cord', name: 'Mongolian Road Knot Cord' },
      { slug: 'obsidian-guardian-charm', name: 'Obsidian Guardian Charm' },
    ],
  },
  {
    slug: 'silver-as-inheritance',
    title: 'Silver as Inheritance',
    icon: '🌿',
    heritage: 'Miao Villages',
    heritageSlug: 'southwest',
    excerpt:
      'For the Miao, a bride wears her entire family history around her neck — hammered, over three years, into silver.',
    readMinutes: 4,
    publishedAt: '2026-05-26',
    body: [
      'In the Miao villages of southwest China, a bride does not wear a single piece of jewelry. She wears a record. Around her neck, her arms, her ears, her headdress — hammered silver that says where her family came from, where they migrated, who they were when they arrived. It is her family history, written in a metal that outlasts paper.',
      'Miao filigree is the slowest of the silversmith arts. A single filigree wire is drawn by hand, thinner than a hair, then coiled into a flower that trembles when she moves. The silversmith sits in a low wooden room, often for days, while the pattern takes shape. There is no shortcut. The wire must be thin enough to bend, thick enough to hold.',
      'A full set of Miao wedding silver can take three years to make. It is often begun before a girl is born — the family commissioning it the way another family might commission a name. By the time she wears it, it has been on its own small journey, through many hands.',
    ],
    closing:
      'You will not wear three years of silver. But the earring you choose, the pendant you tie, the cord you fasten — they too can be inheritance. Something a daughter borrows on her wedding day, someday. Something the air remembers.',
    relatedProducts: [
      { slug: 'miao-filigree-drop-earrings', name: 'Miao Filigree Drop Earrings' },
    ],
  },
  {
    slug: 'jade-that-listens',
    title: 'Jade That Listens',
    icon: '📜',
    heritage: 'Han Literati',
    heritageSlug: 'han',
    excerpt:
      'Jade does not speak. It warms. Worn close to the skin, it slowly takes the shape of the wearer.',
    readMinutes: 3,
    publishedAt: '2026-06-02',
    body: [
      'In the East, jade has been treasured above gold for thousands of years. Not for its flash — jade has no flash — but for its quiet. The literati, the scholar-painters of the Song and Ming dynasties, kept jade on their desks not because it was precious, but because it was company. A stone that did not interrupt.',
      'A jade pendant does not announce itself. It sits at the collarbone, beneath the collar, where only the wearer feels its weight. Over the years the stone warms to the body and the body warms to the stone. There is a Chinese saying: 人养玉, 玉养人 — the person nurtures the jade, and the jade nurtures the person back.',
      'The lotus is what the literati called the most honest flower. It grows from mud. It does not pretend otherwise. In a world that asks you to be hard, the lotus is permission to stay soft — to keep your roots where they are, and your face toward the sun.',
    ],
    closing:
      'This is not jewelry that asks to be noticed. It is jewelry that listens. Wear it on the days you need to hear yourself think.',
    relatedProducts: [{ slug: 'han-jade-lotus-pendant', name: 'Han Jade Lotus Pendant' }],
  },
  {
    slug: 'silk-that-holds-the-light',
    title: 'Silk That Holds the Light',
    icon: '🌊',
    heritage: 'Thai Tropics',
    heritageSlug: 'tai',
    excerpt:
      'In the silk villages of northern Thailand, each thread of silk catches the light and holds it — the way water holds the afternoon sun.',
    readMinutes: 3,
    publishedAt: '2026-06-09',
    body: [
      'In the silk villages of northern Thailand, the loom moves slowly. The way light moves through wet leaves after rain. The weaver sits cross-legged on a wooden platform, her hands moving in a rhythm that has not changed in two hundred years. The thread, before it is thread, is a cocoon. Inside, a small white moth, almost ready.',
      'A single Thai silk scarf can take a week. The colors are dyed in batches with plants from the garden — indigo, marigold, the heart of the lac insect for red. No two batches are exactly alike. The variation is the point.',
      'This phone charm is a small piece of that — a few centimeters of hand-woven silk, finished with a tiny silver lotus bead that catches the afternoon sun. A phone is a small thing. But a hundred times a day, your phone lights up — and now, each time, a small piece of old meaning lights up with it.',
    ],
    closing:
      'In the tropics, time moves slowly. Jewelry, too, can be slow — made to last, made to soften with you, made to hold the light.',
    relatedProducts: [
      { slug: 'tai-silk-cord-phone-charm', name: 'Thai Silk Cord Phone Charm' },
    ],
  },
  {
    slug: 'where-the-caravan-meets',
    title: 'Where the Caravan Meets',
    icon: '✨',
    heritage: 'Caravan Road',
    heritageSlug: 'fusion',
    excerpt:
      'Silver traveled down from the plateau. Silk traveled west from the lowlands. They met, over centuries, on the caravan roads.',
    readMinutes: 4,
    publishedAt: '2026-06-16',
    body: [
      'There was a road, once, that ran from the plateau to the lowlands, from the desert to the sea. The Silk Road, the caravan road, the road that took centuries to build and only a few decades to forget. On it, things traveled: silk, silver, salt, tea, ideas about god, ideas about numbers, ideas about what a knot could mean.',
      'A Tibetan trader might carry a hammered silver amulet down from Lhasa. A Miao silversmith might carry a coil of filigree wire up from the southwest. They would meet, somewhere, in a mountain pass or a river crossing, and trade — not just goods, but meanings. A prayer, a pattern, a way of fastening.',
      'This necklace is a small piece of that meeting. Hand-hammered Tibetan silver, set with a turquoise stone, finished with a coil of Miao filigree, on a hand-woven silk cord. It is not any one tradition. It is the moment two of them shook hands — and the handshake held.',
    ],
    closing:
      'You may never ride a caravan. But every time you wear a piece that came from two places at once, you ride it a little.',
    relatedProducts: [
      { slug: 'caravan-fusion-necklace', name: 'Caravan Fusion Necklace' },
    ],
  },
];

export function getStoryBySlug(slug: string): Story | null {
  return STORIES.find((s) => s.slug === slug) ?? null;
}
