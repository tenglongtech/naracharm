import { ComingSoonPage } from '@/components/coming-soon-page';

/** /stockists - 线下零售店 */
export default function StockistsPage() {
  return (
    <ComingSoonPage
      eyebrow="Stockists"
      title="Find Us in Store"
      description="We are partnering with select boutiques around the world. Our stockist list will be available here soon. Interested in carrying Nara Charm? Email wholesale@naracharm.com."
      cta={{ href: '/collections', label: 'Shop Online' }}
    />
  );
}
