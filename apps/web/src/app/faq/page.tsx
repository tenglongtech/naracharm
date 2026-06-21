import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

/** /faq - 常见问题 */
export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about Nara Charm — shipping, returns, materials, sizing and more.',
};

export default function FaqPage() {
  return (
    <LegalPage
      title="Frequently Asked Questions"
      intro="Everything you might want to know. Can't find your answer? Email hello@naracharm.com."
      sections={[
        {
          heading: 'Orders & Shipping',
          body: [
            'How long until my order ships? — Each piece is handmade, so please allow 1–3 business days for crafting, then 7–15 business days for delivery.',
            'Do you ship worldwide? — Yes, we ship globally. Free standard shipping on orders over $120.',
            'How do I track my order? — A tracking number is emailed once your order ships. You can also view it in My Account → Orders.',
          ],
        },
        {
          heading: 'Returns & Exchanges',
          body: [
            'What is your return policy? — 30 days from delivery for unworn items. See our Returns page for full details.',
            'Can I exchange for a different size? — Yes. The fastest way is to return for a refund and place a new order.',
            'My item arrived damaged — Contact us within 7 days with a photo for a free replacement or full refund.',
          ],
        },
        {
          heading: 'Products & Materials',
          body: [
            'Are your pieces really handmade? — Yes. Every piece is crafted by hand by skilled artisans. Slight variations are natural and part of what makes each unique.',
            'What materials do you use? — Natural stones (agate, turquoise), sterling silver, brass, Thai silk, waxed cord. Materials are listed on each product page.',
            'Are your earrings hypoallergenic? — Our silver-post earrings are low-allergy. Check each product page for specifics.',
            'How do I care for my jewelry? — Avoid water and perfume on silver; store in an airtight bag. Full care notes are on every product page.',
          ],
        },
        {
          heading: 'Sizing',
          body: [
            'How do I choose a bracelet size? — Measure your wrist snugly and add 1–1.5cm. See our Size Guide for details.',
            'What necklace length should I pick? — 16in sits at the collarbone, 18in at the chest, 20in lower. See the Size Guide for a visual.',
          ],
        },
        {
          heading: 'Account & Payment',
          body: [
            'Do I need an account to order? — No, you can check out as a guest. An account lets you track orders and save favorites.',
            'What payment methods do you accept? — Credit/debit cards, Apple Pay, Google Pay, and PayPal, all processed securely by Stripe.',
          ],
        },
      ]}
    />
  );
}
