"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

// Same page in the other language: every route under [lang] exists in both locales.
export default function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const other: Locale = locale === "en" ? "es" : "en";
  const rest = (usePathname() ?? "").replace(new RegExp(`^/${locale}(?=/|$)`), "");
  return (
    <Link href={`/${other}${rest}`} className="tlink" aria-label={`Switch to ${other.toUpperCase()}`}>
      {label}
    </Link>
  );
}
