import Link from 'next/link';

export function StudioDesignCloseups({ designs }: { designs: { slug: string; name: string }[] }) {
  return (
    <section id="design-close-ups" aria-labelledby="design-close-ups-title" tabIndex={-1} className="border-b border-border py-5">
      <h2 id="design-close-ups-title" className="font-display text-xl">Design close-ups</h2>
      <ul className="mt-1 flex flex-wrap gap-x-6">
        {designs.map(({ slug, name }) => (
          <li key={slug}>
            <Link href={`/products/${slug}`} prefetch={false} className="inline-flex min-h-11 items-center gap-2 text-sm text-brand underline underline-offset-4">
              {name} <span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
