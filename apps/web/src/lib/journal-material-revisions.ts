import type { BlogArticle } from './blog-data';

type Revision = Omit<BlogArticle, 'author' | 'updatedAt' | 'keywords' | 'readingTime'>;

function revise(article: Revision): BlogArticle {
  const words = article.content.flatMap(({ body }) => body).join(' ').split(/\s+/).length;
  return {
    ...article, author: 'Nara Charm', updatedAt: '2026-11-19', keywords: [],
    readingTime: `${Math.max(2, Math.ceil(words / 190))} min read`,
  };
}

const amethystCare = { title: 'GIA amethyst care and cleaning guide', url: 'https://www.gia.edu/amethyst-care-cleaning' };
const gemCare = { title: 'GIA tips on caring for jewelry', url: 'https://www.gia.edu/gia-news-research-tips-caring-jewelry' };
const treatmentGuide = { title: 'GIA introduction to gem treatments', url: 'https://www.gia.edu/gem-treatment' };
const identificationReports = { title: 'GIA colored stone identification reports', url: 'https://www.gia.edu/gem-lab-service/colored-stone' };
const turquoiseCare = { title: 'GIA turquoise care and cleaning guide', url: 'https://www.gia.edu/turquoise-care-cleaning' };
const lapisCare = { title: 'GIA lapis lazuli care and cleaning', url: 'https://www.gia.edu/lapis-lazuli-care-cleaning' };
const lapisBuying = { title: 'GIA lapis lazuli buyer’s guide', url: 'https://www.gia.edu/lapis-lazuli/buyers-guide' };

export const JOURNAL_MATERIAL_REVISIONS: BlogArticle[] = [
  revise({
    slug: 'beaded-jewelry-care-guide', publishedAt: '2026-06-30', category: 'Care Guide',
    title: 'How to Care for a Beaded Bracelet',
    description: 'Check the knot and bead holes, take an elastic bracelet off without pulling one strand, and recognize when it needs restringing.',
    relatedProducts: ['amethyst-calm-bracelet', 'mongolian-road-knot-cord'],
    relatedArticles: ['checking-elastic-bracelet-wear', 'cleaning-around-a-bead-hole', 'how-to-read-a-bracelet-closure'],
    editorialLink: '/collections/bracelets',
    sources: [gemCare],
    content: [
      { heading: 'Look at the bracelet while it rests', body: [
        'Set the bracelet on a clean, pale cloth with the knot or clasp facing up. Look where the cord enters the beads beside that point. A new gap, loose knot or frayed section gives you a place to inspect more closely.',
        'Compare it with a photo taken when the bracelet was new if you have one. Some designs leave a section of cord visible. A gap that has opened with wear or stays open after the bracelet relaxes is more informative than the gap alone.',
      ] },
      { heading: 'Use the fastening each time', body: [
        'For an elastic loop, ease the whole bracelet over your hand and avoid pulling it from one bead. If it takes a strong stretch every time, compare the fit with a larger loop or a fastening that opens.',
        'For a sliding knot, loosen it before passing the band over your hand. Check for grit or damaged threads if the knot suddenly sticks. Let a jeweler assess it if loosening the loop takes force.',
      ] },
      { heading: 'Keep the parts together if something loosens', body: [
        'If a cord has started to fray or a knot has moved out of its usual position, set the bracelet aside. Collect loose beads and spacers in a small closed pouch and take a photo of their order before bringing them for restringing.',
        'For surface care, support the bracelet as you wipe the exposed beads with a clean, soft cloth. Give each bracelet its own compartment and let a damp cord air-dry flat before storing it.',
      ] },
    ],
  }),
  revise({
    slug: 'cleanse-crystal-jewelry-daily-weekly', publishedAt: '2026-07-18', category: 'Care Guide',
    title: 'A Simple Jewelry Care Routine After Each Wear',
    description: 'Build an everyday routine for wiping, drying and storing stone jewelry, with a periodic check of closures and loose fittings.',
    relatedProducts: [],
    relatedArticles: ['beaded-jewelry-care-guide', 'everyday-jewelry-care-storage', 'jewelry-after-a-rain-shower'],
    editorialLink: '/blog/topic/care',
    sources: [gemCare],
    content: [
      { heading: 'Before you put it on', body: [
        'Apply perfume, sunscreen or lotion before getting dressed and give it time to dry. Check the hook, clasp or loop when you pick up a piece, especially if it was knocked against a bag or cuff the last time you wore it.',
        'If your day includes a swimming pool, a workout or household cleaning, choose a place to leave the jewelry. A small case makes it easier to keep your own pieces together when you remove them away from home.',
      ] },
      { heading: 'Give each piece a place to rest', body: [
        'After wearing, lay pieces on a clean cloth. Wipe away fingerprints with the soft part of the cloth, using light pressure around knots and prongs. Set aside any piece with visible grit or a loose fitting for closer attention.',
        'Once pieces are dry, close fine clasps and keep each necklace or bracelet in its own compartment. Place earring partners together with their backs or hooks so the hardware stays separate from neighboring jewelry.',
      ] },
      { heading: 'Look for small changes on pieces you wear often', body: [
        'Under a window, compare the two earring hooks or the two sides of a clasp. Look for a new gap, a bent finding or thread that no longer lies flat.',
        'If something has changed, take a close photo next to a ruler. A jeweler can use the photo and the original material description to tell which part needs attention.',
      ] },
    ],
  }),
  revise({
    slug: 'how-to-clean-crystal-jewelry-safe-methods', publishedAt: '2026-07-22', category: 'Care Guide',
    title: 'How to Choose a Cleaner for Gemstone Jewelry',
    description: 'Choose a cleaning method for the stone, its treatment and the finished setting. See what to check before using water, solvents, steam or ultrasound.',
    relatedProducts: ['turquoise-sky-bracelet', 'howlite-turquoise-bracelet'],
    relatedArticles: ['complete-crystal-cleansing-guide', 'how-to-tell-if-crystals-are-real', 'turquoise-meaning-protection-stone'],
    editorialLink: '/blog/complete-crystal-cleansing-guide',
    sources: [gemCare, amethystCare, turquoiseCare, treatmentGuide],
    content: [
      { heading: 'Check the material, treatment and assembly', body: [
        'Start with the product specification. Look for the stone name, any dye, coating or treatment, and how the piece is held together. A bead on elastic or a stone fitted into a glued cap has different care needs from a loose gem.',
        'The Mohs scale describes scratch resistance. Water, heat and solvents depend on other properties and on the way the piece is assembled. Keep a copy of the listing and check with the maker when the instructions refer only to the stone.',
      ] },
      { heading: 'Read the instructions for the exact material', body: [
        'GIA lists warm soapy water as a cleaning option for amethyst. Its turquoise guide also permits warm soapy water for turquoise jewelry and advises against steam and ultrasound. A cord, adhesive or nearby treated gem may change the right choice for a finished piece.',
        'Read a dyed howlite listing separately from one for turquoise, even when the beads look similar. GIA recommends keeping dyed gems away from solvents such as alcohol and acetone. Follow the maker’s instructions for care around the cord and other fittings.',
      ] },
      { heading: 'Ask before using a machine or a polishing compound', body: [
        'Leave steam and ultrasonic cleaners to a jeweler who can inspect the type of stone, its treatment and the setting. A loose fitting or a surface treatment changes what the piece can tolerate.',
        'Ask whether a polishing cloth is right for the finish, especially when a dark or plated surface sits next to a stone. When the finish is unclear, gently remove loose dust with a soft, clean cloth before deciding how to proceed.',
      ] },
    ],
  }),
  revise({
    slug: 'summer-jewelry-styling-crystals', publishedAt: '2026-07-20', category: 'Styling',
    title: 'Summer Jewelry Styling with Linen, Stone and Cord',
    description: 'Try simple warm-weather jewelry combinations with linen, open collars and rolled sleeves, then check fit and movement before heading out.',
    relatedProducts: ['turquoise-sky-bracelet', 'rose-quartz-bracelet', 'caravan-fusion-necklace'],
    relatedArticles: ['jewelry-for-linen-shirts', 'summer-solstice-crystal-guide', 'how-to-layer-necklaces-and-bracelets'],
    editorialLink: '/blog/jewelry-for-linen-shirts',
    sources: [gemCare],
    content: [
      { heading: 'Try the color beside the fabric', body: [
        'Lay a blue-green bracelet beside the top you plan to wear. Natural linen can lean gray or golden depending on the weave. Next to cream the stone can look cooler, while a deep charcoal cuff can make the bead outline more noticeable.',
        'For a soft pink bracelet, compare it with the same fabric at a window and under the light where you dress. Repeat pink in one small detail if you want the jewelry to feel connected to the outfit.',
      ] },
      { heading: 'Keep the outline clear at the neckline', body: [
        'Pick the top first and button it where you normally wear it. Hold a pendant at the place you want the detail to sit. Choose a length that leaves a gap above or below a collar seam so the pendant can rest against one fabric.',
        'A narrow cord can keep the focus on the pendant. Check the length again while sitting or leaning over, especially with a loose open collar.',
      ] },
      { heading: 'Try the bracelet with a rolled sleeve', body: [
        'Fasten one bracelet, roll up your sleeve and bend your wrist. A tall focal bead can catch in a loose cuff. If you add a second piece, choose a low profile where the two meet.',
        'Give sunscreen time to dry before putting jewelry on. If you plan to swim or spend time in sand, pack a small pouch so you can take the pieces off and put them away together.',
      ] },
    ],
  }),
  revise({
    slug: 'summer-solstice-crystal-guide', publishedAt: '2026-07-26', category: 'Care Guide',
    title: 'How to Care for Jewelry at the Beach and Pool',
    description: 'Plan for sunscreen, sand, chlorine and damp cords. Find out when to remove jewelry, how to pack it and what to do if it gets wet.',
    relatedProducts: [],
    relatedArticles: ['summer-jewelry-styling-crystals', 'jewelry-after-a-rain-shower', 'cleanse-crystal-jewelry-daily-weekly'],
    editorialLink: '/blog/jewelry-after-a-rain-shower',
    sources: [gemCare, turquoiseCare, amethystCare],
    content: [
      { heading: 'Make room for jewelry you plan to remove', body: [
        'Take pieces off before swimming. Put them into a zipped, padded case with a separate pocket for each loose chain, bead bracelet or pair of earrings. Store the case away from direct sun and wet towels.',
        'Let sunscreen dry before putting pieces on again. Porous gems such as turquoise can be affected by cosmetics, and prolonged intense light can fade some amethyst. A piece you only wear in the evening can stay in its case during the hottest part of the day.',
      ] },
      { heading: 'Check for grit before wiping', body: [
        'Set a piece that got sandy on a clean tray and look around bead holes, wire joins and the clasp. Avoid rubbing sand across the polish. Check with the maker if particles are stuck to a coating or lodged in a tight fitting.',
        'If the piece got wet, blot the surface and lay it flat in shade. Let the cord dry completely before packing it away. For pool water, sticky sunscreen or salt residue, ask about the finished piece before trying a rinse or another cleaner.',
      ] },
      { heading: 'Check the fastening again at home', body: [
        'Look for a section of cord that stayed stretched, a clasp that has become stiff or a new gap near a bead. Set the piece aside if it feels different from the last time you wore it.',
        'Take a close photo of the affected area with the piece resting flat. A photo and the product’s material list help a jeweler assess whether the problem is surface residue or damage to a component.',
      ] },
    ],
  }),
  revise({
    slug: 'lapis-lazuli-meaning', publishedAt: '2026-06-30', category: 'Crystal Meanings',
    title: 'Why Lapis Lazuli Has Gold Flecks',
    description: 'See what makes lapis lazuli look blue with gold flecks or white streaks, and learn what those details can tell you about a finished piece.',
    relatedProducts: [],
    relatedArticles: ['lapis-lazuli-jewelry-complete-guide', 'how-to-tell-if-crystals-are-real', 'gemstone-color-meanings'],
    editorialLink: '/blog/lapis-lazuli-jewelry-complete-guide',
    sources: [lapisBuying],
    content: [
      { heading: 'Look at the blue field first', body: [
        'Lapis lazuli is a rock made of several minerals. Lazurite contributes the blue, pyrite can appear as gold-colored flecks, and calcite can show as pale veins or patches.',
        'Some pieces show an even blue field while others put these details on display. Ask to see the whole piece in ordinary light if you want to know whether a vein runs across the visible face or sits on the back.',
      ] },
      { heading: 'See what the shape does to the pattern', body: [
        'A round bead turns as you move, so a small patch can appear and disappear. A flat pendant holds the pattern in one plane, where a pale line can divide the blue into two visible areas.',
        'For earrings, compare both pieces together. A pair can share its overall color while each drop shows a different amount of pyrite or calcite.',
      ] },
      { heading: 'Read past the appearance', body: [
        'Color and flecks can help you decide what you like. Appearance alone cannot establish material or treatment. Ask how the seller describes the stone and whether a report is available if its identity determines the price.',
      ] },
    ],
  }),
  revise({
    slug: 'lapis-lazuli-jewelry-complete-guide', publishedAt: '2026-07-23', category: 'Materials',
    title: 'How to Buy and Care for Lapis Lazuli Jewelry',
    description: 'Compare lapis lazuli listings, ask about dye and wax treatments, and choose a care routine for the finished pendant, earrings or bracelet.',
    relatedProducts: [],
    relatedArticles: ['lapis-lazuli-meaning', 'how-to-clean-crystal-jewelry-safe-methods', 'how-to-compare-pendant-widths'],
    editorialLink: '/blog/how-to-tell-if-crystals-are-real',
    sources: [lapisBuying, lapisCare, identificationReports],
    content: [
      { heading: 'Compare the piece you will receive', body: [
        'Ask for ordinary-light photos of the finished piece from the front and side. Deep blue, small pyrite flecks and pale calcite can appear in different proportions. The shape and placement matter more to how it will look on you than a shop’s grade name alone.',
        'Ask about dye, wax or other treatments if the description is unclear. If the price depends on material identity, compare an independent report with the piece’s measurements and identifying details.',
      ] },
      { heading: 'Read the setting as well as the stone', body: [
        'For a pendant, check how far the stone sits above the rim and whether the exposed edge could meet a zipper. For earrings, compare the weight per earring and how far the drop hangs below the hook.',
        'If you plan to stack a bracelet, check whether the stone repeatedly touches a harder bead or a watch case. A separate compartment keeps those surfaces from rubbing when you put the pieces away.',
      ] },
      { heading: 'Keep heat, solvents and steam away', body: [
        'GIA notes that some dyes and sealers used on lapis can be affected by heat, alcohol or acetone. It recommends care with warm soapy water for the stone and checking a discreet spot because treatments can vary.',
        'For an assembled necklace or bracelet, ask what is suitable for its cord, metal finish and setting before using a liquid cleaner. Keep steam and ultrasonic cleaners away from lapis jewelry.',
      ] },
    ],
  }),
  revise({
    slug: 'how-to-tell-if-crystals-are-real', publishedAt: '2026-07-26', category: 'Materials',
    title: 'How to Check Gemstone Identification Before Buying Jewelry',
    description: 'Read the material name, treatment disclosures and report before buying gemstone jewelry. Learn what photos and simple home checks can show.',
    relatedProducts: ['howlite-turquoise-bracelet', 'turquoise-sky-bracelet'],
    relatedArticles: ['how-to-read-crystal-properties', 'turquoise-meaning-protection-stone', 'what-jade-tone-means'],
    editorialLink: '/blog/how-to-read-crystal-properties',
    sources: [
      { title: 'GIA introduction to imitation gem materials', url: 'https://www.gia.edu/gem-imitation' },
      treatmentGuide, identificationReports,
    ],
    content: [
      { heading: 'Start with the material name', body: [
        '“Real” might refer to how a gem formed, what material it is or whether it was treated. Ask for the material and any known treatment in writing. A seller can describe a stone as heat treated or dyed and still identify the underlying material.',
        'Compare the names on our [Turquoise-Dyed Howlite Bead Bracelet](/products/howlite-turquoise-bracelet) and [Turquoise Sky Bead Bracelet](/products/turquoise-sky-bracelet). One name specifies howlite and its color treatment. If both shades suit you, compare the item specifications and care notes before choosing.',
      ] },
      { heading: 'Use photos for color, scale and condition', body: [
        'Ask for a front and side photo in ordinary daylight and a close-up of the beads, setting or cord. A picture beside a ruler makes the dimensions easier to compare. Save the description if the exact stone or treatment matters to you.',
        'Temperature, weight, polish and price can overlap across materials. Use them to decide what to ask the seller. Keep finished jewelry away from scratch tests, solvents and soaking while checking a listing.',
      ] },
      { heading: 'Match an identification report to the piece', body: [
        'If the price depends on the stone’s identity, ask for a report from an independent gem laboratory. Check its photo, dimensions or identifying details against the piece you will receive. An identification report can describe the material and report treatments that were detectable during the examination.',
        'Confirm which component the report covers. A report for the center stone may leave the accent beads, cord and metal fittings outside its scope. Check those separately if they affect your choice.',
      ] },
    ],
  }),
  revise({
    slug: 'jade-meaning-stone-of-wisdom', publishedAt: '2026-06-30', category: 'Crystal Meanings',
    title: 'Jade and Jade-Tone Jewelry Guide',
    description: 'Compare jade materials and jade-tone color descriptions, then check the carving, closure and measurements before buying a pendant or bracelet.',
    relatedProducts: ['han-jade-lotus-pendant', 'lotus-jade-bracelet'],
    relatedArticles: ['what-jade-tone-means', 'how-to-tell-if-crystals-are-real', 'how-to-compare-pendant-widths'],
    editorialLink: '/blog/what-jade-tone-means',
    sources: [
      { title: 'GIA description of jade materials', url: 'https://www.gia.edu/jade-description' },
      { title: 'GIA jade buyer’s guide', url: 'https://www.gia.edu/jade/buyers-guide' },
      identificationReports,
    ],
    content: [
      { heading: 'Read the name alongside the color', body: [
        'Jade includes jadeite and nephrite. GIA also includes certain green omphacite under that name. Colors can overlap, and jadeite and nephrite can come in shades other than green. An online photo helps you choose a shade and see a carving.',
        'A jade-tone label describes the appearance. Read the item’s material line and ask about any known treatment if you are buying it for a specific stone. For a piece priced as identified jade, ask which stone was examined and whether a laboratory report accompanies the piece.',
      ] },
      { heading: 'Look at the complete pendant', body: [
        'For a carved shape such as a lotus, ask for a front view to see the petal outline and a side view to check thickness. In a pale or translucent material, the lines of the carving can look different over dark and light clothing.',
        'Compare the [jade-tone lotus pendant](/products/han-jade-lotus-pendant) with the neckline you usually wear. Try the listed cord length with string and check the dimensions of the pendant separately.',
      ] },
      { heading: 'Check the fit around the wrist', body: [
        'A continuous bangle has to pass over the hand, while a bead bracelet may stretch or open. Compare the stated opening or finished wrist range with a piece that already fits.',
        'Check the cord and findings of a bead bracelet separately from the stone description. The cleaning routine should suit every part of the finished piece, including how the beads are threaded.',
      ] },
    ],
  }),
  revise({
    slug: 'amethyst-meaning-healing-properties', publishedAt: '2026-06-30', category: 'Crystal Meanings',
    title: 'Amethyst Jewelry Guide to Color, Cut and Care',
    description: 'Compare pale and deep amethyst, see how beads and facets handle light, and read the details that matter before buying purple quartz jewelry.',
    relatedProducts: ['amethyst-calm-bracelet', 'amethyst-earrings-silver'],
    relatedArticles: ['amethyst-bracelet-benefits', 'clear-quartz-meaning-master-healer', 'fluorite-meaning-healing-properties'],
    editorialLink: '/blog/amethyst-bracelet-benefits',
    sources: [{ title: 'GIA amethyst buyer’s guide', url: 'https://www.gia.edu/amethyst/buyers-guide' }, amethystCare],
    content: [
      { heading: 'Compare the violet in the light you wear it in', body: [
        'Amethyst is purple quartz. At a window, turn the piece from face-on to a slight angle. A dark purple stone can look almost ink-colored indoors and show violet around its edges in daylight. A paler one may stay easy to see over charcoal but look closer to gray over cream.',
        'For a bracelet, ask for a photo of the whole strand against a plain light surface and another against a dark sleeve. Decide whether you prefer a steady color at arm’s length or a visible rhythm of lighter and darker beads.',
      ] },
      { heading: 'A round bead and a facet show depth differently', body: [
        'A polished round bead gives a curved highlight and lets you see changes in color around the hole. A faceted stone breaks the reflection into smaller flashes. Check the outline and depth of an earring from the side, especially when you want it to sit close to the face.',
        'Treat labels such as AAA as part of the seller’s own description. Ask to see the actual piece in ordinary light and request measurements for the stone or beads. A strand selected to match evenly will have a different character from one selected for variation.',
      ] },
      { heading: 'Care for the way the amethyst is set', body: [
        'The stone and the setting share the same care routine. A loose amethyst has different cleaning needs from a bracelet with elastic or glued fittings. Start with a soft dry cloth and follow the maker’s instructions for the complete piece.',
        'Choose a shaded place to store the jewelry. Strong light over a long period can fade some amethyst. Keep separate pieces from rubbing together, especially near exposed edges and earring hooks.',
      ] },
    ],
  }),
  revise({
    slug: 'amethyst-bracelet-benefits', publishedAt: '2026-07-24', category: 'Fit & Buying',
    title: 'How to Choose an Amethyst Bracelet That Fits',
    description: 'Compare bead scale, inside circumference, stretch and adjustable closures before choosing an amethyst bracelet online.',
    relatedProducts: ['amethyst-calm-bracelet', 'amethyst-peace-bracelet'],
    relatedArticles: ['amethyst-meaning-healing-properties', 'how-to-read-bead-size-online', 'checking-elastic-bracelet-wear'],
    editorialLink: '/size-guide',
    content: [
      { heading: 'Read the bracelet size and the bead size separately', body: [
        'Start with a flexible tape around the part of your wrist where you want the bracelet to sit. Measure the inside of a favorite bracelet if you can do so without stretching it. That pair of numbers gives the seller a better reference than a general small or medium label.',
        'An 8 mm bead is about one third of an inch across. Draw an 8 mm circle beside a 6 mm circle and lay a watch or a cuff beside them. The comparison tells you how far the bracelet will stand off the wrist. The inside circumference determines how much room the wrist has inside it.',
      ] },
      { heading: 'Try the movement your day involves', body: [
        'For a stretch bracelet, check how it will pass the widest part of your hand. Put on a comparable bracelet, rest your wrist on a desk and slide a jacket over it. Notice whether any focal bead turns inward or catches at the cuff.',
        'For a sliding knot or clasp, check the finished loop and the range of adjustment. If you plan to wear a watch, set the bracelet just above it or on the other wrist and compare where the beads meet the watch case.',
      ] },
      { heading: 'Ask for the exact comparison you need', body: [
        'Send the seller your wrist measurement and whether you want a close or relaxed fit. Ask for the finished inside circumference, the size of the largest bead and a side view of the closure. If your decision rests on the shade of purple, ask whether the pictured bracelet is the one you will receive.',
      ] },
    ],
  }),
  revise({
    slug: 'clear-quartz-meaning-master-healer', publishedAt: '2026-07-01', category: 'Crystal Meanings',
    title: 'Clear Quartz Jewelry and the Way It Catches Light',
    description: 'Recognize the appearance of rock crystal, compare smooth and faceted clear quartz, and know what a jewelry description can establish.',
    relatedProducts: [],
    relatedArticles: ['translucent-vs-opaque-jewelry', 'amethyst-meaning-healing-properties', 'how-to-read-crystal-properties'],
    editorialLink: '/blog/translucent-vs-opaque-jewelry',
    sources: [{ title: 'GIA on quartz varieties, including rock crystal', url: 'https://4cs.gia.edu/en-us/blog/amethyst-variety-of-quartz/' }, treatmentGuide],
    content: [
      { heading: 'Look at what the background does', body: [
        'Rock crystal is the name for colorless quartz. Place a clear bead against off-white fabric, then above a charcoal sleeve. On the pale background, the material can blend in until an edge catches light. Against a dark background, a polished edge or internal feature can give the bead a sharper outline.',
        'Ask for a side view along with a straight-on photo. A transparent pendant may show the chain, a mounting or the fabric behind it, and that is part of how it will look when worn.',
      ] },
      { heading: 'Choose a surface by the kind of reflection you like', body: [
        'Round polished beads show a smooth highlight that moves around the surface. Small facets create a series of distinct reflections, especially when several beads sit next to a narrow metal spacer. If you prefer a quieter effect, start with one clear pendant on a simple cord.',
        'Inspect the opening of a drilled bead in a close picture. The threading color can show through, and the size of the hole can change the appearance of an otherwise very simple bead.',
      ] },
      { heading: 'Put the material name in writing', body: [
        'Clear quartz, glass and several other materials can look similar in an online image. Read the specification for the material and any surface coating, especially if a listing shows a rainbow-like film. For a piece sold at a premium because of its identity, ask whether an independent report describes that stone.',
      ] },
    ],
  }),
  revise({
    slug: 'moonstone-meaning-intuition-new-beginnings', publishedAt: '2026-07-09', category: 'Crystal Meanings',
    title: 'How to Choose Moonstone Jewelry by Its Sheen and Setting',
    description: 'Learn how moonstone’s sheen moves, what to look for in a video, and why the setting matters when choosing a pendant, earrings or a ring.',
    relatedProducts: [],
    relatedArticles: ['why-jewelry-looks-different-in-photos', 'fluorite-meaning-healing-properties', 'translucent-vs-opaque-jewelry'],
    editorialLink: '/blog/why-jewelry-looks-different-in-photos',
    sources: [
      { title: 'GIA moonstone quality factors', url: 'https://www.gia.edu/moonstone-quality-factor' },
      { title: 'GIA moonstone description and trade names', url: 'https://my.gia.edu/articles/moonstone-description' },
      { title: 'GIA moonstone care and cleaning guide', url: 'https://www.gia.edu/moonstone-care-cleaning' },
    ],
    content: [
      { heading: 'See how far the sheen travels', body: [
        'Moonstone is known for a soft sheen that seems to move under the surface, called adularescence. A single still photo can catch the brightest moment. Ask for a short video with the stone tilted slowly in ordinary light so you can see where the glow travels and when it fades.',
        'For a pendant, look at the moment when the chain hangs as it would on the body. For a pair of earrings, ask to see both fronts moving together. An asymmetrical pair can be a deliberate choice when you know how each stone catches the light.',
      ] },
      { heading: 'Read the underlying color and the trade name', body: [
        'The body of a moonstone can look gray, peach or nearly colorless, while its sheen can look white, silver or blue. A rounded cabochon often makes that movement easy to follow. The same form can look quite different over dark and pale clothing.',
        'Some light-colored labradorite is sold as rainbow moonstone. If the mineral identity matters, ask for the mineral name in addition to the trade name, and request the listing or report for the actual piece.',
      ] },
      { heading: 'Choose a setting for the way you wear jewelry', body: [
        'Moonstone can break along natural planes when struck. Earrings and pendants take fewer knocks than rings for many wearers. On a ring, look at how high the stone sits and how much of its edge is exposed.',
        'Use the maker’s instructions for cleaning the full piece and avoid steam or ultrasonic cleaning. Store it separately from jewelry that may hit or rub its surface.',
      ] },
    ],
  }),
  revise({
    slug: 'fluorite-meaning-healing-properties', publishedAt: '2026-07-15', category: 'Crystal Meanings',
    title: 'Fluorite Colors, Banding and Wear in Jewelry',
    description: 'See how purple and green fluorite can look in beads and pendants, and compare its durability with amethyst before choosing a piece.',
    relatedProducts: [],
    relatedArticles: ['amethyst-meaning-healing-properties', 'natural-variation-in-bead-jewelry', 'complete-crystal-cleansing-guide'],
    editorialLink: '/blog/natural-variation-in-bead-jewelry',
    sources: [
      { title: 'Smithsonian National Museum of Natural History fluorite specimen', url: 'https://naturalhistory.si.edu/explore/collections/geogallery/10002904' },
      amethystCare,
    ],
    content: [
      { heading: 'Look for where the bands fall', body: [
        'Fluorite can be purple, green, blue or nearly colorless, and distinct zones of color are common. A bead cut across a zone may show two colors at once, while another bead from the same material can look nearly uniform. Ask to see a strand lying flat if the balance of colors matters to you.',
        'A view against neutral paper helps establish how much of the green or purple comes from the material itself under that light. A view against clothing is useful when deciding where the color will show the most.',
      ] },
      { heading: 'Consider where the piece will get knocked', body: [
        'Fluorite has a Mohs hardness of 4, compared with 7 for amethyst. That difference matters when the piece meets a desk or other jewelry. A pendant worn away from a zipper can be easier to protect than a wristful of fluorite beside a metal watch.',
        'A scratched specimen and an untouched one can look very similar from across a room. If you are buying an older piece, ask for a close view of edges, bead holes and points of contact. Avoid scratch tests on finished jewelry and confirm the material with the seller.',
      ] },
      { heading: 'Give the surface its own place', body: [
        'A compartment or individual soft pouch keeps a moving pendant away from harder stones with sharp edges. If the stone or its mounting needs more than a gentle surface wipe, ask the maker how the whole piece was assembled before cleaning it.',
      ] },
    ],
  }),
  revise({
    slug: 'complete-crystal-cleansing-guide', publishedAt: '2026-07-10', category: 'Care Guide',
    title: 'How to Clean Stone and Cord Jewelry at Home',
    description: 'Use a gentle dry routine for stone beads, cord and mixed settings, and decide when to ask the maker before using water or a cleaner.',
    relatedProducts: [],
    relatedArticles: ['everyday-jewelry-care-storage', 'cleaning-around-a-bead-hole', 'how-to-store-textile-jewelry'],
    editorialLink: '/blog/cleaning-around-a-bead-hole',
    sources: [gemCare, amethystCare],
    content: [
      { heading: 'Begin with the whole piece', body: [
        'Put the jewelry flat on a light, clean cloth. Check for a thread entering a bead, a glued cap, painted details, elastic or a coated clasp. These are the places where a cleaning method suitable for a loose stone can damage the assembled piece.',
        'If the maker’s instructions cover the exact piece, follow them. When you do not know the material or treatment, use gentle dry care first and keep the product description for future reference.',
      ] },
      { heading: 'Wipe one part at a time', body: [
        'Use a clean soft cloth to lift fingerprints and dust from exposed surfaces. Support the piece so you do not pull against a knot or earring hook. Work around the edge of a focal bead with the corner of the cloth, keeping pressure light near the hole.',
        'Set the piece aside if an accent moves independently, color transfers to the cloth, or fibers separate. Take one photo straight down and one from the side. Show the maker where the change happened before trying to remove additional material.',
      ] },
      { heading: 'Check before adding water', body: [
        'Care instructions for loose amethyst may allow mild soapy water. This can be a poor fit for a threaded or glued piece. Ask whether water is suitable around the cord, finish and setting before dipping or rinsing the jewelry.',
        'Use a clean dry pouch or a lined compartment after care. Keep it away from perfume sprays and from other pieces whose settings can rub. Leave a piece that became damp out in shade until it is fully dry.',
      ] },
    ],
  }),
  revise({
    slug: 'healing-crystals-101-beginners-guide', publishedAt: '2026-06-30', category: 'Fit & Buying',
    title: 'A Buyer’s Guide to Your First Piece of Stone Jewelry',
    description: 'Choose a piece you will enjoy wearing and learn to read the stone name, finish, dimensions and care instructions before you buy.',
    relatedProducts: ['amethyst-calm-bracelet', 'rose-quartz-bracelet', 'howlite-turquoise-bracelet'],
    relatedArticles: ['how-to-read-crystal-properties', 'gemstone-color-meanings', 'complete-crystal-cleansing-guide'],
    editorialLink: '/collections/crystal',
    sources: [treatmentGuide],
    content: [
      { heading: 'Start with the piece you already reach for', body: [
        'If your everyday jewelry is a plain cord bracelet, compare two small stone accents on similar cords. If you wear earrings most days, compare the length and weight with a comfortable pair you already own. A familiar way of wearing the piece makes the new material easier to choose.',
        'Look at a neutral photograph and a picture on the body when both are provided. The first helps establish shade. The second gives you a sense of scale and where the piece falls.',
      ] },
      { heading: 'Read four details on the listing', body: [
        '**Material.** Look for the underlying stone name. A color label can be useful for matching an outfit, then the specifications can tell you what the color is on.',
        '**Finish.** A polished bead catches sharper highlights than a matte one. For a dyed or coated material, ask how the finish should be cleaned and what kind of variation you might receive.',
        '**Size and construction.** Record the finished bracelet size or necklace length, and check the closure. Look for a close view of joins, and ask which item or pair the photograph shows.',
        '**Care.** Keep the maker’s guidance for the finished object. Choose the piece that suits the storage and care habits you actually have.',
      ] },
      { heading: 'Choose the detail you would miss', body: [
        'Compare two candidates side by side. Imagine each without its standout detail, such as the seam in a striped bead or the tucked loop on a pendant. The one whose detail you would miss is a sensible place to start.',
      ] },
    ],
  }),
  revise({
    slug: 'chakra-stones-guide', publishedAt: '2026-06-30', category: 'Symbolism',
    title: 'Reading the Colors in a Chakra-Inspired Bracelet',
    description: 'Understand modern seven-color bracelet layouts, how sellers label the materials, and what to ask about the visual or symbolic intent.',
    relatedProducts: [],
    relatedArticles: ['chakra-jewelry-beginners-guide', 'gemstone-color-meanings', 'how-to-read-stone-treatment-language'],
    editorialLink: '/blog/chakra-jewelry-beginners-guide',
    content: [
      { heading: 'Read the maker’s description of the sequence', body: [
        'Contemporary bracelets sold as chakra-inspired often set a short run of colors into a longer strand of neutral beads. Some use a full loop of contrasting shades. Ask how the maker chose the sequence if the symbolism is important to you or to the recipient.',
        'For a gift, decide whether the wearer would like a color sequence whose meaning is explained or simply a small, readable detail. Choose a second view with the bracelet turned so you can see whether the colored section stays visible on the wrist.',
      ] },
      { heading: 'Follow the material names one by one', body: [
        'A seven-color sequence describes the layout. Ask for the material used in each bead where identity matters. A blue bead can look quite similar in a photo even when the stone, glass or finish differs. Tiny beads may also look darker when grouped tightly.',
        'Look at the quieter beads and the spacers as well. A dark background can make each color easier to distinguish, while a pale background can pull several shades into a gentler gradient.',
      ] },
      { heading: 'Keep personal meaning close to the wearer', body: [
        'If the piece refers to a tradition you practice, ask about the maker’s interpretation and how it is represented. When gifting, a personal note about why you chose the piece can explain more than a generic color chart.',
        'For routine wear, check that the bracelet has the finished length and fastening you prefer. A strand that fits well is more likely to be worn with the meaning its wearer gives it.',
      ] },
    ],
  }),
  revise({
    slug: 'chakra-jewelry-beginners-guide', publishedAt: '2026-07-25', category: 'Styling',
    title: 'How to Wear Chakra-Inspired Jewelry with Everyday Clothes',
    description: 'Style a grouped color sequence, rainbow strand or single colored pendant around your wardrobe and the room you have for jewelry.',
    relatedProducts: [],
    relatedArticles: ['chakra-stones-guide', 'how-to-style-two-textures-of-jewelry', 'how-to-layer-necklaces-and-bracelets'],
    editorialLink: '/blog/chakra-stones-guide',
    content: [
      { heading: 'Give the color group a clean edge', body: [
        'Try a bracelet with a tight group of colored beads against an oatmeal knit or dark denim. Turn the color group slightly toward the outside of your arm. Check that it stays in view while your wrist is resting, then decide whether the sequence has enough room to show beside a watch.',
        'A full strand of mixed colors reads differently from a small grouped accent. Give the full strand a plain sleeve and choose one band or ring with a quiet finish nearby.',
      ] },
      { heading: 'Choose a shape that suits the rest of the outfit', body: [
        'With a patterned shirt, a compact pendant with one small sequence can leave the collar clear. Try a rounded outline with a soft crew neck or a narrow linear shape with an open collar. If two focal pieces seem crowded, move one to a different place, such as a bracelet on the opposite wrist.',
        'Repeat one shade you can already find in the outfit. The echo can be as small as stitching on a bag or the thread running through a sweater.',
      ] },
      { heading: 'Check how the piece sits before wearing it out', body: [
        'Use a mirror at arm’s length. With a pendant, turn and lean as you would while moving around. With a bracelet, slip on a coat and rest your hand on a table. The small fitting checks keep a color combination workable beyond the first photo.',
      ] },
    ],
  }),
  revise({
    slug: 'gemstone-color-meanings', publishedAt: '2026-07-09', category: 'Styling',
    title: 'A Daylight Guide to Jewelry Stone Colors',
    description: 'Compare six stone-color palettes in daylight and choose how much contrast you want against a sleeve, neckline or neighboring piece.',
    relatedProducts: ['amethyst-peace-bracelet', 'rose-quartz-bracelet', 'turquoise-sky-bracelet', 'obsidian-guardian-charm'],
    relatedArticles: ['translucent-vs-opaque-jewelry', 'how-to-read-crystal-properties', 'styling-muted-pink-jewelry'],
    editorialLink: '/collections/crystal',
    content: [
      { heading: 'Compare three backgrounds first', body: [
        'Use off-white paper, a piece of gray fabric and the sleeve or neckline you plan to wear. Walk to a window and look at each from arm’s length. A color that seems subtle in your palm may turn into the strongest detail when it sits against your clothing.',
      ] },
      { heading: 'Purple, pink and warm earth tones', body: [
        '**Violet.** Dark amethyst can look almost black on navy. A pale cuff brings the violet forward, and a narrow silver accent separates two darker shades.',
        '**Pink.** Cloudy pink quartz often reads softly against cream. On slate gray, a pale pink bead can have a more defined edge. Check a front-lit view if you are choosing between warm rose and cool blush.',
        '**Red or amber.** A group of small warm beads can echo rust stitching or brown leather. One broad warm stone makes a more obvious focal point against dark denim.',
      ] },
      { heading: 'Blue-green, charcoal and near-clear', body: [
        '**Blue-green.** Pale shades can stand out against navy, while a muted blue-green looks more distinct beside oatmeal or rust. Confirm the named material separately if it matters to you.',
        '**Charcoal.** Compare a polished black bead and a matte one side by side. The first gives you a moving highlight, while the second may give a continuous gray outline against dark cloth.',
        '**Clear or nearly clear.** Check what shows through the piece. On pale fabric, a bead may appear primarily through its edges. On dark fabric, one fine bright line can be enough to make it visible.',
      ] },
    ],
  }),
  revise({
    slug: 'how-to-read-crystal-properties', publishedAt: '2026-07-21', category: 'Materials',
    title: 'What a Gemstone Listing Can Tell You Before You Buy',
    description: 'Read identity, color, treatments and condition as separate details, and know when to ask for a photo or a report.',
    relatedProducts: ['howlite-turquoise-bracelet', 'amethyst-calm-bracelet'],
    relatedArticles: ['how-to-read-stone-treatment-language', 'what-jade-tone-means', 'healing-crystals-101-beginners-guide'],
    editorialLink: '/blog/how-to-read-stone-treatment-language',
    sources: [
      treatmentGuide,
      { title: 'GIA guide to reading a colored stone identification report', url: 'https://www.gia.edu/dam/jcr%3A7c670ba5-b3d9-42bb-9c0f-9ba5a9e68d63/How%20to%20Read%20a%20GIA%20Identification%20Report.pdf' },
    ],
    content: [
      { heading: 'Read the wording as separate statements', body: [
        'In a name such as turquoise-dyed howlite, howlite names the material and turquoise names the color of the finish. In a line such as jade-tone pendant, you know one color description so far. Look for a component specification if your decision depends on the underlying material.',
        'Read which component the claim applies to. The name of a stone bead, a spacer finish and the material of an earring hook can all be different in the same listing.',
      ] },
      { heading: 'Match your question to the evidence', body: [
        'Ask for a daylight photo to assess shade. Ask for a close view of drill holes and edges to assess condition. For mineral identity and treatments in a mounted stone sold at a premium, ask whether an independent report is available for that specific piece.',
        'If a report is provided, compare the item description, measurements and report number with what the seller is offering. Identification reports may name detectable treatments and whether the material is natural or laboratory-grown.',
      ] },
      { heading: 'Save the care details with the invoice', body: [
        'Keep the material specification and the maker’s care instructions together. If the piece later needs restringing or repair, the next person working on it will have a better starting point than a color name.',
      ] },
    ],
  }),
  revise({
    slug: 'how-to-start-a-crystal-collection', publishedAt: '2026-07-15', category: 'Fit & Buying',
    title: 'Build a Small Stone Jewelry Collection You Will Wear',
    description: 'Start with one piece for everyday wear, add a useful contrast, and keep a record of fit, materials and care as your collection grows.',
    relatedProducts: ['amethyst-calm-bracelet', 'rose-quartz-bracelet', 'obsidian-guard-charm'],
    relatedArticles: ['healing-crystals-101-beginners-guide', 'gemstone-color-meanings', 'how-to-store-bead-bracelets'],
    editorialLink: '/blog/how-to-layer-necklaces-and-bracelets',
    content: [
      { heading: 'Set a purpose for the first piece', body: [
        'Choose one place where jewelry fits your actual week. That might be a slim bracelet beside a coat cuff or an earring pair that sits clear of headphones. Try a similar piece for a day and make a short note about where it catches, swings or feels comfortable.',
        'Give the first piece its own spot in a tray or pouch. If you pick it up often, use its fit and size as references for future pieces.',
      ] },
      { heading: 'Add one kind of contrast', body: [
        'A second bracelet in a quieter color can change how the first looks. A pendant in a related shade changes where the color sits on the body. Decide which change you want before looking at more pieces so the second choice can do something different in your wardrobe.',
        'Put your current pieces beside two outfits. Notice what is missing from the combination. Space for a pendant or a shade that works with a pale sleeve may be more useful than a third version of a favorite bracelet.',
      ] },
      { heading: 'Keep a small record', body: [
        'Write down the stone name as sold, usual light, closure size and the seller’s care instructions. A photo with the piece against neutral fabric gives you a consistent comparison for purchases and repairs later.',
      ] },
    ],
  }),
  revise({
    slug: 'aventurine-meaning-luck-opportunity', publishedAt: '2026-07-19', category: 'Crystal Meanings',
    title: 'Green Aventurine Jewelry and Its Subtle Sparkle',
    description: 'See how small inclusions light up in green aventurine and compare bead size, polish and lighting when choosing a piece.',
    relatedProducts: [],
    relatedArticles: ['gemstone-color-meanings', 'matte-vs-polished-beads', 'what-jade-tone-means'],
    editorialLink: '/blog/matte-vs-polished-beads',
    sources: [{ title: 'GIA on optical effects in phenomenal cabochons', url: 'https://www.gia.edu/gia-news-research/optical-effects-phenomenal-cabochons' }],
    content: [
      { heading: 'Watch for a quiet flash as the bead turns', body: [
        'Green aventurine quartz can contain tiny mica flakes that catch light as the stone moves. Look for a few shifting points within the surface as you tilt it. Under flat light, the same stone can read mainly as a soft green.',
        'A window and a single indoor lamp are useful comparisons. Ask for a video if the effect matters more to you than an even shade. The maker can turn a bead or pendant slowly to show how often it catches the light.',
      ] },
      { heading: 'Look at the shape and finish together', body: [
        'A broad smooth oval gives your eye time to follow the movement. Smaller beads spread that effect around a bracelet, where an individual flash is less visible at a distance. Choose which kind of appearance suits how you wear the piece.',
        'Photographs capture color and reflections. If you are choosing between aventurine quartz and another green material, ask the seller to identify the item and name any coating or color treatment.',
      ] },
      { heading: 'Make the green readable in your wardrobe', body: [
        'Try a pale muted green beside washed denim or dark brown. For more definition against cream, look for a fine dark edge or a spacer with a quieter finish.',
      ] },
    ],
  }),
  revise({
    slug: 'aquamarine-meaning-courage-calm', publishedAt: '2026-07-22', category: 'Crystal Meanings',
    title: 'Choosing Aquamarine Jewelry by Color and Cut',
    description: 'Compare pale blue and greenish-blue aquamarine, check the outline and dimensions, and see how different settings affect the finished look.',
    relatedProducts: [],
    relatedArticles: ['clear-quartz-meaning-master-healer', 'why-jewelry-looks-different-in-photos', 'gemstone-color-meanings'],
    editorialLink: '/blog/why-jewelry-looks-different-in-photos',
    sources: [
      { title: 'GIA aquamarine buyer’s guide', url: 'https://www.gia.edu/aquamarine/buyers-guide' },
      { title: 'GIA aquamarine care and cleaning guide', url: 'https://www.gia.edu/aquamarine-care-cleaning' },
    ],
    content: [
      { heading: 'See the blue against the fabric you wear', body: [
        'Aquamarine is a blue to green-blue form of beryl. A pastel cut stone can look nearly clear against a white shirt, then show its blue more distinctly next to charcoal. Ask for a face-on image on neutral paper and a second one in indirect daylight.',
        'Decide whether you want an understated pale shade or a blue that stays clear at arm’s length. Try the same contrast with a light scarf and a dark sweater before choosing.',
      ] },
      { heading: 'Compare the visible face and the depth', body: [
        'Two cut stones with a similar length can be set at different heights. Read the full dimensions and ask for a side view when a lower profile matters for wearing the piece under a scarf or near a cuff.',
        'A close border can give a pale stone a stronger silhouette. An open setting shows more of the fabric behind it. For a pair of earrings, ask to see both stones together in the same light so you can judge the match.',
      ] },
      { heading: 'Keep the material and care information together', body: [
        'Ask whether any treatment was stated and how the assembled piece should be cleaned. For a stone purchased at a premium, ask about identification and save any report with the invoice.',
      ] },
    ],
  }),
  revise({
    slug: 'crystal-gift-guide-for-every-occasion', publishedAt: '2026-07-28', category: 'Gift Guide',
    title: 'Choosing a Stone Jewelry Gift for a Specific Occasion',
    description: 'Choose stone jewelry by the wearer’s habits and the occasion, with practical checks for fit, delivery and a note that makes the gift personal.',
    relatedProducts: ['rose-quartz-bracelet', 'amethyst-earrings-silver', 'turquoise-sky-bracelet'],
    relatedArticles: ['choose-a-meaningful-jewelry-gift', 'amethyst-bracelet-benefits', 'healing-crystals-101-beginners-guide'],
    editorialLink: '/gift-guide',
    content: [
      { heading: 'Choose for the person you see wearing it', body: [
        'For a birthday, look at one detail the recipient already wears often. A favorite metal, familiar earring length or the muted color of a scarf gives you something more useful to act on than a generic list of stone associations.',
        'For a milestone gift, think of a place, event or object you both remember. A pale green bead may remind you of a shared garden without requiring that the recipient know a traditional meaning for the stone.',
      ] },
      { heading: 'Make the fit easy to check', body: [
        'Compare a bracelet with one the recipient already wears. If the size is a surprise, an adjustable design can give some room, provided you know the range and the fastening. For earrings, confirm whether the person has piercings and choose a familiar type of fitting.',
        'Check the delivery estimate and the return terms before ordering. Leave enough time to confirm fit after the gift is opened if a size could be uncertain.',
      ] },
      { heading: 'Write two short lines', body: [
        'Use one line for the memory you are marking and one for a detail about the piece. A short care note or saved product description gives the recipient something useful to keep with the jewelry.',
      ] },
    ],
  }),
  revise({
    slug: 'red-agate-cinnabar-meaning', publishedAt: '2026-07-01', category: 'Materials',
    title: 'Red Agate, Cinnabar and Cinnabar-Red Jewelry',
    description: 'Read red agate as a stone name, learn where the name cinnabar comes from, and check what cinnabar-red tells you about a jewelry listing.',
    relatedProducts: ['cinnabar-cord-charm'],
    relatedArticles: ['how-to-read-crystal-properties', 'how-to-read-stone-treatment-language', 'gemstone-color-meanings'],
    editorialLink: '/blog/how-to-read-crystal-properties',
    sources: [
      { title: 'GIA on chalcedony and agate', url: 'https://www.gia.edu/gia-news-research/gem-cutters-reveal-beauty-chalcedony' },
      { title: 'Smithsonian National Museum of Asian Art on red pigments', url: 'https://asia.si.edu/explore-art-culture/art-stories/colors/red/' },
    ],
    content: [
      { heading: 'Read the stone and color words separately', body: [
        'Agate is a variety of chalcedony, a form of quartz. Red agate may show different shades or bands from one bead to the next. Some agate is dyed, so ask about any stated treatment and keep the care instructions for the finished piece.',
        'Cinnabar is a mercury sulfide mineral with a history as a red pigment. The same word is often used in modern color descriptions to evoke a deep warm red. When a listing says cinnabar-red, look for a separate statement of what each component is made of.',
      ] },
      { heading: 'Look at the shade in the setting you will use', body: [
        'Compare a warm red bead against a pale cloth and a dark phone case. A dark background often makes the highlight on a polished red bead more distinct. For a cord charm, check whether you want the color concentrated in the beads, the braid or both.',
        'Ask about the attachment, size and materials when comparing two similarly colored pieces. For the Nara Charm Cinnabar-Red Cord Phone Charm, cinnabar-red names the color. The individual listing describes the piece.',
      ] },
    ],
  }),
  revise({
    slug: 'crystal-bracelet-stacking-guide', publishedAt: '2026-07-14', category: 'Styling',
    title: 'How to Stack Stone Bracelets That Feel Comfortable',
    description: 'Build a two- or three-bracelet stack by checking bead scale, contact points and the room beneath a cuff.',
    relatedProducts: ['amethyst-calm-bracelet', 'rose-quartz-bracelet', 'turquoise-sky-bracelet'],
    relatedArticles: ['amethyst-bracelet-benefits', 'how-to-read-bead-size-online', 'how-to-style-two-textures-of-jewelry'],
    editorialLink: '/blog/amethyst-bracelet-benefits',
    content: [
      { heading: 'Start with the piece whose shape you want to see', body: [
        'Put on one bracelet with a distinctive center, such as a single bead that is wider than the others. Add a slim cord on the side where it leaves the detail visible. Look at the two with the wrist resting, then move your hand to see whether one band rides over the other.',
        'For more color, try a smaller strand in a shade already present in the center piece or sleeve. A pale rose strand beside a purple bracelet reads as two distinct lines when the bead sizes differ slightly.',
      ] },
      { heading: 'Test the places where the stack makes contact', body: [
        'Rest the wrist on a desk, turn a doorknob and slide on a cuff. Notice whether the stack pushes a wide spacer into the wrist or catches a sleeve at a knot. Try removing one band and moving it to the opposite wrist if you want more room.',
        'Put any metal watch on first. Where it touches the jewelry, check for a raised finding or edge that can rub. A plain textile band can provide visual separation when there is still room at that point.',
      ] },
    ],
  }),
  revise({
    slug: 'selenite-meaning-purification-stone', publishedAt: '2026-07-15', category: 'Crystal Meanings',
    title: 'What Selenite Looks Like and Why It Scratches Easily',
    description: 'Identify selenite as a form of gypsum, compare its gentle transparency with quartz and give this soft mineral a suitable place in a collection.',
    relatedProducts: [],
    relatedArticles: ['clear-quartz-meaning-master-healer', 'fluorite-meaning-healing-properties', 'complete-crystal-cleansing-guide'],
    editorialLink: '/blog/complete-crystal-cleansing-guide',
    sources: [
      { title: 'National Park Service on selenite and gypsum', url: 'https://www.nps.gov/care/planyourvisit/cathedralvalley.htm' },
      { title: 'National Park Service Mohs hardness scale', url: 'https://www.nps.gov/articles/mohs-hardness-scale.htm' },
    ],
    content: [
      { heading: 'Read the name before comparing a pale stone', body: [
        'Selenite is a crystalline form of gypsum. A thin sample can look clear, while a thicker piece can show a softly layered appearance. Clear quartz gives a different effect when it is cut and polished, even if both materials appear nearly colorless in a photograph.',
        'Some shop labels use names based on appearance. If the identity is important, ask whether the seller means selenite gypsum and which parts of the item are made of it.',
      ] },
      { heading: 'Choose a place with little contact', body: [
        'Gypsum is 2 on the Mohs scale, while quartz is 7. Store a selenite specimen in its own lined space. Loose harder beads, rings and abrasive grit can mark the surface as they slide against it.',
        'For a piece set into jewelry, ask the maker about normal wear and care for the exact construction. If you mainly want a pale transparent detail for frequent wear, compare it with a sturdier mineral whose care fits how you use jewelry.',
      ] },
    ],
  }),
];

function archive(slug: string, publishedAt: string, description: string, editorialLink?: string): BlogArticle {
  return revise({
    slug, publishedAt, category: 'Crystal Meanings', publication: 'archived',
    title: 'Archived jewelry guide', description, editorialLink, content: [], relatedProducts: [],
  });
}

export const ARCHIVED_WELLNESS_GUIDES = [
  archive('best-crystals-for-anxiety', '2026-07-01', 'The Nara Journal covers jewelry design, materials and everyday care.'),
  archive('crystal-healing-for-beginners-5-practices', '2026-07-08', 'Explore our current guide to choosing a first piece of stone jewelry and reading its material description.', '/blog/healing-crystals-101-beginners-guide'),
  archive('amethyst-for-sleep-guide', '2026-07-27', 'The current amethyst guide covers the stone’s color, settings and jewelry care.', '/blog/amethyst-meaning-healing-properties'),
];
