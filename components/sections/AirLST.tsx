import type { Dictionary } from "@/lib/dictionaries";
import { airlstClients } from "@/lib/projects";
import FadeImage from "@/components/ui/FadeImage";

type Props = {
  dict: Dictionary;
};

export default function AirLST({ dict }: Props) {
  return (
    <section className="bg-ink py-(--section-gap-s)">
      <div className="container grid gap-(--space-xl) md:grid-cols-12 md:gap-(--gap-columns)">
        <div className="md:col-span-5">
          <h2 className="reveal-head !text-paper">{dict.airlst.sectionHeader}</h2>
          <p className="reveal lead mt-(--space-lg) !text-paper" style={{ "--i": 1 } as React.CSSProperties}>{dict.airlst.disclaimer}</p>
          <p className="reveal mt-(--space-md) !text-paper-3" style={{ "--i": 2 } as React.CSSProperties}>{dict.airlst.metrics}</p>
        </div>
        <div
          data-slot="airlst-venue"
          data-alt=""
          className="screen relative aspect-[16/10] overflow-hidden rounded-card md:col-span-7 md:self-center"
        >
          <FadeImage src="/home/airlst.jpg" alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
        <ul className="mt-(--space-lg) grid auto-rows-min grid-cols-2 gap-x-(--gap-columns) border-t border-paper-3/40 md:col-span-12 md:grid-cols-5">
          {airlstClients.map((client, i) => (
            <li
              key={client}
              style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
              className="reveal-fade border-b border-paper-3/40 py-(--space-md) font-display text-(length:--text-title) leading-tight !text-paper"
            >
              {client}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
