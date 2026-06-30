import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';

export const metadata: Metadata = {
  title: 'Our Craft — How Every Charm Is Made',
  description:
    'From the silversmiths of Lhasa to the weavers of northern Thailand — how each Nara Charm piece is inspired, hand-selected, artisan-crafted, and packed with meaning.',
  alternates: { canonical: '/our-craft' },
  openGraph: {
    title: 'Our Craft — How Every Charm Is Made | Nara Charm',
    description: 'Inspired. Hand-selected. Artisan-crafted. Blessed and packed. The full journey of every Nara Charm piece.',
    url: '/our-craft',
    type: 'website',
  },
};

const HERITAGE_ROOTS = [
  {
    name: 'Tibetan Plateau',
    glyph: '🏔️',
    tone: 'expansive, quiet, sacred',
    keywords: ['silver amulets', 'turquoise', 'Hada knots', 'silversmiths of Lhasa'],
    color: 'silver, oxidized black, sky blue, deep red',
    summary:
      'Hammered silver that holds the memory of every strike. Turquoise that Tibetans call "the sky, held still." A Hada knot that is never tied to an end.',
  },
  {
    name: 'Mongolian Steppe',
    glyph: '🐎',
    tone: 'free, untamed, in motion',
    keywords: ['hand-braided cord', 'sliding knots', 'obsidian', 'protective stones'],
    color: 'sky blue, grass green, deep saddle brown, knot red',
    summary:
      'A knot a mother ties for her child before a long journey — one knot for every hundred miles of safe return. Black obsidian, the stone of quiet protection since the Stone Age.',
  },
  {
    name: 'Southwest Filigree',
    glyph: '🌿',
    tone: 'lush, intricate, firelit',
    keywords: ['Miao silver', 'filigree wire', 'wedding silver', 'indigo dye'],
    color: 'bright silver, indigo blue, cinnabar red, fire orange',
    summary:
      'Miao silversmiths draw wire thinner than a hair, then coil it into flowers that tremble when she moves. Three years to master. A lifetime to wear.',
  },
  {
    name: 'Han Jade',
    glyph: '📜',
    tone: 'restrained, quiet, slow',
    keywords: ['jade pendant', 'literati', 'Chinese knot', 'silk cord'],
    color: 'jade green, cinnabar red, ink black, celadon',
    summary:
      'Jade, treasured above gold. Does not speak; warms. Worn close to the skin, it slowly takes the shape of the wearer. The literati called it the most honest stone.',
  },
  {
    name: 'Thai Silk',
    glyph: '🌊',
    tone: 'soft, golden, breathing',
    keywords: ['Thai silk', 'weaving', 'lotus', 'hand-loom'],
    color: 'emerald silk, magenta, lotus pink, gold leaf',
    summary:
      'The loom moves slowly, the way light moves through wet leaves. Each thread catches the sun and holds it — the slow light of the tropics, woven into cord.',
  },
];

const PROCESS = [
  {
    step: '01',
    title: 'Inspired',
    icon: '✦',
    body:
      'Each design begins with a real craft tradition and its story. We travel (when we can) and read (always) — to a silversmith in Lhasa, a weaver in Chiang Mai, a braider in Ulaanbaatar. We learn the meaning first, the technique second.',
  },
  {
    step: '02',
    title: 'Hand-Selected',
    icon: '✦',
    body:
      'Materials are chosen by hand, in person or by trusted partners who know the difference between a turquoise with depth and one that only looks the part. Silver is 925. Silk is real silk. Stones are stones, not plastic.',
  },
  {
    step: '03',
    title: 'Artisan Crafted',
    icon: '✦',
    body:
      'Made slowly, by skilled hands, never on a production line. A filigree coil takes days. A silver amulet takes three. A braided cord is one knot at a time. We pay fairly, we wait patiently, and we never ask for shortcuts.',
  },
  {
    step: '04',
    title: 'Blessed & Packed',
    icon: '✦',
    body:
      'Every order is finished with a handwritten story card and a small blessing pouch — the same way a gift has been given across these cultures for centuries. Outer packaging is plain (for postal safety). Inside, every detail is considered.',
  },
];

const PRINCIPLES = [
  {
    title: 'Honest about origin',
    body: 'We say where each piece comes from, who makes it, and what it is made of. If a detail is unclear, we leave it out instead of inventing it.',
  },
  {
    title: 'Slow over fast',
    body: 'A handmade piece takes longer than a machine one. We accept that, and so do our customers. Most orders ship in 1–3 business days from craft, then 7–15 days by post.',
  },
  {
    title: 'Fair pay, no middlemen skim',
    body: 'We work directly with artisan workshops where we can, and through one trusted partner in each region where we cannot. We pay above market rate and we never haggle on the things that matter.',
  },
  {
    title: 'No exotic / no oriental',
    body: 'We write about these cultures the way we would want our own culture written about: with respect, specificity, and dignity. Every story is reviewed for clichés before it ships.',
  },
];

export default function OurCraftPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';
  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Our Craft — How Every Charm Is Made',
    url: `${siteUrl}/our-craft`,
    description:
      'How Nara Charm pieces are inspired, hand-selected, artisan-crafted, and packed with meaning.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="border-b border-border bg-ink text-bg">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Craftsmanship</p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
              How every charm is made
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-bg/80">
              From a silversmith in Lhasa to a weaver in Chiang Mai to your wrist — a piece
              that has traveled thousands of miles, in hands you can read about, to mean
              something you can carry.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumb items={[{ label: 'Our Craft' }]} />
        </div>

        {/* The 4-step process */}
        <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">From inspiration to your hands</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">The Process</h2>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p) => (
              <li key={p.step} className="rounded-lg border border-border bg-surface p-7">
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl text-brand">{p.step}</span>
                  <span className="text-gold">{p.icon}</span>
                </div>
                <h3 className="mt-4 font-display text-xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* The 5 roots */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-brand">The Five Roots</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Where every story grows from</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-muted">
                We work across five cultural traditions. Each piece belongs to at least one;
                fusion pieces belong to several — and we say so.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {HERITAGE_ROOTS.map((r) => (
                <article
                  key={r.name}
                  className="rounded-lg border border-border bg-bg p-7 transition-colors hover:border-brand"
                >
                  <div className="text-3xl">{r.glyph}</div>
                  <h3 className="mt-3 font-display text-xl">{r.name}</h3>
                  <p className="mt-2 text-xs italic text-gold">"{r.tone}"</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{r.summary}</p>
                  <dl className="mt-4 space-y-1.5 text-xs">
                    <div>
                      <dt className="inline font-medium text-ink">Key materials: </dt>
                      <dd className="inline text-muted">{r.keywords.join(', ')}</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium text-ink">Palette: </dt>
                      <dd className="inline text-muted">{r.color}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-4xl px-4 py-14 md:py-20">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">Our Principles</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">What we will and will not do</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-lg border border-border bg-surface p-6">
                <h3 className="font-display text-lg text-brand">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-ink text-bg">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center md:py-20">
            <h2 className="font-display text-3xl md:text-4xl">Read the stories</h2>
            <p className="mx-auto mt-4 max-w-xl text-bg/75">
              The full story behind every piece — the silversmith, the weaver, the meaning
              woven into every knot.
            </p>
            <Link
              href="/stories"
              className="mt-7 inline-block rounded-md bg-brand px-7 py-3.5 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5"
            >
              EXPLORE STORIES
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
