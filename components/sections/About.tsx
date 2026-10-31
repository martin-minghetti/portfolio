import FadeImage from "@/components/ui/FadeImage";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function About({ dict }: Props) {
  return (
    <section id="about" className="py-(--section-gap-s)">
      <div className="container">
        <h2 className="reveal-head">{dict.about.sectionHeader}</h2>

        <div className="mt-(--space-2xl) grid gap-(--space-2xl) md:grid-cols-12 md:gap-(--gap-columns)">
          <figure className="md:col-span-4">
            <div className="relative">
              <div
                data-slot="portrait"
                data-alt="Portrait of Martín"
                className="screen crop-shadow aspect-[4/5] rounded-card outline outline-1 -outline-offset-1 outline-ink/10 grayscale transition-[filter] duration-(--dur-short) ease-(--ease-out) hover:grayscale-0"
              >
                <FadeImage
                  src="/martin-portrait-hen.jpg"
                  alt="Martín Minghetti holding a hen, under a cloudy sky"
                  fill
                  sizes="(min-width: 768px) 30vw, 80vw"
                  className="object-cover"
                />
              </div>
            </div>
          </figure>

          <div className="space-y-(--space-lg) md:col-span-7 md:col-start-6">
            {dict.about.paragraphs.map((p, i) => (
              <p key={i} className={`reveal ${i === 0 ? "lead !text-ink" : ""}`} style={{ "--i": i } as React.CSSProperties}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <dl className="set mt-(--space-3xl)">
          {dict.about.facts.map((fact, i) => (
            <div
              key={fact.label}
              style={{ "--i": Math.min(i, 5) } as React.CSSProperties}
              className="reveal-fade grid gap-(--space-xs) py-(--space-md) md:grid-cols-12 md:gap-(--gap-columns)"
            >
              <dt className="label md:col-span-3">{fact.label}</dt>
              <dd className="md:col-span-8 md:col-start-5">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
