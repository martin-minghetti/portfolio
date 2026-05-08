import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";

type Props = {
  dict: Dictionary;
};

export default function Footer({ dict }: Props) {
  const { columnAbout, columnWork, columnReach, legal, sourceLink } = dict.footer;

  return (
    <footer className="mt-[var(--spacing-32)] border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      <div className="mx-auto grid max-w-[var(--container-wide)] gap-[var(--spacing-12)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-20)] md:grid-cols-3">
        <section className="space-y-2 text-[var(--text-sm)] text-[var(--color-fg-muted)]">
          <h3 className="font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg)] text-[var(--text-xs)]">
            {columnAbout.heading}
          </h3>
          <p className="text-[var(--color-fg)]">{columnAbout.tagline}</p>
          <p>{columnAbout.stats}</p>
          <div className="pt-[var(--spacing-4)] space-y-1">
            <p>{columnAbout.location}</p>
            <p>{columnAbout.meta}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg)] text-[var(--text-xs)]">
            {columnWork.heading}
          </h3>
          <ul className="space-y-2 text-[var(--text-sm)] text-[var(--color-fg-muted)]">
            {columnWork.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg)] text-[var(--text-xs)]">
            {columnReach.heading}
          </h3>
          <ul className="space-y-2 text-[var(--text-sm)] text-[var(--color-fg-muted)]">
            {columnReach.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                  className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-[var(--container-wide)] flex-col gap-2 px-[clamp(16px,4vw,32px)] py-[var(--spacing-6)] text-[var(--text-xs)] text-[var(--color-fg-subtle)] md:flex-row md:justify-between">
          <p>{legal}</p>
          <a
            href="https://github.com/martin-minghetti/portfolio"
            target="_blank"
            rel="noreferrer noopener"
            className="uppercase tracking-[var(--tracking-wider)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg-muted)]"
          >
            [ {sourceLink} → ]
          </a>
        </div>
      </div>
    </footer>
  );
}
