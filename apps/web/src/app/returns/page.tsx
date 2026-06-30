import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  description: '30-day returns on unworn items. Free replacement for damaged or defective pieces. See our full return policy.',
  alternates: { canonical: '/returns' },
};

/** /returns - 退换货政策 (30 天) */
export default function ReturnsPage() {
  const c = siteConfig.company;
  return (
    <LegalPage
      title="Returns & Exchanges"
      updated="June 2026"
      intro="We want you to love your Nara Charm. If something is not right, we are here to help."
      sections={[
        {
          heading: '30-Day Return Window',
          body: [
            'You may return any unworn, undamaged item within 30 days of delivery for a full refund of the product price.',
            'Original shipping charges are non-refundable, except in the case of a defect or our error.',
          ],
        },
        {
          heading: 'How to Start a Return',
          body: [
            `Email ${c.contactEmail} with your order number and the reason for return.`,
            `We will reply with a return address (${c.returnAddress}) and instructions. Return shipping is paid by the customer, unless the item is defective or we made a mistake.`,
            'Returns are processed to our warehouse. Once we receive and inspect your item, your refund is issued within 5 business days to the original payment method.',
          ],
        },
        {
          heading: 'Exchanges',
          body: [
            'To exchange for a different size or color, the fastest way is to return the original item for a refund and place a new order.',
            'Contact us if you need help holding stock for an exchange.',
          ],
        },
        {
          heading: 'Damaged or Defective Items',
          body: [
            'If your item arrives damaged or defective, contact us within 7 days with a photo. We will send a free replacement or issue a full refund (including shipping), with no need to return the original.',
          ],
        },
        {
          heading: 'Non-Returnable Items',
          body: [
            'For hygiene reasons, earrings cannot be returned unless defective.',
            'Custom or personalized pieces are final sale.',
          ],
        },
      ]}
    />
  );
}
