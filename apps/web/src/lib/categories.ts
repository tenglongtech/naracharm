/**
 * 品类定义 (静态)
 * 用于 collections/[slug] 的品类筛选视图 + collections 总览页的品类入口
 */
export type CategorySlug = 'phone-charms' | 'necklaces' | 'bracelets' | 'earrings';

export type Category = {
  slug: CategorySlug;
  name: string;
  icon: string;
  desc: string;
  heroSubtitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: 'phone-charms',
    name: 'Phone Charms',
    icon: '📱',
    desc: 'Stone & cord charms',
    heroSubtitle: 'Handmade phone charms with natural stones, beads, and protective cords. Beaded wrist straps, crystal phone charms, and ethnic phone lanyards.',
    seoTitle: 'Handmade Phone Charms | Beaded, Crystal & Stone Phone Charms',
    seoDescription: 'Shop handmade phone charms with natural stones, beaded wrist straps, and Tibetan protection cords. Crystal phone charms, evil eye phone lanyards, and boho phone charms. Free shipping over $120.',
    seoKeywords: ['phone charm', 'beaded phone charm', 'phone charm strap', 'crystal phone charm', 'phone lanyard', 'phone wrist strap', 'ethnic phone charm'],
  },
  {
    slug: 'necklaces',
    name: 'Necklaces',
    icon: '📿',
    desc: 'Beaded & pendant',
    heroSubtitle: 'Handmade beaded necklaces, crystal pendants, and Tibetan silver chains. Natural stone necklaces with meaning.',
    seoTitle: 'Handmade Necklaces | Crystal, Beaded & Tibetan Silver Necklaces',
    seoDescription: 'Shop handmade crystal necklaces, beaded stone necklaces, Tibetan silver pendants, and jade necklaces. Natural gemstone necklaces with meaning. Free shipping over $120.',
    seoKeywords: ['crystal necklace', 'beaded necklace', 'tibetan silver necklace', 'jade pendant', 'natural stone necklace', 'gemstone necklace', 'charm necklace'],
  },
  {
    slug: 'bracelets',
    name: 'Bracelets',
    icon: '⭕',
    desc: 'Stretch & cord',
    heroSubtitle: 'Handmade beaded bracelets, natural stone stretch bracelets, and Tibetan protection cords. Healing crystals with meaning.',
    seoTitle: 'Handmade Beaded Bracelets | Crystal, Stone & Tibetan Bracelets',
    seoDescription: 'Shop handmade beaded bracelets, amethyst healing bracelets, rose quartz love bracelets, turquoise protection bracelets, and Tibetan silver cuffs. Natural stone stretch bracelets. Free shipping over $120.',
    seoKeywords: ['beaded bracelet', 'crystal bracelet', 'natural stone bracelet', 'amethyst bracelet', 'rose quartz bracelet', 'turquoise bracelet', 'tibetan bracelet', 'healing bracelet', 'stretch bracelet', 'boho bracelet'],
  },
  {
    slug: 'earrings',
    name: 'Earrings',
    icon: '👂',
    desc: 'Studs & drops',
    heroSubtitle: 'Handmade silver earrings, Miao filigree drops, and natural stone studs. Delicate details with heritage craft.',
    seoTitle: 'Handmade Earrings | Silver, Filigree & Stone Earrings',
    seoDescription: 'Shop handmade silver earrings, Miao filigree drop earrings, natural stone studs, and Tibetan silver earrings. Hypoallergenic, handcrafted. Free shipping over $120.',
    seoKeywords: ['handmade earrings', 'silver earrings', 'filigree earrings', 'stone earrings', 'tibetan earrings', 'boho earrings', 'stud earrings', 'drop earrings'],
  },
];
