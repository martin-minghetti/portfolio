import type { Dictionary } from "@/lib/dictionaries";
import { airlstClients } from "@/lib/projects";

type Props = {
  dict: Dictionary;
};

// The one section that breaks the split: a full field of the accent, the clients set as large as the page allows.
export default function AirLST({ dict }: Props) {
  return (
    <section className="airlst">
      <div className="container">
        <div className="grid gap-(--space-lg) md:grid-cols-2 md:gap-(--space-3xl)">
          <h2 className="reveal-head">{dict.airlst.sectionHeader}</h2>
          <div>
            <p className="reveal lead">{dict.airlst.disclaimer}</p>
            <p className="reveal mt-(--space-md)" style={{ "--i": 1 } as React.CSSProperties}>{dict.airlst.metrics}</p>
          </div>
        </div>
        <ul className="airlst-clients">
          {airlstClients.map((client, i) => (
            <li key={client} className="reveal-fade" style={{ "--i": Math.min(i, 8) } as React.CSSProperties}>
              {client}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
