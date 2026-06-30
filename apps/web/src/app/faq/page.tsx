import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to common questions about Nara Charm — handmade jewelry shipping, returns, materials, sizing, care, and payment.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ | Nara Charm',
    description: 'Common questions about Nara Charm — shipping, returns, materials, care.',
    url: '/faq',
    type: 'website',
  },
};

// FAQ 数据 — 同时用于页面渲染 + JSON-LD (Google rich result 资格)
const FAQ_DATA: { heading: string; items: { q: string; a: string }[] }[] = [
  {
    heading: 'Orders & Shipping',
    items: [
      { q: 'How long until my order ships?', a: 'Each piece is handmade, so please allow 1–3 business days for crafting, then 7–15 business days for international delivery. We will email you a tracking number as soon as it ships.' },
      { q: 'Do you ship worldwide?', a: 'Yes, we ship globally via 4PX and EMS. Free standard shipping on orders over $120. Below that, shipping is a flat $6.90 to most countries.' },
      { q: 'How do I track my order?', a: 'A tracking number is emailed once your order ships. You can also view it in My Account → Orders.' },
      { q: 'Will I have to pay customs / import duties?', a: 'US orders under $800 are duty-free. EU and UK orders may be charged VAT at import — this is set by your local government and is the buyer\'s responsibility.' },
    ],
  },
  {
    heading: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: '30 days from delivery for unworn items in original packaging. See our Returns page for full details.' },
      { q: 'Can I exchange for a different size?', a: 'Yes. The fastest way is to return for a refund and place a new order. Reach us at support@naracharm.com and we will help.' },
      { q: 'My item arrived damaged', a: 'Contact us within 7 days with a photo. We will send a free replacement or issue a full refund — no need to return the damaged piece.' },
      { q: 'Who pays return shipping?', a: 'For change-of-mind returns, the buyer. For damaged or incorrect items, we cover it.' },
    ],
  },
  {
    heading: 'Products & Materials',
    items: [
      { q: 'Are your pieces really handmade?', a: 'Yes. Every piece is crafted by hand by skilled artisans. Slight variations are natural and part of what makes each unique.' },
      { q: 'What materials do you use?', a: 'Natural stones (amethyst, rose quartz, turquoise, jade, obsidian), 925 sterling silver, brass, Thai silk, hand-braided waxed cotton cord. Materials are listed on each product page.' },
      { q: 'Are your earrings hypoallergenic?', a: 'Our silver-post earrings are low-allergy (sterling silver). Brass pieces may contain nickel — check each product page for specifics.' },
      { q: 'Where do the materials come from?', a: 'Silver is sourced from Tibetan and Miao workshops. Stones are hand-selected from regional suppliers. Silk is hand-woven in northern Thailand.' },
      { q: 'How do I care for my jewelry?', a: 'Avoid water, perfume, and lotions on silver. Store in the provided airtight bag when not wearing. Full care notes are on every product page.' },
    ],
  },
  {
    heading: 'Sizing',
    items: [
      { q: 'How do I choose a bracelet size?', a: 'Measure your wrist snugly with a flexible tape and add 1–1.5cm of ease. See our Size Guide for details and a printable measuring tool.' },
      { q: 'What necklace length should I pick?', a: '16in sits at the collarbone, 18in at the chest, 20in lower. See the Size Guide for a visual.' },
      { q: 'Do phone charms fit all phones?', a: 'Yes — they attach through the small hole at the bottom of the case or directly to the phone body. A silicone loop is included for case-less phones.' },
    ],
  },
  {
    heading: 'Account & Payment',
    items: [
      { q: 'Do I need an account to order?', a: 'No — you can check out as a guest. An account lets you track orders, save favorites, and check out faster next time.' },
      { q: 'What payment methods do you accept?', a: 'Credit/debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and PayPal. All processed securely by Stripe — we never see your card number.' },
      { q: 'Is my payment information safe?', a: 'Yes. All payments are handled by Stripe, which is PCI-DSS Level 1 certified. Nara Charm never stores your card number.' },
    ],
  },
  {
    heading: 'Gifting',
    items: [
      { q: 'Do you offer gift wrapping?', a: 'Every order arrives gift-ready: a kraft keepsake box, a handwritten story card, and a blessing pouch. No extra charge.' },
      { q: 'Can I include a personal message?', a: 'Yes — at checkout, look for "Gift note" and add your message. We handwrite it on a small card and tuck it in the box.' },
      { q: 'Do you offer gift cards?', a: 'Not yet — coming soon. For now, the easiest way to let someone choose is to share a link to a specific product or collection.' },
    ],
  },
];

export default function FaqPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';

  // 拍平所有 Q/A → JSON-LD
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <LegalPage
        title="Frequently Asked Questions"
        intro="Everything you might want to know. Can't find your answer? Email hello@naracharm.com."
        sections={FAQ_DATA.map((s) => ({
          heading: s.heading,
          body: s.items.map((it) => `Q: ${it.q} — A: ${it.a}`),
        }))}
      />
    </>
  );
}
