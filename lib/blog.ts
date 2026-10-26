import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Locale } from "./i18n";

const DIR = path.join(process.cwd(), "content/blog");

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  order: number;
  html: string;
};

function read(file: string, locale: Locale): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const [, front, body] = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  const meta = Object.fromEntries(
    front.split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
  );
  return {
    slug: file.replace(`.${locale}.md`, ""),
    title: meta.title,
    date: meta.date,
    description: meta.description,
    order: Number(meta.order),
    // Posts are our own files in the repo, never user input.
    html: marked.parse(body, { async: false }),
  };
}

// Newest first. A post exists in a language only if its file does.
export function getPosts(locale: Locale): Post[] {
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(`.${locale}.md`))
    .map((file) => read(file, locale))
    .sort((a, b) => b.order - a.order);
}

export function getPost(locale: Locale, slug: string): Post | undefined {
  return getPosts(locale).find((post) => post.slug === slug);
}

export function formatDate(date: string, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === "es" ? "es-AR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
