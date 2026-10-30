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
              <li
                key={client.name}
                style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
                className="reveal-fade group flex h-16 items-center justify-center rounded-xl px-(--space-sm) [transition:background-color_150ms_ease-out,box-shadow_300ms_ease-out,transform_300ms_cubic-bezier(0.2,0.8,0.2,1)] hover:bg-paper-hi hover:shadow-lg motion-safe:hover:-translate-y-1 sm:h-24"
              >
                {/* Logos come in their brand colors; the filter turns them white on the dark band and hover brings the color back on a light cell. */}
                <img
                  src={client.logo}
                  alt={client.name}
                  loading="lazy"
                  className="max-h-9 max-w-[75%] object-contain opacity-80 [transition:filter_120ms_ease-out,opacity_120ms_ease-out,transform_300ms_cubic-bezier(0.2,0.8,0.2,1)] [filter:brightness(0)_invert(1)] group-hover:opacity-100 group-hover:[filter:none] motion-safe:group-hover:scale-110"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
