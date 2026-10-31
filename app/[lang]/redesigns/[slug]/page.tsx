import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, locales, type Locale } from "@/lib/i18n";
import { getRedesign, redesigns, shot } from "@/lib/redesigns";
import BeforeAfter from "@/components/ui/BeforeAfter";
import OldSiteViewer from "@/components/ui/OldSiteViewer";
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

// Lighthouse's own bands and colors, so the scores read the same as in its report.
const band = (score: number) =>
  score >= 90
    ? { ring: "#0cce6b", text: "#08803f" }
    : score >= 50
      ? { ring: "#ffa400", text: "#a35a00" }
      : { ring: "#ff4e42", text: "#c7221f" };

function Gauge({ score, label }: { score: number; label: string }) {
  const { ring, text } = band(score);
  const c = 2 * Math.PI * 22;
  return (
    <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 52 52" className="size-14" role="img" aria-label={`${label}: ${score}`}>
        <circle cx="26" cy="26" r="22" fill={`${ring}1f`} stroke={`${ring}33`} strokeWidth="4" />
        <circle
          cx="26"
          cy="26"
          r="22"
          fill="none"
          stroke={ring}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * c} ${c}`}
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="31" textAnchor="middle" fontSize="15" fontWeight="600" fill={text} className="num">
          {score}
        </text>
      </svg>
      <figcaption className="label">{label}</figcaption>
    </figure>
  );
}

function LegendMark({ score }: { score: number }) {
  const { ring } = band(score);
  if (score < 50)
    return <span aria-hidden className="inline-block size-0 border-x-[6px] border-b-[10px] border-x-transparent" style={{ borderBottomColor: ring }} />;
  return <span aria-hidden className={`inline-block size-2.5 ${score >= 90 ? "rounded-full" : ""}`} style={{ background: ring }} />;
}

export default async function RedesignPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const r = getRedesign(slug);
  if (!r) notFound();
  const data = (await getDictionary(locale)).redesign;

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
        <BeforeAfter
          left={{ src: shot(slug, "antes-desktop"), label: data.before }}
          right={{ src: shot(slug, "despues-desktop"), label: data.after }}
          slider={data.slider}
        />
      </div>

      <section className="mt-(--space-3xl)">
        <h2 className="text-(length:--text-title)">{data.oldSiteHeading}</h2>
        <p className="label mt-(--space-xs)">{data.oldSiteHint}</p>
        <div className="mt-(--space-md)">
          <OldSiteViewer
            shots={{
              mobile: shot(slug, "antes-mobile-completa"),
              tablet: shot(slug, "antes-tablet-completa"),
              desktop: shot(slug, "antes-desktop-completa"),
            }}
            url={r.oldUrl}
            labels={{ ...data.devices, alt: data.oldSiteAlt }}
          />
        </div>
      </section>

      <div className="mt-(--space-3xl) grid gap-(--space-2xl) md:grid-cols-12 md:gap-(--gap-columns)">
        <section className="md:col-span-6">
          <h2 className="text-(length:--text-title)">{data.scoresHeading}</h2>
          <p className="label mt-(--space-xs)">{data.scoresNote}</p>
          <ul className="label mt-(--space-sm) flex flex-wrap gap-x-5 gap-y-1">
            {[
              [10, data.legend.bad],
              [70, data.legend.mid],
              [95, data.legend.good],
            ].map(([s, text]) => (
              <li key={text} className="flex items-center gap-2">
                <LegendMark score={s as number} />
                {text}
              </li>
            ))}
          </ul>

          <ul className="set mt-(--space-md)">
            {r.scores[locale].map((s) => (
              <li key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-4 py-(--space-md)">
                <div>
                  <p className="text-ink">{s.label}</p>
                  <p className="label">{s.hint}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge score={s.before} label={data.before} />
                  <span aria-hidden className="pb-5 text-muted">→</span>
                  <Gauge score={s.after} label={data.after} />
                </div>
              </li>
            ))}
            {r.facts[locale].map((f) => (
              <li key={f.label} className="grid grid-cols-[1fr_auto] items-center gap-4 py-(--space-md)">
                <div>
                  <p className="text-ink">{f.label}</p>
                  <p className="label">{f.hint}</p>
                </div>
                <p className="num text-right">
                  <span className="text-muted line-through decoration-1">{f.before}</span>
                  <span aria-hidden className="mx-2 text-muted">→</span>
                  <span className="font-medium text-ink">{f.after}</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="label mt-(--space-xs)">{r.measuredOn[locale]}</p>
        </section>

        <section className="flex flex-col md:col-span-5 md:col-start-8">
          <h2 className="text-(length:--text-title)">{data.featuresHeading}</h2>
          <ul className="set mt-(--space-md)">
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
        </section>
      </div>
    </article>
  );
}
