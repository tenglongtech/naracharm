import type { BlogArticle } from './blog-data';
export function editorialArt(article: Pick<BlogArticle, 'slug' | 'category'>) {
  const images: Record<string, { src: string; alt: string }> = {
    'how-to-layer-necklaces-and-bracelets': { src: '/editorial/layering.webp', alt: 'Illustration of separated necklaces and bracelets, showing balanced colors and textures' },
    'choose-a-meaningful-jewelry-gift': { src: '/editorial/gifting.webp', alt: 'Illustrative gift scene with a pendant, blank personal note and ribbon; packaging is illustrative' },
    'everyday-jewelry-care-storage': { src: '/editorial/care.webp', alt: 'Illustration of jewelry stored separately beside a dry cloth and linen pouch' },
  };
  return images[article.slug];
}
