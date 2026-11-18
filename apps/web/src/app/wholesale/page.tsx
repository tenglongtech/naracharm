import { pageMetadata } from '@/lib/page-metadata';
import Image from '@/components/storefront-image';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';

export const metadata = pageMetadata({
  title: 'Wholesale Jewelry Inquiries',
  description: 'Tell Nara Charm about your shop and the jewelry collections you are looking for. Ask about wholesale availability and lead times.',
  path: '/wholesale',
});

export default function WholesalePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="section-wrap grid items-center gap-8 md:grid-cols-2 md:gap-14">
        <div>
          <h1 className="font-display text-5xl tracking-tight md:text-7xl">Wholesale inquiries.</h1>
          <p className="mt-5 max-w-md leading-7 text-muted">Tell us about your shop, its location and the pieces you are interested in. Include your preferred quantities and timing so we can discuss availability, lead times and terms.</p>
          <Link href="/contact?topic=wholesale" className="shop-button mt-7">Contact us about wholesale ↗</Link>
          <Link href="/collections" className="mt-5 block text-sm text-brand underline underline-offset-4">Browse collections</Link>
        </div>
        <figure>
          <div className="relative aspect-[3/2] overflow-hidden rounded-sm">
            <Image src="/editorial/studio-materials.webp" alt="An illustration of cord, stone and metalwork in the Nara Charm studio palette" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
          </div>
          <figcaption className="mt-2 text-xs text-muted">Nara Charm studio illustration</figcaption>
        </figure>
      </main>
      <SiteFooter />
    </>
  );
}
