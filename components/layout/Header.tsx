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
    <header className="sticky top-0 z-(--z-sticky-nav) border-b border-rule bg-paper">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="whitespace-nowrap font-display text-lg tracking-(--tracking-display) no-underline sm:text-xl">
          Martin Minghetti
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href={`/${otherLocale}`}
            className="tlink"
            aria-label={`Switch to ${otherLocale.toUpperCase()}`}
          >
            {dict.nav.langSwitch}
          </Link>
          <Link href={`/${locale}/blog`} className="tlink">
            {dict.nav.blog}
          </Link>
          <a
            href="https://github.com/martin-minghetti"
            target="_blank"
            rel="noreferrer noopener"
            className="tlink hidden sm:inline-flex"
          >
            {dict.nav.github}
          </a>
          <StickyContactCta locale={locale} dict={dict} />
        </nav>
      </div>
    </header>
  );
}
