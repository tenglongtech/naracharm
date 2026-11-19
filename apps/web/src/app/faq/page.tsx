import Link from 'next/link';
import { pageMetadata } from '@/lib/page-metadata';
import { OrderPolicyPage } from '@/components/order-policy-page';
import styles from '@/components/order-policy.module.css';
import { siteConfig } from '@/lib/site-config';
import {
  DAMAGE_REPORT_DAYS, RETURN_WINDOW_DAYS, freeShippingFromLabel, shippingCountryCodes,
  shippingPreparationDays, shippingTransitDays, standardShippingLabel,
} from '@/lib/store-policies';

export const metadata = pageMetadata({
  title: 'FAQ',
  description:
    'Answers to common questions about Nara Charm jewelry, including shipping, returns, materials, sizing, care and payment.',
  path: '/faq',
});

const FAQ_DATA: { heading: string; items: { q: string; a: string; link?: { href: string; label: string } }[] }[] = [
  {
    heading: 'Orders & Shipping',
    items: [
      { q: 'How long until my order ships?', a: 'Allow ' + shippingPreparationDays.min + '–' + shippingPreparationDays.max + ' business days for preparation and typically another ' + shippingTransitDays.min + '–' + shippingTransitDays.max + ' business days in transit. We email tracking details when your order ships.' },
      { q: 'Where can you ship?', a: 'Standard delivery covers ' + shippingCountryCodes.length + ' destinations. Rates are in USD and use your merchandise subtotal before discounts. Standard shipping costs ' + standardShippingLabel + ' below ' + freeShippingFromLabel + ' and is free from ' + freeShippingFromLabel + '.', link: { href: '/shipping#destinations', label: 'See shipping destinations' } },
      { q: 'How do I track my order?', a: siteConfig.customerServicesEnabled
        ? 'A tracking link is emailed once your order ships. For help with a shipment, give support the order number from your confirmation.'
        : 'If your shipping email gives a carrier and tracking number, check the carrier’s tracking page. Include your order number if you contact us for help.',
        link: { href: '/shipping#tracking', label: 'See tracking help' } },
      { q: 'Will I have to pay customs / import duties?', a: 'Duties, import taxes or carrier fees may apply. Check with the customs authority for the shipping destination for current rules.' },
    ],
  },
  {
    heading: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'You can request a return for eligible unworn, undamaged items within ' + RETURN_WINDOW_DAYS + ' days of delivery.', link: { href: '/returns', label: 'See eligibility and exceptions' } },
      { q: 'Can I exchange for a different size?', a: 'You can return an eligible item for a refund and order the other size. Contact us if you need help holding stock.', link: { href: '/returns#exchanges', label: 'See exchange details' } },
      { q: 'What should I do if my item arrives damaged?', a: 'Contact us within ' + DAMAGE_REPORT_DAYS + ' days of delivery and keep a photo of the damage. We can arrange a free replacement or a full refund, including shipping.', link: { href: '/returns#damage', label: 'See damage and return instructions' } },
      { q: 'Who pays return shipping?', a: 'For change-of-mind returns, the buyer. For damaged or incorrect items, we cover it.' },
    ],
  },
  {
    heading: 'Products & Materials',
    items: [
      { q: 'Where can I check the materials in a piece?', a: 'Read the individual product page for the listed materials and finish. Contact us with the product name if you need to confirm the origin, assembly or material of a specific component.' },
      { q: 'How can I check the material of an earring post?', a: 'See the materials listed on the product page. If the post, hook or back material is unclear, contact us with the piece name before ordering.' },
      { q: 'What does design illustration mean?', a: 'An illustration shows the shape or styling of a concept. Check the studio listing for its preview status and the individual shop listing for the materials, dimensions and available product photos.' },
      { q: 'How do I care for my jewelry?', a: 'Start with the care notes for your piece. Remove jewelry before showering or swimming, let cords dry before storage, and store pieces separately so they do not rub against one another.' },
    ],
  },
  {
    heading: 'Sizing',
    items: [
      { q: 'How do I choose a bracelet size?', a: 'Measure where you want the bracelet to sit, then compare your wrist circumference with the product’s stated fit range. Check whether the fastening opens or needs to pass over your hand.' },
      { q: 'What necklace length should I pick?', a: 'Try the listed chain or cord length with a piece of string against the neckline you wear most often. Check pendant dimensions and the extender range separately.' },
      { q: 'How do I check whether a phone charm fits my case?', a: 'Compare the product’s attachment loop with a compatible lanyard opening on your case. Check clearance around the camera and charging port.' },
    ],
  },
  {
    heading: siteConfig.checkoutEnabled ? 'Account & Payment' : 'Product Inquiries',
    items: siteConfig.checkoutEnabled ? [
      { q: 'Do I need an account to order?', a: 'You can check out as a guest. Use an email address you can access to receive your confirmation and shipping updates.' },
      { q: 'What payment methods do you accept?', a: 'Stripe Checkout shows the payment methods available for your order and location.' },
      { q: 'Is my payment information safe?', a: 'Yes. All payments are handled by Stripe, which is PCI-DSS Level 1 certified. Nara Charm never stores your card number.' },
    ] : [
      { q: 'How do I ask about a piece?', a: 'Open the piece and select Inquire about this piece. Include the variant you want and where you would like it delivered.' },
      { q: 'Can I pay on the website?', a: 'Online checkout is paused. Contact us to confirm availability, pricing and delivery.', link: { href: '/contact?topic=product', label: 'Ask about a piece' } },
    ],
  },
  {
    heading: 'Gifting',
    items: [
      { q: 'Can I ask about packaging for a gift?', a: 'Contact us with the piece and occasion before placing your order. We can confirm the available packaging and timing.' },
      { q: 'Can I include a personal message?', a: 'Contact us about a gift message before you place your order so we can confirm your options.' },
      { q: 'How can I let someone choose their own gift?', a: 'Share the Gift Guide or a collection link so the recipient can compare styles, sizes and prices.', link: { href: '/gift-guide', label: 'Browse the Gift Guide' } },
    ],
  },
];

export default function FaqPage() {
  const allItems = FAQ_DATA.flatMap((s) => s.items);
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <OrderPolicyPage
      path="/faq"
      title="Frequently asked questions"
      intro="Answers about sizing, materials, shipping, returns and how to ask about a piece."
      schema={faqJsonLd}
    >
      {FAQ_DATA.map(({ heading, items }) => (
        <section key={heading} className={styles.section}>
          <h2>{heading}</h2>
          <div className={styles.questions}>
            {items.map(({ q, a, link }) => (
              <div key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
                {link && <Link href={link.href} className={styles.contactLink}>{link.label}</Link>}
              </div>
            ))}
          </div>
        </section>
      ))}
      <section className={styles.section}>
        <h2>Still have a question?</h2>
        <Link href="/contact" className={styles.contactLink}>Contact Nara Charm</Link>
      </section>
    </OrderPolicyPage>
  );
}
