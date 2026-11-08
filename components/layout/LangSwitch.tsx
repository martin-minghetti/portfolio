"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

// Switching language remounts the whole [lang] layout, so no view transition fires and React
// resets attributes on <html>. The motion is played here with the Web Animations API instead,
// same feel as a page change: the content fades and rises out, the new one fades and rises in.
const OUT_MS = 200;
const flag = () => window as Window & { __langSwitching?: boolean };
const ease = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "ease";

export default function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const other: Locale = locale === "en" ? "es" : "en";
  const href = `/${other}${(usePathname() ?? "").replace(new RegExp(`^/${locale}(?=/|$)`), "")}`;

  useEffect(() => {
    if (!flag().__langSwitching) return;
    flag().__langSwitching = false;
    const main = document.querySelector("main");
    if (!main) return;
    main.getAnimations().forEach((a) => a.cancel());
    main.animate(
      [{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }],
      { duration: 460, easing: ease("--ease-out"), fill: "backwards" },
    );
  }, [locale]);

  function onClick(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // new tab etc: plain link
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    e.preventDefault();
    flag().__langSwitching = true;
    main.animate([{ opacity: 0, transform: "translateY(-8px)" }], { duration: OUT_MS, easing: ease("--ease-in"), fill: "forwards" })
      .finished.then(() => router.push(href));
  }

  return (
    <Link href={href} onClick={onClick} className="tlink" aria-label={`Switch to ${other.toUpperCase()}`}>
      {label}
    </Link>
  );
}
