import type { StorefrontCollection, StorefrontProduct } from './storefront';

type Design = [name: string, category: StorefrontProduct['category'], silhouette: string, styling: string];
type StudioSeries = {
  slug: string;
  name: string;
  heritage: string;
  description: string;
  designNotes: string;
  palette: readonly [string, string, string];
  relatedGuide: string;
  designs: Design[];
};

export const STUDIO_SERIES: StudioSeries[] = [
  {
    slug: 'ink-silver', name: 'Ink & Silver', heritage: 'Southwest silverwork studies',
    description: 'Openwork, fine outlines and ink-dark backdrops frame a study in the way silver-colored details catch the light.',
    designNotes: 'The collection takes its visual starting point from coiled wire and the space it leaves around a motif. The shapes here are contemporary studies in line and shadow, designed to sit comfortably with a plain collar, a dark knit or a crisp white shirt.',
    palette: ['#353537', '#a7aba9', '#e4dcd2'],
    relatedGuide: 'choosing-openwork-earrings',
    designs: [
      ['Ink Window Drops', 'earrings', 'A tall open rectangle with a silver-colored curl tucked into its lower corner.', 'Keep the cutout visible against a solid dark top and pull the hair away from the ear.'],
      ['Silver Comma Studs', 'earrings', 'A raised comma with a single rounded end and a satin surface.', 'Wear the curved end toward the jaw for a small point of light in a close crop.'],
      ['Lagoon Wire Pendant', 'necklace', 'A thin oval outline nesting a second, offset oval on a dark cord.', 'Let the two outlines sit against the unbroken fabric of a crew neck.'],
      ['Ash Spiral Bracelet', 'bracelet', 'A compact spiral slider centered on a narrow ash-gray braided band.', 'Leave room around the slider so its profile stays visible when the wrist bends.'],
      ['Lattice Fold Earrings', 'earrings', 'A folded diamond profile with three slim ribs and an open lower edge.', 'The angled bottom suits a square neckline and does well with fewer other lines near the face.'],
      ['Graphite Seed Necklace', 'necklace', 'A softly rounded graphite-colored seed surrounded by a narrow silver-colored frame.', 'An open-collar shirt gives the dark center room to register.'],
      ['Pinstripe Silver Cord', 'bracelet', 'Two dark textile bands divided by a slender light stripe and a single smooth stop.', 'Pair it with a charcoal sleeve and let the center stripe do the work.'],
      ['Wire Bloom Loop', 'phone-charm', 'A short ink-colored loop with an open five-petal end detail.', 'An opaque phone case gives the small petal openings an even backdrop.'],
      ['Pebble Grid Drops', 'earrings', 'Two open squares set at an angle with an off-center gray bead.', 'The moving bead adds a little variation beside straight hair or a simple tailored jacket.'],
      ['Silver Trace Necklace', 'necklace', 'Three overlapping silver-colored arcs make a shallow horizontal pendant.', 'Use the low line of the pendant to echo a wide neckline.'],
    ],
  },
  {
    slug: 'steppe-lines', name: 'Steppe Lines', heritage: 'Mongolian cordwork studies',
    description: 'Flat braids, parallel strands and clay-colored accents evoke the long horizontal lines of open grassland.',
    designNotes: 'These pieces explore what happens when the fastening becomes the interesting part. A tuck, a bar or a crossing strand can interrupt a plain cord without making it difficult to wear with a sleeve.',
    palette: ['#713f33', '#ad8462', '#5c6651'],
    relatedGuide: 'how-to-read-a-bracelet-closure',
    designs: [
      ['Long Horizon Braid', 'bracelet', 'A flat tobacco-colored braid splits into two lanes that turn back into a moss-green fold at the center.', 'Let the crossing face outward beside the cuff of a denim jacket. The two lanes give the turn a clear shadow line without adding a metal center.'],
      ['Saddle Stitch Wrap', 'bracelet', 'A rust-colored wrap with cream-colored edge stitching and a low-profile center.', 'Give the broad silhouette a place of its own on one wrist.'],
      ['North Wind Loop', 'phone-charm', 'A double olive loop with a dark cylindrical end and a pale keeper band.', 'Try it against a matte sand-colored case where the twin strands are easy to see.'],
      ['Dune Traverse Pendant', 'necklace', 'An oblong bar set horizontally across two short lengths of textured cord.', 'A wide scoop neck mirrors the low shape of the bar.'],
      ['Far Field Bracelet', 'bracelet', 'Two khaki strands joined in the center by a vertically placed dark knot.', 'The knot makes a strong center beside a soft, plain sleeve.'],
      ['Ember Hitch Charm', 'phone-charm', 'A short clay-red hitch with one dark faceted bead near the end.', 'Carry it as a color accent alongside a neutral case and a slim wallet.'],
      ['Grassline Hook Drops', 'earrings', 'A pair of thin bars finished with a small green textile fold.', 'Wear with the collar down so the short textile fringe is easy to see.'],
      ['Trail Marker Cord', 'bracelet', 'A forest-toned cord with three widely spaced ivory-colored rings.', 'Keep the rings together along the top of the wrist, away from the edge of a watch.'],
      ['Open Range Necklace', 'necklace', 'A shallow inverted arch under a narrow braid in two earth tones.', 'Wear the arch low enough to clear horizontal seams and collar buttons.'],
      ['Campfire Button Wrap', 'bracelet', 'A burnt-red cord wrap with a round, dark button-shaped focal point.', 'Repeat the round detail with a single simple ring.'],
    ],
  },
  {
    slug: 'jade-and-paper', name: 'Jade & Paper', heritage: 'Han-inspired stone and line studies',
    description: 'Soft green, rice-paper cream and clean silhouettes make space for each design’s smallest detail.',
    designNotes: 'The contrast of pale paper and a green stone-colored shape gives this collection its restraint. Shapes range from a single bead to rounded discs and simple stems. The palette can be worn with linen, washed denim or a dark collar.',
    palette: ['#879985', '#e5dac3', '#565b49'],
    relatedGuide: 'what-jade-tone-means',
    designs: [
      ['Paper Moon Pendant', 'necklace', 'An uneven cream disc sits behind a thin celadon crescent. The offset gives the green edge a narrow shadow and leaves part of the pale disc exposed.', 'Wear it against darker cloth if you want both shapes to be easy to distinguish. The layout comes from one sheet of paper shifting over another, with a curved edge left visible.'],
      ['Rain Rim Studs', 'earrings', 'A narrow green outline surrounding an open, gently irregular oval.', 'Pair with a fine chain when you want the open oval to be the strongest shape.'],
      ['Margin Stone Bracelet', 'bracelet', 'A set of pale beads spaced around a long, rounded green center.', 'Orient the center vertically along the wrist when layering with small beads.'],
      ['Willow Seal Necklace', 'necklace', 'A green rectangle with softened corners and a small offset loop.', 'Try it over a cream knit to emphasize the edges of the seal shape.'],
      ['Rice Paper Loop', 'phone-charm', 'An ivory loop with one oblong leaf-green accent near the base.', 'Use it as a soft shift in color on a clear or white case.'],
      ['Unwritten Line Drops', 'earrings', 'A slim descending line finishing in a single pale green bead.', 'An off-center part makes the drop visible without extra jewelry at the neckline.'],
      ['Pale Garden Cuff', 'bracelet', 'An open low-profile band interrupted by a row of three narrow green segments.', 'The shallow band is a quiet shape next to boxy sleeves.'],
      ['Porcelain Stem Pendant', 'necklace', 'A softly tapered off-white drop intersected by a short green line.', 'Choose a flat background at the neckline so the crossing line remains visible.'],
      ['Quiet Seal Charm', 'phone-charm', 'A compact dark green square suspended from a short two-tone loop.', 'Try it where it can move without brushing the camera opening.'],
      ['Tea Leaf Pair', 'earrings', 'Two curved green forms whose tips point toward the face.', 'A fine plain chain leaves space for the inward bend.'],
    ],
  },
  {
    slug: 'river-silk', name: 'River Silk', heritage: 'Thai textile color studies',
    description: 'Folded ribbon silhouettes, luminous color and fine movement inspire this textile-led collection.',
    designNotes: 'River Silk follows light along the edge of a fold. Satin-like surfaces and small color changes suggest the movement of cloth over water. Textile and hardware choices will be confirmed with the physical samples.',
    palette: ['#396360', '#b2869b', '#d4ae72'],
    relatedGuide: 'how-to-store-textile-jewelry',
    designs: [
      ['Reed Ripple Bracelet', 'bracelet', 'An emerald-toned ribbon folded around a slim cylindrical center.', 'Wear loosely beside a soft fabric sleeve to let the fold catch daylight.'],
      ['Pale Current Necklace', 'necklace', 'A wide gently curved strip, pale blue down one side and deep teal along the other.', 'The color seam shows clearly over a plain white neckline.'],
      ['Silk Bend Loop', 'phone-charm', 'A narrow folded loop with two fine gold-colored stops near its base.', 'The tight fold adds texture to a dark matte case.'],
      ['Orchid Ribbon Drops', 'earrings', 'Short plum ribbon shapes under tiny, simple caps.', 'Pin the hair back so air can move the free ends.'],
      ['Riverglass Cord', 'bracelet', 'A small translucent blue-green oval on a fine gray-green tie.', 'Try it with sleeves in cool gray or ecru rather than a busy print.'],
      ['Lotus Edge Necklace', 'necklace', 'One dusty rose petal outlined by a narrow amber-colored rim.', 'The closed petal reads clearly worn just below an open collar.'],
      ['Rain Fold Charm', 'phone-charm', 'A short teal double fold with a single pearly drop at the end.', 'Pair with a plain case and keep the loose drop away from closing hardware.'],
      ['Dusk Weft Bracelet', 'bracelet', 'A purple band crossed at an angle by a thin golden stripe.', 'Let this be the strongest color in a bracelet stack.'],
      ['Floating Hem Studs', 'earrings', 'A small triangular pleat whose lower edge curls forward.', 'The shallow folds offer detail next to a plain boat neck.'],
      ['Blue Channel Pendant', 'necklace', 'Two soft ribbons converge above a flat, elongated blue focal shape.', 'Center the long shape within a V neckline.'],
    ],
  },
  {
    slug: 'plateau-palette', name: 'Plateau Palette', heritage: 'Tibetan Plateau color studies',
    description: 'Slate, blue-green and deep red meet in pared-back shapes with a strong sense of contrast.',
    designNotes: 'The colors are landscape and studio references. Stone-colored forms alternate with darker outlines and plain cord. Keep the silhouette simple and let a single interruption of blue or red draw the eye.',
    palette: ['#3b716e', '#604244', '#bbb1a1'],
    relatedGuide: 'how-to-choose-turquoise-color-jewelry',
    designs: [
      ['High Lake Pendant', 'necklace', 'A low, blue-green oval with a slim oxidized-looking border.', 'Wear it over charcoal so the color has room to show.'],
      ['Slate Gate Bracelet', 'bracelet', 'Flat gray segments frame a single upright blue-green column.', 'Leave the watch off that wrist to make the central column visible.'],
      ['Ridge Line Drops', 'earrings', 'Two slim angular drops shaded from gray at the top to teal at the tip.', 'A dark solid collar lets the teal ends remain the brightest detail.'],
      ['Cold Sky Loop', 'phone-charm', 'An ash-colored loop with two small turquoise-colored ends of different lengths.', 'Try the asymmetric ends against a simple blue or gray case.'],
      ['Terrace Curve Necklace', 'necklace', 'A shallow curve made from three slate-colored bars and a muted red center.', 'Allow a short gap between the curve and a straight neckline.'],
      ['Pass Marker Cord', 'bracelet', 'Dark red thread wraps a deep gray cord on either side of a pale center.', 'Roll back a sleeve to show the two evenly spaced wraps.'],
      ['Stone Shadow Studs', 'earrings', 'A slightly offset teal dot sits inside each dark circular frame.', 'A matching blue-green detail elsewhere can pick up the tiny center.'],
      ['Snowline Charm', 'phone-charm', 'An off-white elongated tip with a narrow band of red on a black loop.', 'Make the red band visible on an otherwise quiet case.'],
      ['Alpine Notch Bracelet', 'bracelet', 'An elongated flat blue-green segment with a tiny notch near one end.', 'Use it as the wide piece in a two-bracelet stack and keep the second band narrow.'],
      ['Red Valley Pendant', 'necklace', 'A deep wine-colored vertical oval inside a slim slate frame.', 'Pair the darker red with a cream or heather-gray top.'],
    ],
  },
  {
    slug: 'stone-spectrum', name: 'Stone Spectrum', heritage: 'Stone color and surface studies',
    description: 'Translucent color, soft mottling and matte surfaces give familiar bead and pendant shapes a different character.',
    designNotes: 'A cloudy bead catches light differently from a faceted edge. These studies explore how those differences can carry a design. Color names describe the intended palette while material choices await samples.',
    palette: ['#78658b', '#c59a81', '#697864'],
    relatedGuide: 'matte-vs-polished-beads',
    designs: [
      ['Violet Fog Bracelet', 'bracelet', 'Cloudy violet rounds with a single clear, lightly faceted center.', 'Use light-colored sleeves to make the clouding visible.'],
      ['Cinder Facet Drops', 'earrings', 'Short charcoal-colored facets in staggered pairs.', 'A bright top makes the facets easier to see than a black collar.'],
      ['Honey Prism Pendant', 'necklace', 'A warm amber-colored oblong with two sharply cut sides.', 'Leave the lower end free over a simple high neckline.'],
      ['Rosewater Bead Loop', 'phone-charm', 'An off-white loop with three translucent pink beads of graduated size.', 'A muted green case offers a quiet complement to the soft pink.'],
      ['Moss Fleck Bracelet', 'bracelet', 'Mottled green and pale pink rounds laid out in alternating groups.', 'Repeat one of the fleck colors in a small accessory instead of adding another large pattern.'],
      ['Cloud Seam Earrings', 'earrings', 'Milky gray semicircles with a narrow translucent line across each face.', 'Choose an unpatterned scarf so the subtle seam still shows.'],
      ['Marigold Point Necklace', 'necklace', 'A short teardrop with yellow color concentrated near the rounded base.', 'Leave the entire drop visible inside a square neckline.'],
      ['Night Frost Bracelet', 'bracelet', 'Matte dark beads spaced by two clusters of cool semitransparent rounds.', 'A light chain adds relief if you want to stack it without competing colors.'],
      ['Mauve Orbit Charm', 'phone-charm', 'A plum-colored loop made visible through a hollow mauve ring.', 'Keep the ring clear of a pop-out stand or external card holder.'],
      ['Sand Veil Drops', 'earrings', 'Two narrow smoky beige drops with soft bands visible near the ends.', 'A cream or navy top lets the banding show around the lower face.'],
    ],
  },
  {
    slug: 'lotus-in-bloom', name: 'Lotus in Bloom', heritage: 'Lotus motif studies',
    description: 'Petals, seed shapes and open curves look at one familiar flower from several distinct angles.',
    designNotes: 'The source is the plant itself: petals overlap and separate, stems change direction and a seed head outlasts the bloom. The designs leave space for whoever wears them to choose a personal meaning.',
    palette: ['#a97880', '#81545a', '#cab594'],
    relatedGuide: 'how-to-choose-a-lotus-design',
    designs: [
      ['One Petal Studs', 'earrings', 'A single tilted blush shape with a shallow fold in the center.', 'Wear the tips toward each other to keep the silhouette close to the ear.'],
      ['Still Pool Pendant', 'necklace', 'A pale round disc with three fine lines spreading out from its edge.', 'A dark round neckline emphasizes the simple disc.'],
      ['Rising Stem Bracelet', 'bracelet', 'A narrow band interrupted by a gently bent upright line.', 'The thin stem gives a large watch some visual breathing room.'],
      ['Open Bloom Drops', 'earrings', 'Three hollow petals set slightly apart in a fan shape.', 'Turn the open edges toward the face and keep the collar plain.'],
      ['Seed Head Loop', 'phone-charm', 'A moss-colored loop with a button containing five tiny recessed dots.', 'Try it with a simple charcoal case so the dotted detail remains clear.'],
      ['Half-Light Pendant', 'necklace', 'Two curved rose-colored shapes overlap around a narrow crescent of open space.', 'Wear it on a flat cloth background to see the opening from a distance.'],
      ['Lily Pad Cord', 'bracelet', 'A flat olive circle with a single wedge-shaped cutout sits on double cord.', 'Let the cord run beside a narrow metal band for a change of texture.'],
      ['First Bloom Necklace', 'necklace', 'An upward-pointing ivory bud with a double outline in muted rose.', 'An open shirt holds the small upright bud neatly at its center.'],
      ['Petal Edge Loop', 'phone-charm', 'A single pale pink open petal at the end of a short sand-colored strap.', 'Watch how the cutout changes between a solid case and a clear edge.'],
      ['After the Bloom Drops', 'earrings', 'A narrow descending line holds three seed-shaped forms at different angles.', 'The three angles add movement to a simple hairstyle and clean neckline.'],
    ],
  },
  {
    slug: 'caravan-colors', name: 'Caravan Colors', heritage: 'Cross-tradition color and texture studies',
    description: 'Braided lines, color blocking and light metal tones meet in small, adaptable designs.',
    designNotes: 'This collection brings studio forms into conversation through a shared color or surface finish. Ribbons, short cords and fine metal-colored outlines can overlap without each piece having to tell the same story.',
    palette: ['#4e5969', '#ba744f', '#b6a688'],
    relatedGuide: 'how-to-style-two-textures-of-jewelry',
    designs: [
      ['Indigo Crossing Bracelet', 'bracelet', 'A flat deep blue braid passed through a wide copper-colored loop.', 'Keep the crossing at the top of the wrist beside a loose sleeve.'],
      ['Roadlight Pendant', 'necklace', 'A soft amber oval overlaid by an open, tilted silver-colored arc.', 'Leave visible room on either side of the arc with a wide neckline.'],
      ['Market Thread Earrings', 'earrings', 'A pair of small muted rust tassels gathered by dark blue bars.', 'Give the tassels space below the ear and skip a high scarf.'],
      ['Terra Tile Loop', 'phone-charm', 'A short blue loop capped with a small red-brown square and a pale bead.', 'The terra tone looks especially clear against a cool-toned case.'],
      ['Copper Waypoint Cord', 'bracelet', 'A trio of copper-colored bars set in different directions on a cream cord.', 'Wear the bars beside a smooth band to highlight the different angles.'],
      ['Border Stitch Necklace', 'necklace', 'A short horizontal braid with a pale line running just inside its lower edge.', 'Pair with a button-front shirt and leave the uppermost button open.'],
      ['Trade Wind Drops', 'earrings', 'An open brass-colored hook under a slim slate-blue stem.', 'An ink-colored collar emphasizes the curved lower piece.'],
      ['Starlit Relay Bracelet', 'bracelet', 'Small pale points separated by broad gaps on a double dark cord.', 'Group it with a single solid-colored band to retain the spacing.'],
      ['Night Route Charm', 'phone-charm', 'A black and indigo braid with a downward-pointing crescent at its end.', 'The crescent stays legible against a warm off-white or rust case.'],
      ['Meeting Place Pendant', 'necklace', 'A red brown bar and a slate blue ring overlap at one end on a cream cord.', 'A plain top lets the meeting point of the two shapes carry the look.'],
    ],
  },
];

export const STUDIO_COLLECTIONS: StorefrontCollection[] = STUDIO_SERIES.map((series) => ({
  id: series.slug,
  slug: series.slug,
  name: series.name,
  heritage: series.heritage,
  description: series.description,
  isFeatured: false,
  productCount: series.designs.length,
  kind: 'studio',
}));

export const COLLECTION_DESIGNS: StorefrontProduct[] = STUDIO_SERIES.flatMap((series) =>
  series.designs.map(([name, category, description, craftStory]) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const image = `/products/studio/${slug}.webp`;
    return {
      id: `studio-${slug}`,
      slug,
      name,
      subtitle: null,
      description,
      category,
      heritage: series.heritage,
      materials: null,
      basePriceCents: 0,
      compareAtPriceCents: null,
      isFeatured: false,
      craftStory,
      careNotes: null,
      collectionSlug: series.slug,
      collectionName: series.name,
      primaryImage: image,
      images: [image],
      imageKind: 'illustration',
      stock: 0,
      availability: 'preview',
      palette: series.palette,
      seoTitle: `${name} | Studio Design Preview`,
      seoDescription: description,
    };
  }),
);

export function getStudioCover(collectionSlug: string, designs: readonly StorefrontProduct[]) {
  const expected = COLLECTION_DESIGNS.find((design) => design.collectionSlug === collectionSlug)?.slug;
  const lead = designs.find(({ slug, primaryImage }) => slug === expected && primaryImage)
    ?? designs.find(({ primaryImage }) => primaryImage);
  if (!lead?.primaryImage) return undefined;
  const campaign = lead.slug === 'paper-moon-pendant' && lead.imageKind === 'illustration';
  const src = campaign ? '/editorial/studio-campaign.webp' : lead.primaryImage;
  return { lead, campaign, src, alt: `${lead.name}${lead.imageKind === 'illustration' ? ' design illustration' : ''}` };
}
