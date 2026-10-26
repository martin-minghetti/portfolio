import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function HowIThink({ dict }: Props) {
  return (
    <section className="py-(--section-gap-s)">
      <div className="container">
        <header className="grid gap-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
          <h2 className="md:col-span-6">{dict.howIThink.sectionHeader}</h2>
          <p className="lead md:col-span-5 md:col-start-8">{dict.howIThink.sectionLead}</p>
        </header>

        <ol className="set mt-(--space-2xl)">
          {dict.howIThink.items.map((item) => (
            <li
              key={item.index}
              className="grid gap-(--space-sm) py-(--space-xl) md:grid-cols-12 md:gap-(--gap-columns)"
            >
              <h3 className="md:col-span-5">{item.heading}</h3>
              <p className="md:col-span-6 md:col-start-7">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
