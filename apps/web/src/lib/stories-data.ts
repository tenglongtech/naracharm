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
  publishedAt: string;
  updatedAt: string;
  body: string[];
  closing: string;
  relatedCollection: { slug: string; name: string };
  relatedProducts: { slug: string; name: string }[];
};

const updatedAt = '2026-11-18';

export const STORIES: Story[] = [
  {
    slug: 'silver-that-remembers', title: 'Silver That Remembers', icon: '🏔️',
    heritage: 'Tibetan Plateau', heritageSlug: 'tibetan',
    excerpt: 'A small blue-green accent changes the way we see a field of dark metal.',
    readMinutes: 1, publishedAt: '2026-05-12', updatedAt,
    body: [
      'Start with the combination that drew us in: a cool blue-green center and a darker, uneven edge. It is the contrast that gives a small object a sense of depth. On a fine cord or a bracelet, the bright area can be very small and still draw the eye.',
      'Plateau Palette explores that contrast in several ways. A low oval bordered in dark color gives the green room to settle. A bead under a silver-colored frame catches more light as the wearer moves. Dark red thread works when it appears as a narrow edge or an interruption.',
      'We describe the design reference and the physical item separately. For a piece in the shop, check the material list for the exact stone or metal. For a studio preview, use the palette to see where the idea is headed.',
    ],
    closing: 'Look first for the one accent you would still notice from across a table.',
    relatedCollection: { slug: 'plateau-palette', name: 'Plateau Palette' },
    relatedProducts: [{ slug: 'tibetan-amulet-925-bracelet', name: 'Tibetan Amulet 925 Bracelet' }],
  },
  {
    slug: 'the-knot-that-counts-home', title: 'The Knot That Counts Home', icon: '🐎',
    heritage: 'Mongolian Steppe', heritageSlug: 'mongol',
    excerpt: 'A fold that would normally hide at the fastening becomes the detail you see first.',
    readMinutes: 1, publishedAt: '2026-05-19', updatedAt,
    body: [
      'Steppe Lines began with a line that could fold and return. On a narrow wrist piece, a braid can separate into two lanes and cross without another fitting or decorative center. You can read the direction of the strands by the shadow the fold leaves.',
      'A narrow running stitch gives a different effect. It stays close to the edge and reads as a quiet line on a dark cord. A broad crossing looks stronger with an uninterrupted sleeve that lets the line remain visible.',
      'For a piece with a working knot, check how far the loop opens and where the ends go when tightened. The way it works is part of its design and matters every time you put it on.',
    ],
    closing: 'A fold can recall a path away from home and the last bend that leads back.',
    relatedCollection: { slug: 'steppe-lines', name: 'Steppe Lines' },
    relatedProducts: [{ slug: 'mongolian-road-knot-cord', name: 'Mongolian Road Knot Cord' }],
  },
  {
    slug: 'silver-as-inheritance', title: 'Silver as Inheritance', icon: '🌿',
    heritage: 'Miao Villages', heritageSlug: 'southwest',
    excerpt: 'What stays with us in open silverwork can be the shape the wire leaves empty.',
    readMinutes: 1, publishedAt: '2026-05-26', updatedAt,
    body: [
      'Hold an openwork earring above a plain sheet and see which parts turn into shadow. Move it toward another color and the center changes even though the metal stays in the same place. The empty shape belongs to the design.',
      'Ink & Silver starts there. An open rectangular frame carries a curl only at its lower corner. The curl is readable because we leave the tall opening above it mostly clear. Elsewhere in the collection we use an offset oval or a slack arc to hold the same sense of space.',
      'An open piece can be a small reminder of someone’s preference for detail. It might be a shape you remember from their old earrings, or the way they wore a fine line against a plain coat.',
    ],
    closing: 'Sometimes it is the space around a favorite detail that makes it easy to remember.',
    relatedCollection: { slug: 'ink-silver', name: 'Ink & Silver' },
    relatedProducts: [{ slug: 'miao-filigree-drop-earrings', name: 'Miao Filigree Drop Earrings' }],
  },
  {
    slug: 'jade-that-listens', title: 'Jade That Listens', icon: '📜',
    heritage: 'Han Literati', heritageSlug: 'han',
    excerpt: 'A pale green edge and a warm cream field are enough to make a quiet pendant.',
    readMinutes: 1, publishedAt: '2026-06-02', updatedAt,
    body: [
      'Imagine one piece of paper sliding over another. When the upper edge moves off center it gives the outline a narrow strip of shadow. That small effect is the starting point of Paper Moon, with a green crescent set ahead of an uneven cream disc.',
      'The other Jade & Paper designs explore different wide and narrow shapes around the same palette. A slim green line can give a pale outline more clarity. With a small pendant, a darker shirt makes the offset edge easier to see.',
      'Jade-tone is a description of color. For a particular item, read the material line before deciding whether it is the piece you want. Ask us about the underlying material if the distinction matters for your choice.',
    ],
    closing: 'Wear a quiet color close enough that you can notice how it changes with the light.',
    relatedCollection: { slug: 'jade-and-paper', name: 'Jade & Paper' },
    relatedProducts: [{ slug: 'han-jade-lotus-pendant', name: 'Han Jade Lotus Pendant' }],
  },
  {
    slug: 'silk-that-holds-the-light', title: 'Silk That Holds the Light', icon: '🌊',
    heritage: 'Thai Tropics', heritageSlug: 'tai',
    excerpt: 'A surface that seems flat from one angle can become two colors when the fabric turns.',
    readMinutes: 1, publishedAt: '2026-06-09', updatedAt,
    body: [
      'Look at a folded textile from the side and the same color can have a bright edge and a deeper center. Where the fold turns back toward the light, a thin band is enough to suggest the width and direction of the ribbon.',
      'River Silk explores what we can do with that band. We give a folded green ribbon a narrow center and leave the edges broad. Another design puts a different shade on either side of the same fold. The textile stays the main part of the piece.',
      'How you wear a fold matters too. Tight pockets and heavy cuffs can hide the texture or press it flat. A short loop or a ribbon with one clear edge is easier to see in daily use.',
    ],
    closing: 'The shape is easiest to read when you leave a little room for it to move.',
    relatedCollection: { slug: 'river-silk', name: 'River Silk' },
    relatedProducts: [{ slug: 'tai-silk-cord-phone-charm', name: 'Thai Silk Cord Phone Charm' }],
  },
  {
    slug: 'where-the-caravan-meets', title: 'Where the Caravan Meets', icon: '✨',
    heritage: 'Caravan Road', heritageSlug: 'fusion',
    excerpt: 'A soft cord and a firm metal-colored curve can meet in one visible crossing.',
    readMinutes: 1, publishedAt: '2026-06-16', updatedAt,
    body: [
      'A braid looks soft because the places where it changes direction are visible. A thin metal-colored line can hold a sharper edge. Put the two side by side and the difference becomes the first thing you see.',
      'In the Caravan Colors collection the crossing is sometimes as small as an indigo braid threaded through a copper-colored loop. Blue and warm brown draw your eye to the connection, where the braid narrows and passes through. A pendant can use the same idea with a curved edge crossing a stone-colored field.',
      'When dressing, try finding one element already in your clothes that connects to either material. A repeat of color or texture gives both pieces a reason to be there.',
    ],
    closing: 'The most interesting part of a combination can be the small place where two things touch.',
    relatedCollection: { slug: 'caravan-colors', name: 'Caravan Colors' },
    relatedProducts: [{ slug: 'caravan-fusion-necklace', name: 'Caravan Fusion Necklace' }],
  },
];

export function getStoryBySlug(slug: string): Story | null {
  return STORIES.find((story) => story.slug === slug) ?? null;
}
