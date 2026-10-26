import type { Dictionary } from "@/lib/dictionaries";
import Counter from "@/components/ui/Counter";

type Props = {
  dict: Dictionary;
};

export default function WhoIAm({ dict }: Props) {
  return (
    <section id="who" className="border-t border-rule py-(--section-gap-s)">
      <div className="container">
        <h2 className="reveal-head">{dict.whoIAm.lead}</h2>

        <ol className="set mt-(--space-2xl) grid md:grid-cols-4 [&>*]:border-b-0">
          {dict.whoIAm.timeline.map((entry, i) => (
            <li
              key={entry.year}
              style={{ "--i": i } as React.CSSProperties}
              className="reveal border-b border-rule py-(--space-lg) md:border-b-0 md:border-l md:border-rule md:px-(--space-lg) md:first:border-l-0 md:first:pl-0"
            >
              <span className="num block font-display text-(length:--text-display-s) leading-none text-ink">
                {entry.year}
              </span>
              <p className="mt-(--space-sm)">{entry.label}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-(--space-2xl) grid gap-(--space-lg) border-y border-ink py-(--space-xl) md:grid-cols-3 md:gap-(--gap-columns)">
          {dict.whoIAm.stats.map((stat, i) => (
            <li key={stat} className="reveal" style={{ "--i": i } as React.CSSProperties}>
              <Counter value={stat} className="label block !text-ink-2" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
