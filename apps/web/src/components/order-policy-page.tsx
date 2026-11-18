import type { ReactNode } from 'react';
import Link from 'next/link';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { serializeJsonLd } from '@/lib/seo';
import styles from './order-policy.module.css';

const links = [
  { label: 'Shipping', path: '/shipping' },
  { label: 'Returns', path: '/returns' },
  { label: 'Order questions', path: '/faq' },
];

export function OrderPolicyPage({ path, title, intro, updated, schema, children }: {
  path: '/shipping' | '/returns';
  title: string;
  intro: string;
  updated: string;
  schema: object;
  children: ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
      <SiteHeader />
      <main id="main" className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.shell}>
            <nav aria-label="Order policies" className={styles.navigation}>
              {links.map((link) => <Link key={link.path} href={link.path} aria-current={link.path === path ? 'page' : undefined}>{link.label}</Link>)}
            </nav>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
        </header>
        <div className={styles.shell + ' ' + styles.body}>
          {children}
          <p className={styles.updated}>Policy updated {updated}</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
