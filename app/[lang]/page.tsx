import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-[var(--container-wide)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-32)]">
      <section className="space-y-[var(--spacing-12)]">
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[var(--leading-tight)] tracking-[var(--tracking-tighter)]">
          <span className="block">{dict.hero.h1Line1}</span>
          <span className="block">{dict.hero.h1Line2}</span>
          <span className="block text-[var(--color-fg-muted)]">
            {dict.hero.h1Line3}
          </span>
        </h1>

        <div className="grid gap-[var(--spacing-6)] md:grid-cols-2">
          <article className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]">
            <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
              {dict.hero.trackA.label}
            </h2>
            <p className="mt-[var(--spacing-4)] text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
              {dict.hero.trackA.tagline}
            </p>
            <a
              href="https://wa.me/5492241622290"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-[var(--spacing-8)] inline-block border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
            >
              [ {dict.hero.trackA.cta} → ]
            </a>
          </article>

          <article className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]">
            <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
              {dict.hero.trackB.label}
            </h2>
            <p className="mt-[var(--spacing-4)] text-[var(--text-lg)] leading-[var(--leading-relaxed)]">
              {dict.hero.trackB.tagline}
            </p>
            <a
              href="https://cal.com/martin-minghetti"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-[var(--spacing-8)] inline-block border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
            >
              [ {dict.hero.trackB.cta} → ]
            </a>
          </article>
        </div>

        <p className="text-center text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
          {dict.hero.scrollHint} <span className="caret">↓</span>
        </p>
      </section>
    </div>
  );
}
