import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function Stack({ dict }: Props) {
  return (
    <section className="border-t border-rule bg-paper-2 py-(--section-gap-s)">
      <div className="container">
        <header className="grid gap-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
          <h2 className="md:col-span-6">{dict.stack.sectionHeader}</h2>
          <p className="lead md:col-span-5 md:col-start-8">{dict.stack.sectionLead}</p>
        </header>

        <dl className="set mt-(--space-2xl)">
          {dict.stack.rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-(--space-xs) py-(--space-md) md:grid-cols-12 md:gap-(--gap-columns)"
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
