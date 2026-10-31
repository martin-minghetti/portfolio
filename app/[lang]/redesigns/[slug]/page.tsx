import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, locales, type Locale } from "@/lib/i18n";
import { getRedesign, redesigns, shot } from "@/lib/redesigns";
import FadeImage from "@/components/ui/FadeImage";
import BeforeAfter from "@/components/ui/BeforeAfter";
import CTAButton from "@/components/ui/CTAButton";

export function generateStaticParams() {
  return locales.flatMap((lang) => redesigns.map((r) => ({ lang, slug: r.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const r = getRedesign(slug);
  if (!isLocale(lang) || !r) return {};
  return {
    title: `${r.name[lang]} | Martín Minghetti`,
    description: r.intro[lang],
    alternates: alternates(lang, `/redesigns/${slug}`),
  };
}

export default async function RedesignPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const r = getRedesign(slug);
  if (!r) notFound();
  const data = (await getDictionary(locale)).redesign;
  const phones = [
    { src: shot(slug, "antes-mobile"), label: data.before },
    { src: shot(slug, "despues-mobile"), label: data.after },
  ];

  return (
    <article className="container pt-(--space-2xl) pb-(--section-gap-s)">
      <Link href={`/${locale}`} className="tlink">
        {data.back}
      </Link>

      <header className="mt-(--space-xl) grid gap-(--space-md) md:grid-cols-12 md:gap-(--gap-columns)">
        <div className="flex items-start justify-between gap-3 md:col-span-5">
          <h1 className="font-display text-(length:--text-title) leading-tight">{r.name[locale]}</h1>
          <span className="label whitespace-nowrap rounded-card border border-rule px-2 py-0.5">{data.status}</span>
        </div>
        <p className="md:col-span-6 md:col-start-7">{r.intro[locale]}</p>
      </header>

      <div className="mt-(--space-xl)">
        {/* New site on the left: at the default split its headline shows, not just the hero photo. */}
        <BeforeAfter
          left={{ src: shot(slug, "despues-desktop"), label: data.after }}
          right={{ src: shot(slug, "antes-desktop"), label: data.before }}
          slider={data.slider}
        />
      </div>

      <div className="mt-(--space-2xl) grid gap-(--space-2xl) md:grid-cols-12 md:gap-(--gap-columns)">
        <div className="grid grid-cols-2 gap-(--space-md) self-start md:sticky md:top-24 md:col-span-5">
          {phones.map((phone) => (
            <figure key={phone.src}>
              <div className="crop-shadow relative aspect-[390/844] overflow-hidden rounded-card outline outline-1 -outline-offset-1 outline-ink/10">
                <FadeImage src={phone.src} alt={phone.label} fill sizes="(min-width: 768px) 20vw, 45vw" className="object-cover object-top" />
              </div>
              <figcaption className="label mt-(--space-xs)">{phone.label}</figcaption>
            </figure>
          ))}
        </div>

        <div className="flex flex-col md:col-span-6 md:col-start-7">
          <h2 className="label !text-ink">{data.metricsHeading}</h2>
          <dl className="set mt-(--space-sm)">
            {r.metrics[locale].map((m) => (
              <div key={m.label} className="grid grid-cols-[1fr_auto] items-baseline gap-3 py-(--space-sm)">
                <dt>{m.label}</dt>
                <dd className="num">
                  <span className="!text-muted line-through decoration-1">{m.before}</span>
                  <span aria-hidden className="mx-2 text-muted">→</span>
                  <span className="font-medium">{m.after}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="label mt-(--space-xs)">{r.metricsNote[locale]}</p>

          <h2 className="label mt-(--space-xl) !text-ink">{data.featuresHeading}</h2>
          <ul className="set mt-(--space-sm)">
            {r.features[locale].map((f) => (
              <li key={f} className="py-(--space-sm)">
                {f}
              </li>
            ))}
          </ul>

          <p className="label mt-(--space-md)">{r.stack}</p>

          <div className="mt-(--space-lg)">
            <CTAButton href={r.newUrl} external variant="outline">
              {data.cta}
            </CTAButton>
          </div>
        </div>
      </div>
    </article>
  );
}
