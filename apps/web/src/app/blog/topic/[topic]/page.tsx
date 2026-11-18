import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { Breadcrumb } from '@/components/breadcrumb';
import { JournalList } from '@/components/journal-list';
import Image from '@/components/storefront-image';
import { getArticlesByCategory } from '@/lib/blog-data';
import { editorialArt } from '@/lib/editorial-art';
import { JOURNAL_TOPICS } from '@/lib/journal-topics';
import { pageMetadata } from '@/lib/page-metadata';

type Params = { params: Promise<{ topic: string }> };

const careTasks = [
  { slug: 'beaded-jewelry-care-guide', label: 'Check a beaded bracelet' },
  { slug: 'how-to-clean-crystal-jewelry-safe-methods', label: 'Choose the right cleaner' },
  { slug: 'summer-solstice-crystal-guide', label: 'Care after sun, sand or swimming' },
];

export function generateStaticParams() {
  return JOURNAL_TOPICS.map(({ slug }) => ({ topic: slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { topic } = await params;
  const entry = JOURNAL_TOPICS.find(({ slug }) => slug === topic);
  if (!entry) return { title: 'Journal topic not found' };
  const featured = getArticlesByCategory(entry.category).find(({ slug }) => slug === entry.featured);
  const art = (featured && editorialArt(featured)) ?? entry.cover;
  return pageMetadata({
    title: entry.title, description: entry.description, path: `/blog/topic/${topic}`,
    image: { url: art.src, alt: art.alt },
  });
}

export default async function TopicPage({ params }: Params) {
  const { topic } = await params;
  const entry = JOURNAL_TOPICS.find(({ slug }) => slug === topic);
  if (!entry) notFound();
  const articles = getArticlesByCategory(entry.category);
  const featured = articles.find(({ slug }) => slug === entry.featured);
  const art = (featured && editorialArt(featured)) ?? entry.cover;
  const tasks = topic === 'care' ? careTasks.flatMap(({ slug, label }) => {
    const article = articles.find((guide) => guide.slug === slug);
    return article ? [{ article, label }] : [];
  }) : [];
  const more = articles.filter(({ slug }) => slug !== featured?.slug && !tasks.some(({ article }) => article.slug === slug));

  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="px-5 md:px-8" style={{ backgroundColor: entry.backdrop }}>
          <div className="mx-auto max-w-4xl">
            <Breadcrumb items={[{ label: 'The Nara Journal', href: '/blog' }, { label: entry.title }]} />
            <div className="py-10 md:py-14">
              <h1 className="font-display text-5xl leading-tight tracking-tight md:text-7xl">{entry.title}</h1>
              <p className="mt-4 max-w-2xl leading-7 text-muted">{entry.description}</p>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[960px] px-5 py-8 md:px-8 md:py-12">
          {featured && (
            <article className="mb-10 grid items-center overflow-hidden border border-border bg-surface sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <figure className="relative aspect-[3/2] min-h-[220px] w-full self-stretch overflow-hidden bg-bg">
                <Image src={art.src} alt={art.alt} fill preload sizes="(max-width: 639px) 92vw, (max-width: 960px) 50vw, 490px" className="object-cover" />
                <figcaption className="absolute bottom-2 right-2 bg-ink px-2 py-1 text-[0.6875rem] text-bg">Editorial illustration</figcaption>
              </figure>
              <div className="px-5 py-6 sm:px-8 sm:py-9">
                <h2 className="font-display text-3xl leading-tight tracking-tight text-ink">
                  <Link href={`/blog/${featured.slug}`} className="underline-offset-4 hover:text-brand hover:underline">{featured.title} <span aria-hidden="true" className="text-lg text-brand">↗</span></Link>
                </h2>
                <p className="mt-3 max-w-prose text-sm leading-6 text-muted">{featured.description}</p>
                <p className="mt-3 text-xs text-muted">{featured.readingTime}</p>
              </div>
            </article>
          )}
          {tasks.length > 0 && (
            <section aria-labelledby="care-tasks-title" className="mb-12 border-y border-border py-6 md:py-8">
              <h2 id="care-tasks-title" className="mb-4 font-display text-3xl">Care by task</h2>
              <ul className="grid gap-3 md:grid-cols-3">
                {tasks.map(({ article, label }) => (
                  <li key={article.slug}>
                    <Link href={`/blog/${article.slug}`} className="group block h-full border-t-2 border-brand bg-surface p-4 md:p-5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-xl leading-tight group-hover:text-brand">{label}</h3>
                        <span aria-hidden="true" className="text-brand">↗</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">{article.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="mb-5 font-display text-3xl">{featured ? 'More guides' : 'Guides'}</h2>
            <JournalList articles={more} />
          </section>
          <nav aria-label="Other journal topics" className="mt-8 flex flex-wrap gap-x-6 gap-y-4 text-sm text-brand">
            {JOURNAL_TOPICS.filter(({ slug }) => slug !== topic).map(({ slug, title }) => <Link key={slug} href={`/blog/topic/${slug}`} className="underline underline-offset-4">{title}</Link>)}
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
