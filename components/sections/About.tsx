import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function About({ dict }: Props) {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
        <header className="space-y-[var(--spacing-4)]">
          <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
            {dict.about.sectionHeader}
          </h2>
        </header>

        <div className="mt-[var(--spacing-12)] grid gap-[var(--spacing-12)] lg:grid-cols-[280px_1fr]">
          <figure className="space-y-[var(--spacing-3)]">
            <div className="aspect-square w-full max-w-[280px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)]">
              {/* Placeholder until profile-cv.jpg is copied to /public in next session */}
              <div className="flex h-full w-full items-center justify-center text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                [ portrait ]
              </div>
            </div>
          </figure>

          <div className="space-y-[var(--spacing-6)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-fg)]">
            {dict.about.paragraphs.map((p, i) => (
              <p key={i} className={i > 0 ? "text-[var(--color-fg-muted)]" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <dl className="mt-[var(--spacing-16)] divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {dict.about.facts.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-1 gap-[var(--spacing-2)] py-[var(--spacing-3)] md:grid-cols-[200px_1fr] md:gap-[var(--spacing-6)]"
            >
              <dt className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
                {fact.label}
              </dt>
              <dd className="text-[var(--text-sm)] text-[var(--color-fg)]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
