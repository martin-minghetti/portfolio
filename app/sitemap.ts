import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const BASE = "https://martin-minghetti.vercel.app";

const ROUTES = ["", "/contact", "/contact/sent"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of ROUTES) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        lastModified: now,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((alt) => [alt, `${BASE}/${alt}${route}`]),
          ),
        },
      });
    }
  }

  return entries;
}
