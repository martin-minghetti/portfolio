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
      className={`hidden md:inline-block border border-[var(--color-accent)] bg-transparent px-3 py-1.5 font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {dict.nav.contact} →
    </Link>
  );
}
