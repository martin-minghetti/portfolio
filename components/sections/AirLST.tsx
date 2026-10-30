import type { Dictionary } from "@/lib/dictionaries";
import { airlstClients } from "@/lib/projects";
import FadeImage from "@/components/ui/FadeImage";

type Props = {
  dict: Dictionary;
};

export default function AirLST({ dict }: Props) {
  return (
    <section id="experience" className="bg-ink py-(--section-gap-s)">
      <div className="container grid gap-(--space-xl) md:grid-cols-12 md:gap-(--gap-columns)">
        <div className="md:col-span-5">
          <h2 className="reveal-head !text-paper">{dict.airlst.sectionHeader}</h2>
          <p className="reveal lead mt-(--space-lg) !text-paper" style={{ "--i": 1 } as React.CSSProperties}>{dict.airlst.disclaimer}</p>
        </div>
        <div
          data-slot="airlst-venue"
          data-alt=""
          className="screen relative aspect-[16/10] overflow-hidden rounded-card md:col-span-7 md:self-center"
        >
          <FadeImage src="/home/airlst.jpg" alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
        <div className="mt-(--space-lg) md:col-span-12">
          <p className="label !text-paper-3">{dict.airlst.clientsLabel}</p>
          <ul className="mt-(--space-md) grid grid-cols-2 gap-(--space-xs) sm:grid-cols-4 lg:grid-cols-7">
            {airlstClients.map((client, i) => (
              // The reveal transition lives on the li; hover lives on the inner box so the two don't override each other.
              <li key={client.name} style={{ "--i": Math.min(i, 8) } as React.CSSProperties} className="reveal-fade">
                <div
                  style={{ "--hover-bg": client.hoverBg ?? "var(--color-paper-hi)" } as React.CSSProperties}
                  className="group flex h-16 items-center justify-center rounded-xl px-(--space-sm) [transition:background-color_200ms_ease-out,box-shadow_300ms_ease-out,translate_300ms_cubic-bezier(0.2,0.8,0.2,1)] hover:bg-(--hover-bg) hover:shadow-lg motion-safe:hover:-translate-y-1 sm:h-24"
                >
                  {/* Logos come in their brand colors; the filter turns them white on the dark band and hover brings the color back on a light box. */}
                  <img
                    src={client.logo}
                    alt={client.name}
                    loading="lazy"
                    className={`max-h-9 max-w-[75%] object-contain opacity-80 [filter:brightness(0)_invert(1)] [transition:filter_200ms_ease-out,opacity_200ms_ease-out,scale_300ms_cubic-bezier(0.2,0.8,0.2,1)] group-hover:opacity-100 motion-safe:group-hover:scale-110 ${client.hoverBg ? "" : "group-hover:[filter:none]"}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
