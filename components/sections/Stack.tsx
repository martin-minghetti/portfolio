import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function Stack({ dict }: Props) {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
        <header className="space-y-[var(--spacing-4)]">
          <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
            {dict.stack.sectionHeader}
          </h2>
          <p className="text-[var(--text-2xl)] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
            {dict.stack.sectionLead}
          </p>
        </header>

        <dl className="mt-[var(--spacing-12)] divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {dict.stack.rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-1 gap-[var(--spacing-2)] py-[var(--spacing-4)] md:grid-cols-[200px_1fr] md:gap-[var(--spacing-6)]"
            >
              <dt className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                {row.label}
              </dt>
              <dd className="text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-fg)]">
                {row.values}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
