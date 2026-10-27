import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, type Locale } from "@/lib/i18n";
import { formatDate, getPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const title = `${dict.blog.title} | Martín Minghetti`;
  return {
    title,
    description: dict.blog.lead,
    alternates: { ...alternates(lang, "/blog"), types: { "application/rss+xml": `/${lang}/blog/feed.xml` } },
    openGraph: { type: "website", title, description: dict.blog.lead, images: ["/api/og?title=Blog"] },
    twitter: { card: "summary_large_image", title, description: dict.blog.lead, images: ["/api/og?title=Blog"] },
  };
}

export default async function BlogIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const posts = getPosts(locale);

  return (
    <>
      <section className="hero-ground">
        <div className="container pt-(--space-3xl) pb-(--space-2xl)">
          <h1 className="max-w-none text-(length:--text-display) leading-[0.98]">{dict.blog.title}</h1>
          <p className="lead mt-(--space-lg) !text-paper-hi">{dict.blog.lead}</p>
          <a href={`/${locale}/blog/feed.xml`} className="tlink mt-(--space-md) !text-paper-hi">
            {dict.blog.rss}
          </a>
        </div>
      </section>

      <section className="py-(--section-gap-s)">
        <div className="container">
          {posts.length === 0 ? (
            <p>{dict.blog.empty}</p>
          ) : (
            <ol className="set">
              {posts.map((post) => (
                <li key={post.slug} className="reveal">
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group grid gap-(--space-sm) py-(--space-xl) no-underline md:grid-cols-12 md:gap-(--gap-columns)"
                  >
                    <span className="label md:col-span-3">
                      <time dateTime={post.date}>{formatDate(post.date, locale)}</time> · {post.minutes} {dict.blog.minutes}
                    </span>
                    <span className="md:col-span-6">
                      <span className="block font-display text-(length:--text-display-s) leading-[1.02] text-ink transition-colors duration-(--dur-short) ease-(--ease-out) group-hover:text-accent">
                        {post.title}
                      </span>
                      <span className="mt-(--space-md) block text-(length:--text-lead) text-ink-2">{post.description}</span>
                    </span>
                    <span className="tlink self-start md:col-span-3 md:justify-self-end">{dict.blog.read}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </>
  );
}
