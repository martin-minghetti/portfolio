import FadeImage from "@/components/ui/FadeImage";
import BeforeAfter from "@/components/ui/BeforeAfter";
import CTAButton from "@/components/ui/CTAButton";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

const dir = "/projects/italia-inn";

export default function Redesign({ dict }: Props) {
  const data = dict.redesign;
  const phones = [
    { src: `${dir}/antes-mobile.jpg`, label: data.before },
    { src: `${dir}/despues-mobile.jpg`, label: data.after },
  ];

  return (
    <section id="redesign" className="border-t border-rule py-(--section-gap-s)">
      <div className="container">
        <h2 className="reveal-head">{data.sectionHeader}</h2>

        <header className="reveal mt-(--space-2xl) grid gap-(--space-md) md:grid-cols-12 md:gap-(--gap-columns)">
          <div className="flex items-start justify-between gap-3 md:col-span-5">
            <h3 className="font-display text-(length:--text-title) leading-tight">{data.name}</h3>
            <span className="label whitespace-nowrap rounded-card border border-rule px-2 py-0.5">{data.status}</span>
          </div>
          <p className="md:col-span-6 md:col-start-7">{data.intro}</p>
        </header>

        <div className="reveal mt-(--space-xl)">
          {/* New site on the left: at the default split its headline shows, not just the hero photo. */}
          <BeforeAfter
            left={{ src: `${dir}/despues-desktop.jpg`, label: data.after }}
            right={{ src: `${dir}/antes-desktop.jpg`, label: data.before }}
            slider={data.slider}
          />
        </div>

        <div className="mt-(--space-2xl) grid gap-(--space-2xl) md:grid-cols-12 md:gap-(--gap-columns)">
          <div className="grid grid-cols-2 gap-(--space-md) self-start md:sticky md:top-24 md:col-span-5">
            {phones.map((phone) => (
              <figure key={phone.src} className="reveal">
                <div className="crop-shadow relative aspect-[390/844] overflow-hidden rounded-card outline outline-1 -outline-offset-1 outline-ink/10">
                  <FadeImage src={phone.src} alt={phone.label} fill sizes="(min-width: 768px) 20vw, 45vw" className="object-cover object-top" />
                </div>
                <figcaption className="label mt-(--space-xs)">{phone.label}</figcaption>
              </figure>
            ))}
          </div>

          <div className="flex flex-col md:col-span-6 md:col-start-7">
            <h4 className="label !text-ink">{data.metricsHeading}</h4>
            <dl className="set mt-(--space-sm)">
              {data.metrics.map((m) => (
                <div key={m.label} className="reveal-fade grid grid-cols-[1fr_auto] items-baseline gap-3 py-(--space-sm)">
                  <dt>{m.label}</dt>
                  <dd className="num">
                    <span className="!text-muted line-through decoration-1">{m.before}</span>
                    <span aria-hidden className="mx-2 text-muted">→</span>
                    <span className="font-medium">{m.after}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="label mt-(--space-xs)">{data.metricsNote}</p>

            <h4 className="label mt-(--space-xl) !text-ink">{data.featuresHeading}</h4>
            <ul className="set mt-(--space-sm)">
              {data.features.map((f) => (
                <li key={f} className="reveal-fade py-(--space-sm)">
                  {f}
                </li>
              ))}
            </ul>

            <p className="label mt-(--space-md)">{data.stack}</p>

            <div className="mt-(--space-lg)">
              <CTAButton href="https://italia-inn.vercel.app" external variant="outline">
                {data.cta}
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
