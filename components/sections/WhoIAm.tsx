import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function WhoIAm({ dict }: Props) {
  return (
    <section id="who" className="py-(--section-gap)">
      <div className="container">
        <h2 className="reveal-head">{dict.whoIAm.lead}</h2>

        <ol className="mt-(--space-2xl) grid gap-(--space-lg) md:grid-cols-4 md:gap-(--gap-columns)">
          {dict.whoIAm.timeline.map((entry, i) => (
            <li
              key={entry.year}
              style={{ "--i": i } as React.CSSProperties}
              className="reveal"
            >
              <span className="num block font-display text-(length:--text-display-s) leading-none text-ink">
                {entry.year}
              </span>
              <p className="mt-(--space-sm)">{entry.label}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-(--space-2xl) grid gap-(--space-md) md:grid-cols-3 md:gap-(--gap-columns)">
          {dict.whoIAm.stats.map((stat, i) => (
            <li key={stat} className="reveal font-display text-(length:--text-title) leading-tight text-ink" style={{ "--i": i } as React.CSSProperties}>
              {stat}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
