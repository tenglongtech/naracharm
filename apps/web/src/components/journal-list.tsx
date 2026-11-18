import Link from 'next/link';
import type { BlogArticle } from '@/lib/blog-data';

export function JournalList({ articles }: { articles: BlogArticle[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {articles.map((article) => (
        <li key={article.slug}>
          <Link prefetch={false} href={`/blog/${article.slug}`} className="group grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 py-5 sm:items-baseline">
            <h3 className="font-display text-xl leading-snug group-hover:text-brand sm:text-2xl">{article.title}</h3>
            <span className="whitespace-nowrap text-xs text-muted">{article.readingTime}</span>
            <p className="col-span-2 max-w-2xl text-sm leading-6 text-muted">{article.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
