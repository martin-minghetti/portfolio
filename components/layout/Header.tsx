import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import StickyContactCta from "./StickyContactCta";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export default function Header({ locale, dict }: Props) {
  const otherLocale: Locale = locale === "en" ? "es" : "en";
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[var(--container-wide)] items-center justify-between px-[clamp(16px,4vw,32px)] py-4">
        <Link
          href={`/${locale}`}
          className="font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-sm)]"
        >
          MARTIN MINGHETTI<span className="text-[var(--color-accent)]">_</span>
        </Link>

        <nav className="flex items-center gap-6 text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-muted)]">
          <Link
            href={`/${otherLocale}`}
            className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg)]"
            aria-label={`Switch to ${otherLocale.toUpperCase()}`}
          >
            <span className="text-[var(--color-fg)]">{locale.toUpperCase()}</span>
            <span className="mx-2 text-[var(--color-fg-subtle)]">·</span>
            <span>{dict.nav.langSwitch}</span>
          </Link>
          <a
            href="https://github.com/martin-minghetti"
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg)]"
          >
            {dict.nav.github}
          </a>
          <StickyContactCta locale={locale} dict={dict} />
        </nav>
      </div>
    </header>
  );
}
