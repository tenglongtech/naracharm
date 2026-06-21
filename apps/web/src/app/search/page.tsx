import { ComingSoonPage } from '@/components/coming-soon-page';

/** /search - 搜索 (Phase 2 接 Alglio/Payload search) */
export default function SearchPage() {
  return (
    <ComingSoonPage
      eyebrow="Search"
      title="Find Your Charm"
      description="Search is on its way. In the meantime, browse our collections by tradition or category."
      cta={{ href: '/collections', label: 'Browse Collections' }}
      secondaryCta={{ href: '/best-sellers', label: 'See Best Sellers' }}
    />
  );
}
