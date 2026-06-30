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
};

export const CATEGORIES: Category[] = [
  { slug: 'phone-charms', name: 'Phone Charms', icon: '📱', desc: 'Stone & cord charms', heroSubtitle: 'Small charms that follow you everywhere.' },
  { slug: 'necklaces', name: 'Necklaces', icon: '📿', desc: 'Beaded & pendant', heroSubtitle: 'Worn close, where the heart listens.' },
  { slug: 'bracelets', name: 'Bracelets', icon: '⭕', desc: 'Stretch & cord', heroSubtitle: 'Worn on the wrist, carried on the road.' },
  { slug: 'earrings', name: 'Earrings', icon: '👂', desc: 'Studs & drops', heroSubtitle: 'The smallest pieces, the finest detail.' },
];
