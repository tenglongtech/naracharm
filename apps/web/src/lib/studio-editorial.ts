type DesignArticle = {
  title: string;
  detail: string;
  styling: string;
  guide: string;
};

export const designArticles: Partial<Record<string, DesignArticle>> = {
  'warm-light-pendant': {
    title: 'Warm Light Pendant | Oval Bezel Necklace Design',
    detail: 'The oval is the only warm element in a composition of thin, cool-colored lines. A narrow bezel draws a continuous boundary around the translucent center, so the shape holds against both light cloth and dark knitwear. Look at the boundary in the side view when comparing this idea with a pendant that uses prongs.',
    styling: 'Try the oval just inside an open collar, with enough room for the chain to form a clean V. On cream, the honey color reads softly. On charcoal, the outline and the color of the center become more distinct.',
    guide: 'how-to-compare-pendant-widths',
  },
  'ink-window-drops': {
    title: 'Ink Window Drops | Rectangular Openwork Earring Design',
    detail: 'The weight of the drawing sits in the lower corner, where a curl interrupts four straight edges. Most of the rectangle remains open. That negative space lets hair or fabric become part of the composition as the drop turns.',
    styling: 'Pull hair back on one side to see the entire outline, or try the pair against a solid high collar. A busy print can break up the thin frame. Compare the bottom edge with the collar before choosing a drop length.',
    guide: 'choosing-openwork-earrings',
  },
  'silver-trace-necklace': {
    title: 'Silver Trace Necklace | Layered Arc Pendant Design',
    detail: 'Three shallow arcs overlap to create a single horizontal pendant. The arcs cross at different points, so the thin openings change width across the piece. Viewed as a silhouette, the composition reads as one long line with a slight lift at either end.',
    styling: 'Try the pendant with a boat neck or a low crew neck. Leave a small gap between pendant and seam so the two horizontal lines stay separate. A solid fabric makes the openings easier to see.',
    guide: 'jewelry-for-a-boat-neck',
  },
  'long-horizon-braid': {
    title: 'Long Horizon Braid | Flat Braided Bracelet Design',
    detail: 'The brown braid splits into two lanes and folds into a moss-green center. The change of direction gives the bracelet a recognizable front. A flat braid also puts more of its texture in one plane than a round cord does.',
    styling: 'Wear the fold on the outside of the wrist with rolled denim or a plain sleeve. When pairing it with a watch, check that the widest part of the braid clears the case as your wrist bends.',
    guide: 'how-to-read-a-bracelet-closure',
  },
  'paper-moon-pendant': {
    title: 'Paper Moon Pendant | Layered Crescent Necklace Design',
    detail: 'A pale disc and an offset celadon crescent meet along a narrow curved edge. The change in thickness creates a shadow line that makes the overlap legible. The shape borrows from two sheets of paper that have been shifted just enough to reveal the layer underneath.',
    styling: 'Use a dark knit or washed denim to make the pale disc stand out. If you wear a button-front shirt, hold a paper cutout at the intended chain length to see whether the curve lands above the first closed button.',
    guide: 'how-to-compare-pendant-widths',
  },
  'tea-leaf-pair': {
    title: 'Tea Leaf Pair | Sculptural Leaf Stud Earring Design',
    detail: 'Each leaf curls away from its widest point. A bright edge and a shaded interior suggest a folded surface, while the mirrored placement makes the pair read as two individual leaves. The silhouette is easiest to judge head-on and from the side.',
    styling: 'Pair the pale green with an oatmeal knit or dark blue shirt. With hair tucked back, try positioning the pointed ends in the same direction as the jawline so the curl remains visible.',
    guide: 'botanical-jewelry-from-shape-to-motif',
  },
  'pale-current-necklace': {
    title: 'Pale Current Necklace | Folded Ribbon Necklace Design',
    detail: 'A broad strip of blue-green ribbon forms the front, narrowing into the cord at both ends. Pale highlights on the folds trace the shape across the collarbone. The visual weight comes from the width and movement of the fabric.',
    styling: 'Use a wide, simple neckline and leave some clear fabric above and below the ribbon. A matte jacket brings out the sheen. Store a ribbon piece flat or in a loose curve to protect its folds.',
    guide: 'how-to-store-textile-jewelry',
  },
  'orchid-ribbon-drops': {
    title: 'Orchid Ribbon Drops | Folded Ribbon Earring Design',
    detail: 'A wine-colored ribbon turns back toward a small cap. The fold exposes a bright outer face and a darker inner face, creating depth with a single color. The cap keeps the widest part of the drop away from the top of the earring.',
    styling: 'Wear the drops with a plain collar so the folded fabric remains visible. If you often wear a scarf, compare the length from the top of the hook to the widest part of the ribbon with the height of the scarf.',
    guide: 'reading-earring-drop-length',
  },
  'slate-gate-bracelet': {
    title: 'Slate Gate Bracelet | Segmented Bracelet Design',
    detail: 'Broad gray segments wrap around a single upright blue-green block. The visible joins create a repeated rhythm, and the vertical accent shows where the composition is intended to face. A side view is useful for comparing a jointed construction with a continuous cuff.',
    styling: 'Use the broad band on its own beside a loose sleeve. If you pair it with a watch, test clearance on the wrist first. A narrow round band makes the segmented outline easier to distinguish than another wide bracelet.',
    guide: 'bracelets-with-a-watch',
  },
  'honey-prism-pendant': {
    title: 'Honey Prism Pendant | Faceted Translucent Pendant Design',
    detail: 'An elongated honey-colored prism has several narrow faces that catch the light at different angles. The flat planes make the highlights more defined than on a rounded drop. Try comparing front light and side light to judge how the outline and internal color read.',
    styling: 'Let the long shape sit inside a simple V-neck or against uninterrupted dark fabric. The pendant has enough vertical emphasis on its own. If layering, use a shorter, finer chain that ends above the prism.',
    guide: 'translucent-vs-opaque-jewelry',
  },
  'open-bloom-drops': {
    title: 'Open Bloom Drops | Openwork Lotus Earring Design',
    detail: 'Three hollow petals share a single upper junction and spread in a shallow fan. The middle petal gives the eye a vertical line, while the angled outer petals keep the silhouette from becoming too symmetrical in profile.',
    styling: 'Tuck hair behind the ear and compare the outline against a dark top and a pale one. The color of the background fills the open petals. Try a lower collar if the outer petals sit near its edge.',
    guide: 'how-to-choose-a-lotus-design',
  },
  'half-light-pendant': {
    title: 'Half-Light Pendant | Folded Petal Necklace Design',
    detail: 'Two curved pink surfaces meet around a narrow, dark opening. The gap defines the center while the curved outer edges suggest a petal turning inward. Viewed from the side, the reading depends on both the depth of the fold and the spacing between the surfaces.',
    styling: 'A plain olive or cream top leaves room for the center opening to register. Place the pendant clear of a raised seam so the edge and the shadow remain visible together.',
    guide: 'what-negative-space-does-in-jewelry',
  },
  'indigo-crossing-bracelet': {
    title: 'Indigo Crossing Bracelet | Woven Bracelet with Oval Loop',
    detail: 'A flat indigo braid passes through a wide copper-colored oval. The fine weave and the smooth outline of the loop stay distinct in the same small area. The large opening also makes the front of the bracelet easy to recognize at a distance.',
    styling: 'Turn the loop outward with a rolled cream or denim sleeve. If you add another bracelet, choose a fine plain band and leave a little space around the oval so the opening stays clear.',
    guide: 'how-to-style-two-textures-of-jewelry',
  },
};

export const seriesEditorial: Record<string, { title: string; summary: string; detail: string; styling: string }> = {
  'studio-edit': { title: 'Minimal Jewelry and Cord Accessories | Studio Edit', summary: 'Compare fine-chain pendants, small openwork earrings and restrained braided cords in the first Nara Charm Studio Edit.', detail: 'The early designs use one detail at a time. An oval center catches light, a flower is drawn with open wire, and a narrow cord frames a single clasp or bead.', styling: 'Start with the scale of a piece you already wear. A fine pendant suits an open collar, and a braided cord can sit below a shirt cuff without repeating the line of a watch.' },
  'ink-silver': { title: 'Openwork Silver-Tone Jewelry Designs | Ink & Silver', summary: 'Explore rectangular openwork earrings, satin studs and layered silver-tone arcs against ink-dark cords.', detail: 'Watch where each design leaves a gap. Ink Window Drops use a large rectangle and a single curl, while Silver Trace keeps its openings long and low. That difference changes which edge you notice first.', styling: 'Try the open shapes against a solid dark collar. With a patterned top, pick a compact satin stud so the earring still has a clear outline.' },
  'steppe-lines': { title: 'Braided Cord Bracelet and Jewelry Designs | Steppe Lines', summary: 'Compare flat braids, stitched wraps and sliding knots in tobacco, rust and moss tones.', detail: 'A fold, stitch or knot interrupts the horizontal line of the braid. Long Horizon moves the interruption into a two-tone crossing, while Saddle Stitch emphasizes the two long edges of the band.', styling: 'Pair a wide wrap with a rolled sleeve and leave room at the wrist. If wearing a watch, compare how the two widths sit when you bend your hand.' },
  'jade-and-paper': { title: 'Celadon Pendants and Leaf Stud Designs | Jade & Paper', summary: 'Compare celadon-colored crescents, sculptural leaf studs and pale stone-colored shapes inspired by folded paper.', detail: 'Pale green is used both as a thin exposed edge and as a broad curved surface. Compare the fine crescent of Paper Moon with the thicker curves of Tea Leaf Pair to see how the same palette changes with the shape.', styling: 'Choose a plain cream backdrop for soft contrast, or a dark collar to make the pale edge easier to see.' },
  'river-silk': { title: 'Ribbon Jewelry and Textile Earring Designs | River Silk', summary: 'Explore sculptural ribbon necklaces, folded textile earrings and two-tone loops with light-catching folds.', detail: 'The collection uses fabric folds as part of the silhouette. Pale Current spreads the fold horizontally across the neckline. Orchid Ribbon Drops turn the fabric inward so each drop has both a dark and a bright face.', styling: 'Leave room around a large ribbon fold. A plain matte top helps its sheen show, and a low collar keeps the edge of a ribbon earring visible.' },
  'plateau-palette': { title: 'Geometric Jewelry in Slate and Teal | Plateau Palette', summary: 'See segmented bracelet designs, curved pendants and slim earrings in slate gray, blue-green and brick red.', detail: 'A small strip of color can direct the eye across a much larger gray shape. Slate Gate uses a vertical blue-green center with repeated segments. Terrace Curve places a short red line along a low horizontal pendant.', styling: 'Try the blue-green accents with slate, navy or off-white. When choosing a bracelet for a coat or knit, compare the widest part with the actual space inside the cuff.' },
  'stone-spectrum': { title: 'Faceted and Translucent Jewelry Designs | Stone Spectrum', summary: 'Compare translucent honey-colored pendants, frosted geometric earrings and matte beaded bracelet designs.', detail: 'The shapes change how they hold light. The Honey Prism has narrow reflective faces. Cloud Seam softens the light across a broad half-disc. Viewed in the same light, the two surfaces give very different impressions of depth.', styling: 'Use side light when comparing clear and frosted surfaces. For day-to-day styling, try a translucent piece against the same light or dark fabric you expect to wear.' },
  'lotus-in-bloom': { title: 'Lotus Motif Jewelry Designs | Lotus in Bloom', summary: 'Compare open lotus petals, folded pink pendants and seed-head details in blush and leaf green.', detail: 'The lotus appears at different stages. Open Bloom draws an open flower with three visible petals. Half-Light folds the shape inward. The small perforated disc on Seed Head Loop reduces the motif to a few points.', styling: 'Let the most recognizable contour sit against an uninterrupted background. With an openwork drop, keep hair or a high collar from interrupting the lower petals.' },
  'caravan-colors': { title: 'Indigo and Terracotta Jewelry Designs | Caravan Colors', summary: 'Explore indigo woven bracelets, terracotta accents, tasseled earrings and intersecting shapes in warm and cool tones.', detail: 'Color sits at the point where different shapes meet. Indigo Crossing puts a warm oval against a broad cool braid, while Meeting Place overlaps a brick-colored bar and a blue-gray circle.', styling: 'Repeat a single color in the outfit, then let the second color stand on its own. Dark blue denim can bring out a small terracotta element without competing with its shape.' },
};
