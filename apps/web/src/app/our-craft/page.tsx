import { ComingSoonPage } from '@/components/coming-soon-page';

/** /our-craft - 工艺页 (Phase 2 接手工过程内容) */
export default function OurCraftPage() {
  return (
    <ComingSoonPage
      eyebrow="Craftsmanship"
      title="How Every Charm Is Made"
      subtitle="From inspiration to your hands, by hand."
      description="Inspired. Hand-selected. Artisan-crafted. Blessed and packed. We are documenting the full journey of how each Nara Charm piece comes to be — coming soon."
      cta={{ href: '/about', label: 'Read Our Story' }}
    />
  );
}
