import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import type { Locale } from "./i18n";

const DIR = path.join(process.cwd(), "content/blog");

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Code blocks are colored at build time, so the page ships no highlighting script.
const markdown = new Marked({
  renderer: {
    code({ text, lang }) {
      const html = lang && hljs.getLanguage(lang) ? hljs.highlight(text, { language: lang }).value : escapeHtml(text);
      return `<pre><code class="hljs">${html}</code></pre>\n`;
    },
  },
});

export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  order: number;
  draft: boolean;
  minutes: number;
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
    draft: meta.draft === "true",
    // ~200 words per minute; figures and code count as text, close enough.
    minutes: Math.max(1, Math.round(body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 200)),
    // Posts are our own files in the repo, never user input.
    html: markdown.parse(body, { async: false }),
  };
}

// Newest first. A post exists in a language only if its file does.
export function getPosts(locale: Locale): Post[] {
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(`.${locale}.md`))
    .map((file) => read(file, locale))
    // Drafts show up in dev only, so a post can be reviewed before it goes live.
    .filter((post) => !post.draft || process.env.NODE_ENV !== "production")
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
