import type { Dictionary } from "@/lib/dictionaries";
import { airlstClients } from "@/lib/projects";

type Props = {
  dict: Dictionary;
};

export default function AirLST({ dict }: Props) {
  const items = [...airlstClients, ...airlstClients];
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="mx-auto max-w-[var(--container-wide)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-20)]">
        <h2 className="text-xs font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
          {dict.airlst.sectionHeader}
        </h2>
      </div>

      <div className="marquee-container relative overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="marquee-track py-[var(--spacing-6)]">
          {items.map((client, i) => (
            <span
              key={`${client}-${i}`}
              className="shrink-0 px-[var(--spacing-8)] text-2xl font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg)]"
            >
              {client}
              <span className="ml-[var(--spacing-8)] text-[var(--color-fg-subtle)]">
                ·
              </span>
            </span>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--color-bg)] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--color-bg)] to-transparent"
        />
      </div>

      <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-12)] space-y-2 text-sm leading-[var(--leading-relaxed)]">
        <p className="text-[var(--color-fg)]">
          {dict.airlst.disclaimer.split(" — ")[0]}
          <span className="text-[var(--color-accent)]">
            {" — " + dict.airlst.disclaimer.split(" — ")[1]}
          </span>
        </p>
        <p className="text-[var(--color-fg-muted)]">{dict.airlst.metrics}</p>
      </div>
    </section>
  );
}
