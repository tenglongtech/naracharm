import Image from '@/components/storefront-image';
import Link from 'next/link';
import { COLLECTION_DESIGNS, STUDIO_SERIES } from '@/lib/studio-designs';

export function StudioCollectionGrid({ limit, editorial = false }: { limit?: number; editorial?: boolean }) {
  const seriesList = (editorial ? ['jade-and-paper', 'ink-silver'].flatMap((slug) => STUDIO_SERIES.filter((item) => item.slug === slug))
    .concat(STUDIO_SERIES.filter(({ slug }) => slug !== 'jade-and-paper' && slug !== 'ink-silver')) : STUDIO_SERIES).slice(0, limit);
  return (
    <div className={`grid gap-x-6 gap-y-10 sm:grid-cols-2 ${editorial ? 'lg:grid-cols-6 lg:gap-x-9' : 'lg:grid-cols-3'}`}>
      {seriesList.map((series, index) => {
        const lead = COLLECTION_DESIGNS.find((design) => design.collectionSlug === series.slug && design.primaryImage);
        const wide = editorial && index === 0;
        const cover = wide ? '/editorial/studio-campaign.webp' : lead?.primaryImage;
        const layout = editorial ? (index === 0 ? 'lg:col-span-4' : index === 1 ? 'lg:col-span-2 lg:mt-[5vw]' : 'lg:col-span-2') : '';
        return (
          <Link key={series.slug} href={`/collections/${series.slug}`} className={`group min-w-0 ${layout}`}>
            <div className={`relative overflow-hidden bg-surface ${wide ? 'aspect-[4/3] lg:aspect-[1.55]' : 'aspect-square'}`}>
              {cover && lead && <Image src={cover} alt={`${lead.name} design illustration`} fill sizes={wide ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 820px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px'} className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />}
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3 pt-4">
              <h3 className="font-display text-2xl group-hover:text-brand">{series.name}</h3>
              <span aria-hidden="true" className="text-brand">↗</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{series.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
