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

        <ol className="set mt-(--space-2xl) [counter-reset:how]">
          {dict.howIThink.items.map((item) => (
            <li
              key={item.index}
              className="grid gap-(--space-sm) py-(--space-xl) [counter-increment:how] md:grid-cols-12 md:gap-(--gap-columns)"
            >
              <span
                aria-hidden
                className="num font-display text-(length:--text-display-s) leading-none !text-muted before:content-[counter(how)] md:col-span-2"
              />
              <h3 className="md:col-span-4">{item.heading}</h3>
              <p className="md:col-span-5 md:col-start-8">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
