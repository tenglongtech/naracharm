import { ComingSoonPage } from '@/components/coming-soon-page';

/** /gift-guide - 礼物指南 */
export default function GiftGuidePage() {
  return (
    <ComingSoonPage
      eyebrow="Made for Your Journey"
      title="A Gift That Tells a Story"
      subtitle="Each order arrives ready to give."
      description="A curated guide to finding the perfect charm — for her, for him, for milestones, for yourself. With gift-ready packaging, a handwritten story card, and a blessing pouch included with every order. The full guide is on its way."
      cta={{ href: '/collections', label: 'Shop All Pieces' }}
    />
  );
}
