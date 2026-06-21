import { SiteHeader, SiteFooter, LotusMark } from '@/components/site-chrome';

/** 政策/帮助页通用布局 (Shipping/Returns/Privacy/Terms/FAQ 等) */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated?: string;
  intro?: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <LotusMark className="h-10 w-10 text-brand" />
        <h1 className="mt-5 font-display text-3xl md:text-4xl">{title}</h1>
        {updated && (
          <p className="mt-2 text-xs uppercase tracking-wider text-muted">Last updated: {updated}</p>
        )}
        {intro && <p className="mt-5 leading-relaxed text-muted">{intro}</p>}

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-xl text-brand">{s.heading}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink/85">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-surface p-6 text-sm text-muted">
          Questions? Reach us anytime at{' '}
          <a href="mailto:hello@naracharm.com" className="text-brand underline">
            hello@naracharm.com
          </a>
          .
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
