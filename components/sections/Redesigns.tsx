import Link from "next/link";
import FadeImage from "@/components/ui/FadeImage";
import CTAButton from "@/components/ui/CTAButton";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { redesigns, shot } from "@/lib/redesigns";

type Props = {
  dict: Dictionary;
  locale: Locale;
};

// Same row as the sample projects, but each one opens its own before/after page.
export default function Redesigns({ dict, locale }: Props) {
  const data = dict.redesign;

  return (
    <section id="redesigns" className="border-t border-rule py-(--section-gap-s)">
      <div className="container">
        <h2 className="reveal-head">{data.sectionHeader}</h2>

        <div className="set mt-(--space-2xl) [&>*:last-child]:border-b-0">
          {redesigns.map((r) => {
            const href = `/${locale}/redesigns/${r.slug}`;
            return (
              <article key={r.slug} className="grid gap-(--space-lg) border-b border-rule py-(--space-xl) md:grid-cols-12 md:gap-(--gap-columns)">
                <Link href={href} className="block md:col-span-5" aria-label={r.name[locale]}>
                  <div
                    data-slot={`screen-${r.slug}`}
                    className="screen tint crop-shadow aspect-[16/10] rounded-card outline outline-1 -outline-offset-1 outline-ink/10"
                  >
                    <FadeImage
                      src={shot(r.slug, "despues-desktop")}
                      alt={r.name[locale]}
                      fill
                      sizes="(min-width: 768px) 55vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                </Link>
                <div className="reveal flex min-w-0 flex-col md:col-span-6 md:col-start-7" style={{ "--i": 1 } as React.CSSProperties}>
                  <header className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-(length:--text-title) leading-tight">
                      <Link href={href}>{r.name[locale]}</Link>
                    </h3>
                    <span className="label whitespace-nowrap rounded-card border border-rule px-2 py-0.5">{data.status}</span>
                  </header>
                  <p className="mt-(--space-sm)">{r.intro[locale]}</p>
                  <footer className="mt-auto pt-(--space-md)">
                    <CTAButton href={href} variant="outline" className="!min-h-11">
                      {data.open}
                    </CTAButton>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
