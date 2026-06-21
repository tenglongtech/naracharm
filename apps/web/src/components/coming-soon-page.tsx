import Link from 'next/link';
import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';

/**
 * 通用内容占位页
 * 用于内容/功能页 (Stories / Our Craft / Gift Guide / Account / Search 等)
 * 在完整功能开发前,提供一个得体、不破的占位体验。
 *
 * 用法:
 *   export default function Page() {
 *     return <ComingSoonPage title="..." subtitle="..." eyebrow="..." cta={{href,label}} />;
 *   }
 */
export function ComingSoonPage({
  eyebrow,
  title,
  subtitle,
  description,
  cta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 text-center">
        <LotusMark className="h-12 w-12 text-brand" />
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-brand">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 font-display italic text-lg text-muted">{subtitle}</p>
        )}
        {description && (
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted">{description}</p>
        )}
        {(cta || secondaryCta) && (
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {cta && (
              <Link href={cta.href} className="rounded-md bg-brand px-7 py-3 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5">
                {cta.label}
              </Link>
            )}
            {secondaryCta && (
              <Link href={secondaryCta.href} className="rounded-md border border-ink px-7 py-3 text-sm font-medium transition-colors hover:bg-ink hover:text-bg">
                {secondaryCta.label}
              </Link>
            )}
          </div>
        )}
        <p className="mt-12 text-xs uppercase tracking-wider text-muted/60">
          ✦ This page is being crafted. Check back soon.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
