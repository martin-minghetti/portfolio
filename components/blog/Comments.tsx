"use client";

import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n";

// Giscus keeps the comments in the Discussions of this repo, one thread per post and language.
const config = {
  "data-repo": "martin-minghetti/portfolio",
  "data-repo-id": "R_kgDOSXe68g",
  "data-category": "Announcements",
  "data-category-id": "DIC_kwDOSXe68s4DJnw_",
  "data-mapping": "pathname",
  "data-strict": "1",
  "data-reactions-enabled": "1",
  "data-emit-metadata": "0",
  "data-input-position": "top",
  "data-theme": "light",
  "data-loading": "lazy",
};

export default function Comments({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    for (const [key, value] of Object.entries({ ...config, "data-lang": locale })) {
      script.setAttribute(key, value);
    }
    host.appendChild(script);
    return () => {
      host.innerHTML = "";
    };
  }, [locale]);

  return <div ref={ref} />;
}
