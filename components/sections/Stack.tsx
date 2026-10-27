import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function Stack({ dict }: Props) {
  return (
    <section className="bg-paper-2 py-(--section-gap-s)">
      <div className="container">
        <header className="grid gap-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
          <h2 className="reveal-head md:col-span-6">{dict.stack.sectionHeader}</h2>
          <p className="reveal lead md:col-span-5 md:col-start-8" style={{ "--i": 1 } as React.CSSProperties}>{dict.stack.sectionLead}</p>
        </header>

        <dl className="set mt-(--space-2xl)">
          {dict.stack.rows.map((row, i) => (
            <div
              key={row.label}
              style={{ "--i": Math.min(i, 6) } as React.CSSProperties}
              className="reveal-fade grid gap-(--space-xs) py-(--space-md) md:grid-cols-12 md:gap-(--gap-columns)"
            >
              <dt className="label md:col-span-3">{row.label}</dt>
              <dd className="md:col-span-8 md:col-start-5">{row.values}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
