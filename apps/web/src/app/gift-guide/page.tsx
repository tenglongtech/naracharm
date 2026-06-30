import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { ProductTile, type ProductCard } from '@/components/product-tile';
import { getActiveProducts } from '@/lib/storefront';

export const metadata: Metadata = {
  title: 'Gift Guide — A Charm for Every Occasion',
  description:
    'Find the perfect handmade charm for her, for him, for milestones, for yourself. Curated Nara Charm gift ideas for Mother\'s Day, Valentine\'s Day, birthdays, thank-yous, and quiet self-care.',
  alternates: { canonical: '/gift-guide' },
  openGraph: {
    title: 'Gift Guide — A Charm for Every Occasion | Nara Charm',
    description: 'Curated handmade jewelry gifts for every occasion. Story card and blessing pouch included with every order.',
    url: '/gift-guide',
    type: 'website',
  },
};

const OCCASIONS = [
  {
    icon: '💝',
    title: "For Her",
    pitch: 'The person who doesn\'t need anything but deserves something.',
    picks: ['tibetan-amulet-925-bracelet', 'miao-filigree-drop-earrings', 'han-jade-lotus-pendant'],
  },
  {
    icon: '🌸',
    title: "Mother's Day",
    pitch: 'A piece she can wear every day — and tell the story of, every time someone asks.',
    picks: ['rose-quartz-tenderness-bracelet', 'amethyst-calm-bracelet', 'han-jade-lotus-pendant'],
  },
  {
    icon: '💌',
    title: "Valentine's Day",
    pitch: 'Not a heart-shaped box. Something she can wear past February.',
    picks: ['rose-quartz-tenderness-bracelet', 'mongolian-road-knot-cord', 'tai-silk-cord-phone-charm'],
  },
  {
    icon: '🎂',
    title: 'Birthdays',
    pitch: 'Pick her birth-stone meaning, or just the one that caught your eye.',
    picks: ['amethyst-calm-bracelet', 'obsidian-guardian-charm', 'caravan-fusion-necklace'],
  },
  {
    icon: '🎓',
    title: 'Graduation & New Beginnings',
    pitch: 'A Hada knot for the road ahead — and the home they\'re leaving behind.',
    picks: ['hadas-knot-red-cord', 'mongolian-road-knot-cord', 'han-jade-lotus-pendant'],
  },
  {
    icon: '🙏',
    title: 'Thank You',
    pitch: 'When "thank you" needs to be something they can hold.',
    picks: ['rose-quartz-tenderness-bracelet', 'tai-silk-cord-phone-charm', 'hadas-knot-red-cord'],
  },
  {
    icon: '👯',
    title: 'Bridesmaids',
    pitch: 'Six of the same, or six of different — your call.',
    picks: ['tai-silk-cord-phone-charm', 'hadas-knot-red-cord', 'obsidian-guardian-charm', 'miao-filigree-drop-earrings'],
  },
  {
    icon: '🌿',
    title: 'For Yourself',
    pitch: 'The most important gift. Read the stories, pick the one that calls.',
    picks: ['caravan-fusion-necklace', 'han-jade-lotus-pendant', 'amethyst-calm-bracelet'],
  },
];

const BY_BUDGET = [
  {
    range: 'Under $40',
    picks: ['obsidian-guardian-charm', 'tai-silk-cord-phone-charm', 'hadas-knot-red-cord'],
    note: 'Phone charms and small cord bracelets — perfect for stocking stuffers or a small thank-you.',
  },
  {
    range: '$40 – $80',
    picks: ['mongolian-road-knot-cord', 'amethyst-calm-bracelet', 'rose-quartz-tenderness-bracelet', 'miao-filigree-drop-earrings'],
    note: 'The sweet spot. Crystal bracelets, the Miao earrings, a few meaningful pieces.',
  },
  {
    range: '$80 +',
    picks: ['han-jade-lotus-pendant', 'caravan-fusion-necklace'],
    note: 'Statement pieces — the jade pendant, the fusion necklace. The ones you give for the milestone that matters.',
  },
];

export default async function GiftGuidePage() {
  const allProducts = await getActiveProducts();

  // 拼装 product cards
  const toCard = (slug: string): ProductCard | null => {
    const p = allProducts.find((x) => x.slug === slug);
    if (!p) return null;
    return {
      slug: p.slug,
      name: p.name,
      heritage: p.heritage ?? 'Handmade',
      price: `$${(p.basePriceCents / 100).toFixed(0)}`,
      compareAt: p.compareAtPriceCents ? `$${(p.compareAtPriceCents / 100).toFixed(0)}` : null,
      tag: p.compareAtPriceCents ? 'Sale' : p.isFeatured ? 'Featured' : null,
      image: p.primaryImage ?? undefined,
    };
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gift Guide',
    description: 'Curated handmade jewelry gifts for every occasion.',
    url: `${siteUrl}/gift-guide`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <SiteHeader />
      <main id="main">
        <section className="border-b border-border bg-ink text-bg">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Made for your journey</p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
              A gift that tells a story
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-bg/80">
              Every order arrives in a keepsake box with a handwritten story card and a
              blessing pouch. Ready to give — or to keep.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumb items={[{ label: 'Gift Guide' }]} />
        </div>

        {/* What's included */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="text-center font-display text-2xl md:text-3xl">
              What arrives in every box
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[
                { i: '✦', t: 'Keepsake box', d: 'A small kraft box stamped with the Nara Charm lotus — keepsake, not trash.' },
                { i: '✎', t: 'Handwritten story card', d: 'The four-layer story of the piece — origin, craft, meaning, and how it speaks to you.' },
                { i: '✦', t: 'Blessing pouch', d: 'A small pouch of dried herbs or paper blessings, the way gifts have been given in these cultures for centuries.' },
                { i: '✦', t: 'Care note', d: 'How to clean it, store it, and keep the silver bright. A short card; honest, not preachy.' },
              ].map((b) => (
                <div key={b.t} className="text-center">
                  <div className="text-3xl text-brand">{b.i}</div>
                  <h3 className="mt-2 font-display text-lg">{b.t}</h3>
                  <p className="mt-2 text-sm text-muted">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* By occasion */}
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">By occasion</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Find the moment</h2>
          </div>
          <div className="mt-12 space-y-14">
            {OCCASIONS.map((occ) => {
              const products = occ.picks.map(toCard).filter(Boolean) as ProductCard[];
              if (products.length === 0) return null;
              return (
                <div key={occ.title}>
                  <div className="flex flex-wrap items-end gap-3 border-b border-border pb-4">
                    <span className="text-3xl">{occ.icon}</span>
                    <h3 className="font-display text-2xl md:text-3xl">{occ.title}</h3>
                    <p className="ml-auto max-w-md text-sm text-muted">{occ.pitch}</p>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
                    {products.map((p) => (
                      <ProductTile key={p.slug} product={p} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* By budget */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-brand">By budget</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Whatever the number</h2>
            </div>
            <div className="mt-10 space-y-10">
              {BY_BUDGET.map((b) => {
                const products = b.picks.map(toCard).filter(Boolean) as ProductCard[];
                if (products.length === 0) return null;
                return (
                  <div key={b.range}>
                    <div className="flex items-end justify-between border-b border-border pb-3">
                      <h3 className="font-display text-xl">{b.range}</h3>
                      <p className="text-sm text-muted">{b.note}</p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4 lg:gap-6">
                      {products.map((p) => (
                        <ProductTile key={p.slug} product={p} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-ink text-bg">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center md:py-20">
            <h2 className="font-display text-3xl md:text-4xl">Still looking?</h2>
            <p className="mx-auto mt-4 max-w-xl text-bg/75">
              Browse the full collection — every piece arrives gift-ready.
            </p>
            <Link
              href="/collections"
              className="mt-7 inline-block rounded-md bg-brand px-7 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              SHOP ALL PIECES
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
