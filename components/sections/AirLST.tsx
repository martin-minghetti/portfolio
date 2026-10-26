import type { Dictionary } from "@/lib/dictionaries";
import { airlstClients } from "@/lib/projects";

type Props = {
  dict: Dictionary;
};

export default function AirLST({ dict }: Props) {
  return (
    <section className="bg-ink py-(--section-gap-s)">
      <div className="container grid gap-(--space-xl) md:grid-cols-12 md:gap-(--gap-columns)">
        <div className="md:col-span-5">
          <h2 className="!text-paper">{dict.airlst.sectionHeader}</h2>
          <p className="lead mt-(--space-lg) !text-paper">{dict.airlst.disclaimer}</p>
          <p className="mt-(--space-md) !text-paper-3">{dict.airlst.metrics}</p>
        </div>
        <ul className="grid auto-rows-min grid-cols-2 border-t border-paper-3/40 md:col-span-6 md:col-start-7">
          {airlstClients.map((client) => (
            <li
              key={client}
              className="border-b border-paper-3/40 py-(--space-md) font-display text-(length:--text-title) leading-tight !text-paper"
            >
              {client}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
