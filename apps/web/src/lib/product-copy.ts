type ListingCopy = [title: string, description: string, designNote: string];

const copy: Record<string, ListingCopy> = {
  'tibetan-amulet-925-bracelet': ['Tibetan-Inspired Silver Amulet Bracelet',
    'A small silver amulet with a turquoise center rests on a narrow elastic cord.',
    'The dark silver edge gives the turquoise its own space. The effect comes from a small area of blue-green surrounded by a deeper field.'],
  'mongolian-road-knot-cord': ['Mongolian Road Knot Cord Bracelet',
    'A braided waxed cotton cord bracelet with a sliding knot and a small silver end bead.',
    'The braid gives the bracelet an edge you can trace with a fingertip. It sits low against the wrist, with an open length of cord before the small end bead.'],
  'miao-filigree-drop-earrings': ['Miao-Inspired Silver Filigree Drop Earrings',
    'Open flower-shaped earrings with coiled silver lines and sterling silver ear hooks.',
    'Look at the gaps inside the flower. The open shape gives a different silhouette against a dark collar than it does against pale fabric.'],
  'han-jade-lotus-pendant': ['Han Jade-Tone Lotus Pendant Necklace',
    'A small carved jade-tone lotus pendant on waxed cotton cord with a sliding closure.',
    'The small pale lotus leaves space around the neckline. Try it over a flat dark top where the edges of the carved petals show clearly.'],
  'tai-silk-cord-phone-charm': ['Thai Silk Cord Phone Charm with Lotus Detail',
    'A silk cord phone charm with a small silver lotus detail and a slim attachment loop.',
    'The direction of the cord catches the light as the loop turns. A plain phone case leaves enough space for the lotus detail to stand out.'],
  'hadas-knot-red-cord': ['Hada-Inspired Red Cord Bracelet',
    'A red waxed cord bracelet with a silver knot-shaped bead and adjustable sliding closure.',
    'The red braid carries the color around the wrist. The small raised shape at its center gives the bracelet a place to catch light.'],
  'obsidian-guardian-charm': ['Obsidian Guardian Phone Charm',
    'Round black obsidian beads on a dark braided cord with one silver accent.',
    'The bead surface reflects light more strongly than the cord. That difference keeps the all-black design visible without adding a second color.'],
  'caravan-fusion-necklace': ['Caravan Fusion Necklace with Turquoise',
    'A silver and turquoise pendant with fine wire detail on a woven cord.',
    'The pendant brings a solid field of color together with an open wire detail. A simple collar leaves room to see how the two parts meet.'],
  'amethyst-calm-bracelet': ['Amethyst Calm Bracelet with 8 mm Beads',
    'Round purple amethyst beads with small silver accents on an elastic bracelet.',
    'The small interruptions of silver let the violet beads carry most of the color. The round silhouette looks clear next to a narrow plain cord.'],
  'amethyst-peace-bracelet': ['Amethyst Peace Bracelet with Silver Accents',
    'A strand of purple amethyst rounds interrupted by small silver-toned accents.',
    'Clouding and depth of color can vary from bead to bead. Look at how those differences show differently against light and dark clothing.'],
  'strawberry-quartz-bracelet': ['Strawberry Quartz Bead Bracelet',
    'An elastic bracelet with warm pink-red strawberry quartz beads and silver accents.',
    'The color is strongest against an even background. Try it with cream or a muted leaf green if you want the pink-red beads to be the main detail.'],
  'rose-quartz-bracelet': ['Rose Quartz Bracelet with Silver Spacers',
    'Soft pink rose quartz rounds in an elastic bracelet with small silver details.',
    'A strand of round beads gives the pale pink several different places to catch light. Against a dark cuff, the difference between cloudy and clearer beads is easier to see.'],
  'obsidian-guard-charm': ['Obsidian Guard Braided Phone Charm',
    'Black obsidian beads and a silver accent sit on a short, waxed braided cord.',
    'Use the small silver interruption as a way to pick up the edge of a light or gray phone case. Check the connector against the case you use.'],
  'mixed-crystal-bracelet': ['Mixed Crystal Bead Bracelet',
    'A mixed bead bracelet with amethyst, rose quartz and small silver accents.',
    'Violet and pink carry the color across the strand. A single plain bracelet nearby can help keep the mixed beads as the focal point.'],
  'lotus-jade-bracelet': ['Jade-Tone Lotus Bead Bracelet',
    'A jade-green bead bracelet with a silver lotus accent on elastic cord.',
    'The lotus shape interrupts a field of round green beads. Keep it at the top of the wrist if you want to see the raised edges as you move.'],
  'cinnabar-cord-charm': ['Cinnabar-Red Cord Phone Charm',
    'A phone charm of warm red beads, braided cord and a small silver accent.',
    'The cinnabar-red name refers to color. Set the dark red loop against a plain case to bring out the silhouette and the one bright accent.'],
  'turquoise-sky-bracelet': ['Turquoise Sky Bead Bracelet',
    'Blue-green turquoise rounds on an elastic bracelet with silver accents.',
    'Small differences in blue and green stand out when you use a solid fabric as the background. Try it beside dark denim or plain cream.'],
  'amethyst-earrings-silver': ['Amethyst Drop Earrings with Silver Earwires',
    'Deep purple amethyst drops on sterling silver earwires with a small silver detail.',
    'A single narrow drop gives the color a clear shape around the face. Pull back a section of hair on one side to see the outline more clearly.'],
  'citrine-bracelet-abundance': ['Citrine Bracelet with Golden Beads',
    'Round golden citrine beads and silver accents on an elastic cord.',
    'A pale cuff lets the golden shade show without emphasizing the silver details. Compare the color under a window if you are trying to match it to another piece.'],
  'howlite-turquoise-bracelet': ['Turquoise-Dyed Howlite Bead Bracelet',
    'Turquoise-dyed howlite rounds with silver accents on an elastic cord.',
    'The color comes from the finish on the howlite. Use it as a blue-green accent beside a solid blue, ecru or rust-colored sleeve.'],
  'hematite-bracelet-mens': ['Matte Black Hematite Cord Bracelet',
    'Matte charcoal hematite rounds on waxed cord with a small silver accent.',
    'The soft gray highlight along the curved bead surfaces gives the dark loop definition. The one silver accent reflects more light and marks the center.'],
  'unakite-bracelet-balance': ['Green and Pink Unakite Bead Bracelet',
    'Mottled green and pink unakite rounds with silver accents on elastic cord.',
    'The bead pattern has its own rhythm. Pick up one of the two colors in a sleeve or a fine cord and leave room for the mottling to show.'],
};

const careCopy: Record<string, { text: string; previous?: string }> = {
  'tibetan-amulet-925-bracelet': {
    previous: 'Avoid prolonged water contact. Clean with a soft dry cloth. Store away from direct sunlight to preserve turquoise color.',
    text: 'Wipe the amulet with a soft dry cloth. Keep cosmetics away from the stone, and take the bracelet off before swimming. Check the cord near the amulet if the beads begin to separate.',
  },
  'mongolian-road-knot-cord': {
    previous: 'Avoid prolonged water contact. The sliding knot can be retightened by hand if it loosens with wear.',
    text: 'Open the sliding loop before removing the bracelet. Air-dry the braid flat if it gets damp. Set it aside if the cord starts to fray or the end bead moves.',
  },
  'miao-filigree-drop-earrings': {
    previous: 'Avoid perfume and lotions on the metal. Store in the provided pouch to prevent tangling.',
    text: 'Keep sprays away from the earwires and openwork. Lay the pair flat in a separate compartment so the floral wires do not catch on other jewelry.',
  },
  'tai-silk-cord-phone-charm': {
    previous: 'Keep dry. The silk can be refreshed with a light steam if it loses its sheen.',
    text: 'Keep the silk dry and let it air-dry flat if it gets damp. Check the narrow attachment loop where it meets the phone case. Detach the charm if that loop begins to fray.',
  },
  'hadas-knot-red-cord': {
    previous: 'Hand wash gently if needed. Air dry flat. The knot is meant to loosen slightly with wear — re-tie as desired.',
    text: 'Release the sliding knot before taking the bracelet off. If the red cord gets damp, lay it flat on a clean cloth and let it dry separately before storing.',
  },
  'amethyst-peace-bracelet': {
    text: 'Wipe the beads with a soft dry cloth and store them away from prolonged intense light. Keep the silver accents clear of harder pieces in the same drawer.',
  },
  'strawberry-quartz-bracelet': {
    text: 'Ease the loop over the hand without pulling from a single bead. Wipe the beads dry and check the cord near a spacer if a gap stays open.',
  },
  'rose-quartz-bracelet': {
    text: 'Wipe the pink beads and spacers with a clean soft cloth. Store the bracelet relaxed in its own compartment, away from rough metal edges.',
  },
  'obsidian-guard-charm': {
    text: 'Detach the charm before cleaning the case with a liquid cleaner. Wipe the obsidian with a soft cloth and keep the beads away from sharp edges in your pocket.',
  },
  'mixed-crystal-bracelet': {
    text: 'Use a soft dry cloth across the exposed beads. Confirm care for every material before using a liquid cleaner, and store the strand flat so its cord rests without tension.',
  },
  'lotus-jade-bracelet': {
    text: 'Support the lotus accent as you wipe the bead strand. Keep the elastic relaxed in storage and check around the accent if the strand develops a gap.',
  },
  'cinnabar-cord-charm': {
    text: 'Keep the braided loop clear of sprays and cleaners. Let it dry flat if it gets damp, and detach it if the thin connector begins to fray.',
  },
  'turquoise-sky-bracelet': {
    text: 'Apply lotion and perfume before putting the bracelet on. Wipe with a soft dry cloth and ask about the stone treatment and cord before using a liquid cleaner.',
  },
  'amethyst-earrings-silver': {
    text: 'Wipe the drops with a soft cloth and support each earring by the finding as you put it away. Keep the pair in a separate compartment away from prolonged intense light.',
  },
  'citrine-bracelet-abundance': {
    text: 'Wipe fingerprints from the golden beads with a soft cloth. Let the elastic rest in its normal shape and check for a permanent gap beside a spacer.',
  },
  'howlite-turquoise-bracelet': {
    text: 'Keep the dyed howlite away from alcohol, acetone and prolonged direct sunlight. Wipe gently with a soft dry cloth and set the piece aside if color transfers.',
  },
  'hematite-bracelet-mens': {
    text: 'Use a soft dry cloth on the matte beads and avoid abrasive polishing. Give the bracelet its own compartment to keep it from rubbing against metal hardware.',
  },
  'unakite-bracelet-balance': {
    text: 'Support the unakite strand while wiping it with a soft dry cloth. Keep the elastic relaxed in storage and apart from rough beads and clasps.',
  },
};

// Keep the legacy snapshot useful until the merchant edits the product in the admin.
export function getProductCopy({ slug, updatedAt, careNotes }: { slug: string; updatedAt?: string; careNotes?: string | null }) {
  const editorialUpdate = '2026-11-18';
  if (updatedAt && Date.parse(updatedAt) >= Date.parse(`${editorialUpdate}T00:00:00+08:00`)) return undefined;
  const record = copy[slug];
  if (!record) return undefined;
  const [seoTitle, description, craftStory] = record;
  const care = careCopy[slug];
  const revisedCare = care && (!careNotes?.trim() || careNotes === care.previous) ? care.text : undefined;
  return {
    seoTitle, seoDescription: description, description, craftStory,
    ...(revisedCare ? { careNotes: revisedCare, updatedAt: '2026-11-19' } : { updatedAt: editorialUpdate }),
    descriptionSource: 'trained_algorithmic_media' as const,
  };
}
