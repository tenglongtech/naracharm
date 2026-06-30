import Link from 'next/link';
import { Fragment } from 'react';

export type BreadcrumbItem = { label: string; href?: string };

/**
 * Breadcrumb (server component) + BreadcrumbList JSON-LD
 *
 * 用法:
 *   <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Stories' }]} />
 *   最后一项不需要 href (当前页)
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://naracharm.com';

  // 拼装 JSON-LD (强制第一个为 Home)
  const fullItems: BreadcrumbItem[] = items[0]?.href === '/' ? items : [{ label: 'Home', href: '/' }, ...items];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="border-b border-border/60">
        <ol className="flex flex-wrap items-center gap-2 py-3 text-xs text-muted">
          {fullItems.map((item, i) => {
            const isLast = i === fullItems.length - 1;
            return (
              <Fragment key={`${item.label}-${i}`}>
                {i > 0 && <li aria-hidden="true">/</li>}
                <li>
                  {item.href && !isLast ? (
                    <Link href={item.href} className="hover:text-brand">
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-ink' : ''} aria-current={isLast ? 'page' : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
