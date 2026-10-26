import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getPosts } from "@/lib/blog";

const BASE = "https://martin-minghetti.vercel.app";

const ROUTES = ["", "/contact", "/contact/sent", "/blog"] as const;

const ES_ONLY_ROUTES = [
  "/tiendanube/ocultar-envios-y-pagos/privacidad",
  "/tiendanube/ocultar-envios-y-pagos/soporte",
] as const;

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

  for (const locale of locales) {
    for (const post of getPosts(locale)) {
      entries.push({
        url: `${BASE}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }
  }

  for (const route of ES_ONLY_ROUTES) {
    entries.push({
      url: `${BASE}/es${route}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  return entries;
}
