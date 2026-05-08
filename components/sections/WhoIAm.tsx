import type { Dictionary } from "@/lib/dictionaries";
import Counter from "@/components/ui/Counter";

type Props = {
  dict: Dictionary;
};

export default function WhoIAm({ dict }: Props) {
  return (
    <section
      id="who"
      className="border-t border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
        <p className="text-sm uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
          {dict.whoIAm.lead}
        </p>

        <div className="mt-[var(--spacing-12)]">
          <ol className="flex flex-col gap-[var(--spacing-6)] md:hidden">
            {dict.whoIAm.timeline.map((entry) => (
              <li
                key={entry.year}
                className="border-l-2 border-[var(--color-accent)] pl-[var(--spacing-4)]"
              >
                <span className="block text-[var(--color-accent)] font-bold tracking-[var(--tracking-wider)]">
                  {entry.year}
                </span>
                <p className="mt-[var(--spacing-2)] text-sm leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
                  {entry.label}
                </p>
              </li>
            ))}
          </ol>

          <div className="hidden md:grid md:grid-cols-[repeat(4,1fr)] md:gap-[var(--spacing-2)]">
            {dict.whoIAm.timeline.map((entry, i) => (
              <div
                key={entry.year}
                className="relative pt-[var(--spacing-6)]"
              >
                <span className="absolute left-0 top-0 text-[var(--color-accent)] font-bold tracking-[var(--tracking-wider)]">
                  {entry.year}
                </span>
                <span className="absolute left-0 top-[36px] block h-[1px] w-full bg-[var(--color-border)]" />
                <span className="absolute left-0 top-[33px] block h-[7px] w-[7px] bg-[var(--color-accent)]" />
                <p className="mt-[var(--spacing-6)] text-sm leading-[var(--leading-relaxed)] text-[var(--color-fg-muted)]">
                  {entry.label}
                </p>
                {i === dict.whoIAm.timeline.length - 1 && (
                  <span className="absolute right-0 top-[33px] block h-[7px] w-[7px] bg-[var(--color-fg-subtle)]" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[var(--spacing-16)] flex flex-wrap items-center justify-center gap-x-[var(--spacing-6)] gap-y-[var(--spacing-3)] border-y border-[var(--color-border)] py-[var(--spacing-6)] text-center text-sm uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg)]">
          {dict.whoIAm.stats.map((stat, i) => (
            <span key={stat} className="flex items-center gap-x-[var(--spacing-6)]">
              <Counter value={stat} className="font-bold" />
              {i < dict.whoIAm.stats.length - 1 && (
                <span aria-hidden className="text-[var(--color-fg-subtle)]">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
