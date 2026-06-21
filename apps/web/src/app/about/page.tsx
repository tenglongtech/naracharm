import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';

/**
 * About 页 - 还原设计稿"关于"
 * 品牌叙事核心页,与 STORY_DOCTRINE 深度联动。
 * 结构: Hero → Our Why → Our Journey (5 文化) → Our Promise (4 pillars) → Stories We Carry → CTA
 */

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Nara Charm was born from a belief that jewelry should carry meaning. Handmade heritage jewelry from Tibet, Thailand, Mongolia, China and the Southwest.',
  openGraph: { title: 'About Nara Charm', description: 'Handmade heritage jewelry with a story in every piece.' },
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
            <LotusMark className="mx-auto h-12 w-12 text-brand" />
            <h1 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
              We believe jewelry<br />should carry <span className="italic text-brand">meaning.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Nara Charm was born from a simple frustration: in a world drowning in
              mass-produced things, it has become hard to find an object that
              truly means something. So we decided to make them.
            </p>
          </div>
        </section>

        {/* Our Why */}
        <section className="mx-auto max-w-3xl px-4 py-16 md:py-20">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-brand">Our Why</p>
          <h2 className="mt-3 text-center font-display text-3xl md:text-4xl">Every Piece Has a Story</h2>
          <div className="mt-8 space-y-5 leading-relaxed text-ink/85 md:text-lg">
            <p>
              We started Nara Charm because we kept finding the same emptiness in
              modern jewelry: beautiful, but hollow. A pendant with no past. A
              bracelet with no maker. Objects designed to be bought, worn briefly,
              and forgotten.
            </p>
            <p>
              But we knew there was another kind of jewelry — the kind that has
              existed for thousands of years across Asia. Jewelry made slowly, by
              hand, by people whose families have practiced the same craft for
              generations. Jewelry that carries the weight of where it came from.
            </p>
            <p>
              So we went looking for those crafts. We found silversmiths in Lhasa
              who have chased the same lotus pattern for thirty years. Weavers in
              northern Thailand still working wooden looms their grandmothers
              used. Miao artisans drawing silver into wire finer than hair. We
              asked them to make for us — slowly, honestly, by hand — and we
              promised to tell their stories.
            </p>
            <p>
              <strong className="text-brand">That is Nara Charm.</strong> Not a
              factory. A bridge — between old crafts and new wearers, between a
              maker on a distant plateau and you.
            </p>
          </div>
        </section>

        {/* Our Journey - 5 文化圆标 */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-brand">Our Journey</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Five Roots, One Brand</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted">
                Every Nara Charm piece grows from at least one of these craft traditions —
                and sometimes, beautifully, from several at once.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {ROOTS.map((r) => (
                <div key={r.name} className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-bg text-3xl">
                    {r.icon}
                  </div>
                  <h3 className="mt-4 font-display text-lg">{r.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-gold">{r.place}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.craft}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Promise - 4 pillars */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Our Promise</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">What We Stand For</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="text-center">
                <div className="text-4xl">{p.icon}</div>
                <h3 className="mt-3 font-display text-lg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stories We Carry - 数据里程碑 */}
        <section className="bg-ink text-bg">
          <div className="mx-auto max-w-5xl px-4 py-16 md:py-20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Stories We Carry</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">By the Numbers</h2>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-4xl text-gold md:text-5xl">{s.value}</div>
                  <div className="mt-2 text-sm text-bg/70">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-xs text-bg/40">
              Numbers as of 2026 · Growing, slowly, by hand.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <LotusMark className="mx-auto h-10 w-10 text-brand" />
          <h2 className="mt-5 font-display text-3xl md:text-5xl">Begin Your Own Story</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Every Nara Charm piece comes with a story card, ready to be passed on.
            Find the one whose story belongs to you.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/collections"
              className="rounded-md bg-brand px-8 py-4 text-sm font-medium tracking-wide text-bg transition-transform hover:-translate-y-0.5"
            >
              SHOP COLLECTIONS
            </Link>
            <Link
              href="/stories"
              className="rounded-md border border-ink px-8 py-4 text-sm font-medium tracking-wide transition-colors hover:bg-ink hover:text-bg"
            >
              READ THE STORIES
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

// ─── 数据 (Phase 2 部分移至 CMS) ─────────────────────────────────────────
// 五条文化根,与 STORY_DOCTRINE 的 Five Roots 对应
const ROOTS = [
  { icon: '🏔️', name: 'Tibetan', place: 'The Plateau', craft: 'Hand-chased silver, turquoise, the oldest symbols of purity.' },
  { icon: '🐎', name: 'Mongolian', place: 'The Steppe', craft: 'Braided cords, endless knots, blessings for the road.' },
  { icon: '🌿', name: 'Miao', place: 'The Southwest', craft: 'Silver filigree finer than hair, drawn over thirty years.' },
  { icon: '🌊', name: 'Thai', place: 'The Tropics', craft: 'Hand-loomed silk, the color of rivers at dusk.' },
  { icon: '📜', name: 'Han', place: 'The Middle Kingdom', craft: 'Knotwork, jade, the art of meaningful restraint.' },
];

const PILLARS = [
  { icon: '🤲', title: 'Handmade with Care', desc: 'Every piece made by hand, by artisans paid fairly for their decades of skill.' },
  { icon: '🌍', title: 'Honest Origins', desc: 'We name where each craft comes from. No vague "inspired by." Real places, real people.' },
  { icon: '📖', title: 'Story in Every Piece', desc: 'Each order includes a card telling the craft, the meaning, and the maker behind it.' },
  { icon: '♻️', title: 'Made to Last', desc: 'We make slowly, in small batches, so what you wear outlives trends — and us.' },
];

const STATS = [
  { value: '40+', label: 'Artisan partners' },
  { value: '5', label: 'Craft traditions' },
  { value: '12k+', label: 'Stories carried' },
  { value: '30+', label: 'Countries shipped' },
];
