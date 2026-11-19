import Link from 'next/link';
import Image from '@/components/storefront-image';
import type { Story } from '@/lib/stories-data';

export function StoryCard({ story }: { story: Story }) {
  const titleId = `story-${story.slug}`;
  return (
    <article className="border-t border-border pt-4">
      <Link prefetch={false} href={`/stories/${story.slug}`} aria-labelledby={titleId} className="group block">
        <div className="relative aspect-[5/4] overflow-hidden rounded-sm bg-surface">
          <Image
            src={story.cover.url}
            alt={story.cover.alt}
            fill
            sizes="(min-width: 1200px) 360px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
          />
        </div>
        <p className="mt-5 text-xs font-medium tracking-wide text-brand">{story.relatedCollection.name}</p>
        <h3 id={titleId} className="mt-1 font-display text-3xl leading-tight group-hover:underline group-hover:underline-offset-4">{story.title}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{story.excerpt}</p>
      </Link>
    </article>
  );
}
