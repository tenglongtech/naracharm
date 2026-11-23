import { pageMetadata } from '@/lib/page-metadata';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { StudioCollectionGrid } from '@/components/studio-collections';

export const metadata = pageMetadata({
  title: 'Studio Collections and Jewelry Design Previews',
  description: 'See new Nara Charm jewelry designs in progress, from offset silver outlines and woven cords to celadon pendants and lotus shapes.',
  path: '/studio',
  image: { url: '/editorial/studio-campaign.webp', alt: 'Pale celadon crescent over a cream pendant in the Nara Charm studio' },
});

export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-[1392px] px-[1.125rem] py-11 md:px-9 md:py-16">
        <div className="mb-8 grid items-end gap-5 border-b border-border pb-6 lg:mb-11 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
          <h1 className="font-display text-[clamp(3.25rem,7.1vw,7rem)] leading-[0.9] tracking-[-0.065em]">Inside the <em className="text-brand">studio.</em></h1>
          <p className="max-w-md text-sm leading-7 text-muted md:text-base">An open wire window, a braid turning back on itself, a pale crescent over a paper-colored disc. Explore the details that shape each collection, from early design studies to the current jewelry catalog.</p>
        </div>
        <section id="studio-collections">
          <h2 className="sr-only">Studio collections</h2>
          <StudioCollectionGrid editorial />
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-6 text-sm text-brand">
            <Link href="/collections/studio-edit" className="underline underline-offset-4">Browse the first Studio Edit</Link>
            <Link href="/shop" className="underline underline-offset-4">Shop jewelry</Link>
            <Link href="/blog/topic/materials" className="underline underline-offset-4">Read about materials and finishes</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
