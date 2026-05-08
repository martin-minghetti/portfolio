"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  dict: Dictionary;
};

export default function StickyContactCta({ locale, dict }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href={`/${locale}/contact`}
      className={`border border-[var(--color-fg)] px-3 py-1.5 uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)] ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {dict.nav.contact} →
    </Link>
  );
}
