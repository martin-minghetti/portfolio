"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import CTAButton from "@/components/ui/CTAButton";

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
    <div
      className={`hidden md:inline-block transition-opacity duration-300 ease-out ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <CTAButton href={`/${locale}/contact`}>{dict.nav.contact}</CTAButton>
    </div>
  );
}
