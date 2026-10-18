import { editorialArt } from '@/lib/editorial-art';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';
import { ProductTile } from '@/components/product-tile';
import { getActiveProducts, getAllCollections } from '@/lib/storefront';
import { productCard } from '@/lib/catalog';
import { getRecentBlogArticles } from '@/lib/blog-data';
import { CATEGORIES } from '@/lib/categories';
import { siteConfig } from '@/lib/site-config';
export const metadata: Metadata = { title: { absolute: 'Nara Charm | Handmade Jewelry with a Story' }, description: 'Discover meaningful bracelets, necklaces, earrings and phone charms. Explore heritage-inspired jewelry, thoughtful gifts and everyday styling at Nara Charm.', alternates: { canonical: '/' } };
export default async function HomePage() {
  const [products, collections] = await Promise.all([getActiveProducts(), getAllCollections()]);
  const featured = [...products].sort((a,b)=>Number(b.isFeatured)-Number(a.isFeatured)).slice(0,8);
  const hero = featured.find(p=>p.primaryImage);
  const articles = getRecentBlogArticles(3);

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nara Charm',
    url: siteConfig.url,
    description: 'Handmade heritage jewelry — bracelets, necklaces, earrings and phone charms carrying cultural stories.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} /><SiteHeader /><main id="main">
    <section className="relative border-b border-border">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center px-5 py-9 md:px-8 md:py-20 lg:pr-14">
          <p className="eyebrow">Small treasures. Lasting meaning.</p>
          <h1 className="mt-6 max-w-xl font-display text-5xl leading-[1.08] tracking-[-0.04em] md:text-7xl">Not just worn.<br /><span className="italic text-brand">Felt.</span></h1>
          <p className="mt-7 max-w-md text-base leading-8 text-muted">Jewelry for the stories you carry. Discover color, texture and craft-inspired details that feel like a little piece of you.</p>
          <div className="mt-9 flex flex-wrap gap-4"><Link className="shop-button" href="/shop">Explore the jewelry <span aria-hidden="true">↗</span></Link><Link className="inline-flex items-center px-2 py-4 text-sm underline underline-offset-8" href="/gift-guide">Find a meaningful gift</Link></div>
          <div className="mt-12 hidden items-center gap-4 border-t md:flex border-border pt-6"><LotusMark className="h-8 w-8 shrink-0 text-brand" /><p className="max-w-xs text-xs leading-6 text-muted">Inspired by heritage.<br />Chosen for your everyday.</p></div>
        </div>
        <div className="relative min-h-96 bg-surface lg:min-h-[660px]">
          {hero?.primaryImage && <Image src={hero.primaryImage} alt={hero.name} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />}
          <div className="absolute left-5 top-5 rounded-full bg-bg/95 px-4 py-2 text-[10px] uppercase tracking-[0.2em]">The Nara edit · 01</div>
          {hero && <Link href={`/products/${hero.slug}`} className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 border border-white/50 bg-bg/95 p-5 backdrop-blur"><div><p className="text-[10px] uppercase tracking-widest text-muted">In the spotlight</p><p className="mt-1 font-display text-lg">{hero.name}</p></div><span className="shrink-0 text-sm">${(hero.basePriceCents/100).toFixed(2)} ↗</span></Link>}
        </div>
      </div>
    </section>
    <div className="border-b border-border bg-surface"><div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border text-center text-xs tracking-wide sm:grid-cols-3 sm:divide-x sm:divide-y-0"><Link href="/shipping" className="px-4 py-4">Shipping included over ${siteConfig.freeShippingThresholdUsd}</Link><Link href="/returns" className="px-4 py-4">{siteConfig.returnWindowDays}-day return window</Link><Link href="/size-guide" className="px-4 py-4">A little guidance for the perfect fit ↗</Link></div></div>
    <section className="section-wrap">
      <div className="section-heading"><div><p className="eyebrow">Make it your own</p><h2 className="section-title">Where will your story start?</h2></div><Link href="/shop" className="text-sm underline underline-offset-4">Shop all jewelry ↗</Link></div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{CATEGORIES.map((c,i)=>{const category = ['phone-charm','necklace','bracelet','earrings'][i];const p=products.find(p=>p.category===category && p.primaryImage);return <Link key={c.slug} href={`/collections/${c.slug}`} className="group"><div className="relative aspect-[5/4] overflow-hidden rounded-t-[80px] bg-surface">{p?.primaryImage && <Image src={p.primaryImage} alt={`${c.name} — ${p.name}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}</div><div className="flex items-center justify-between border-b border-border py-4"><h3 className="font-display text-lg md:text-xl">{c.name}</h3><span aria-hidden="true">↗</span></div></Link>})}</div>
    </section>
    <section className="section-wrap border-t border-border" aria-labelledby="featured-title"><div className="section-heading"><div><p className="eyebrow">Considered details. Everyday companions.</p><h2 id="featured-title" className="section-title">The pieces we keep coming back to.</h2></div><Link href="/shop" className="text-sm underline underline-offset-4">Discover the full edit ↗</Link></div><div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{featured.map(p=><ProductTile key={p.slug} product={productCard(p)} />)}</div></section>
    <section className="section-wrap border-t border-border"><div className="section-heading"><div><p className="eyebrow">New in the studio</p><h2 className="section-title">Six new stories, taking shape.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-muted">Explore our newest designs and planned prices. Final production details and availability are being confirmed.</p></div><Link href="/collections/studio-edit" className="text-sm underline underline-offset-4">Explore Studio Edit ↗</Link></div><div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">{products.filter(p => p.availability === 'preview').map(p => <ProductTile key={p.slug} product={productCard(p)} />)}</div></section>
    <section className="bg-ink text-bg"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:gap-20 md:py-24"><div><LotusMark className="h-10 w-10 text-gold" /><p className="mt-8 text-xs uppercase tracking-[0.2em] text-gold">More than an accessory</p><h2 className="mt-5 font-display text-4xl leading-tight md:text-5xl">A little heritage.<br /><span className="italic text-gold">A story of your own.</span></h2></div><div className="flex flex-col justify-center"><p className="text-lg leading-8 text-bg/80">A knot can remind you of home. A favorite color can mark a fresh start. We bring together jewelry inspired by craft traditions, with room for the meaning you give it.</p><p className="mt-5 leading-7 text-bg/65">Explore the details, learn about the materials and choose something you want to return to, day after day.</p><Link href="/stories" className="mt-8 w-fit border-b border-gold pb-2 text-sm text-gold">Meet the stories behind the pieces ↗</Link></div></div></section>
    <section className="section-wrap"><div className="section-heading"><div><p className="eyebrow">Follow your curiosity</p><h2 className="section-title">Different roots. Shared spirit.</h2></div><Link href="/collections" className="text-sm underline underline-offset-4">All collections ↗</Link></div><div className="mt-9 grid gap-6 md:grid-cols-3">{collections.slice(0,3).map(c=>{const p=products.find(p=>p.collectionSlug===c.slug && p.primaryImage);return <Link key={c.slug} href={`/collections/${c.slug}`} className="group"><div className="relative aspect-[4/3] overflow-hidden bg-surface">{p?.primaryImage && <Image src={p.primaryImage} alt={`${c.name} jewelry collection`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}</div><h3 className="mt-5 font-display text-2xl">{c.name} <span className="text-brand">↗</span></h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{c.description}</p></Link>})}</div></section>
    <section className="border-y border-border bg-surface"><div className="section-wrap grid gap-8 md:grid-cols-[1fr_1.2fr]"><div><p className="eyebrow">For someone who means something</p><h2 className="section-title">A small gift.<br />A lovely thought.</h2><p className="mt-5 max-w-md leading-7 text-muted">Begin with their favorite color, an everyday ritual or a shared memory. The best place to start is the person.</p><Link href="/gift-guide" className="shop-button mt-7">Explore gift ideas ↗</Link></div><div className="grid content-center gap-3">{[['01','Start with their style','Discover their everyday category.','/shop'],['02','Make room for meaning','Find a story that feels personal.','/stories'],['03','Check the little details','Read delivery information before ordering.','/shipping']].map(([n,title,desc,href])=><Link key={n} href={href} className="flex items-center gap-5 border-b border-border py-5"><span className="font-display text-3xl italic text-brand">{n}</span><div><h3 className="font-display text-xl">{title}</h3><p className="mt-1 text-sm text-muted">{desc}</p></div><span className="ml-auto">↗</span></Link>)}</div></div></section>
    <section className="section-wrap"><div className="section-heading"><div><p className="eyebrow">The Nara journal</p><h2 className="section-title">Wear it well. Keep it close.</h2></div><Link href="/blog" className="text-sm underline underline-offset-4">Read the journal ↗</Link></div><div className="mt-9 grid gap-6 md:grid-cols-3">{articles.map((a,i)=><Link key={a.slug} href={`/blog/${a.slug}`} className="group border-t border-brand pt-6"><div className="relative mb-5 aspect-[3/2] overflow-hidden bg-surface">{editorialArt(a) && <Image src={editorialArt(a).src} alt={editorialArt(a).alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />}</div><div className="flex justify-between text-xs text-muted"><span>{a.category}</span><span>0{i+1}</span></div><h3 className="mt-5 font-display text-2xl leading-snug group-hover:text-brand">{a.title}</h3><p className="mt-4 text-sm leading-7 text-muted">{a.description}</p><p className="mt-5 text-xs uppercase tracking-widest">Read the guide ↗</p></Link>)}</div></section>
  </main><SiteFooter /></>;
}
