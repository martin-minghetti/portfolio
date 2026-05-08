import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function HowIThink({ dict }: Props) {
  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
        <header className="space-y-[var(--spacing-4)]">
          <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
            {dict.howIThink.sectionHeader}
          </h2>
          <p className="text-[var(--text-2xl)] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
            {dict.howIThink.sectionLead}
          </p>
        </header>

        <ol className="mt-[var(--spacing-12)] grid gap-[var(--spacing-6)] md:grid-cols-2">
          {dict.howIThink.items.map((item) => (
            <li
              key={item.index}
              className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]"
            >
              <p className="font-bold text-[var(--color-accent)]">
                <span aria-hidden>{"> "}</span>
                {item.index}
                <span className="caret ml-1">_</span>
              </p>
              <h3 className="mt-[var(--spacing-3)] text-[var(--text-lg)] font-bold leading-[var(--leading-snug)]">
                {item.heading}
              </h3>
              <p className="mt-[var(--spacing-3)] text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
