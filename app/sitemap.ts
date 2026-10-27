import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getPost, getPosts } from "@/lib/blog";

const BASE = "https://martin-minghetti.vercel.app";

const ROUTES = ["", "/contact", "/blog"] as const;

const languages = (path: string, langs: readonly string[] = locales) =>
  Object.fromEntries(langs.map((alt) => [alt, `${BASE}/${alt}${path}`]));

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of ROUTES) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.6,
        alternates: { languages: languages(route) },
      });
    }
  }

  for (const locale of locales) {
    for (const post of getPosts(locale)) {
      const path = `/blog/${post.slug}`;
      entries.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: new Date(post.date),
        changeFrequency: "yearly",
        priority: 0.7,
        alternates: { languages: languages(path, locales.filter((l) => getPost(l, post.slug))) },
      });
    }
  }

  return entries;
}
