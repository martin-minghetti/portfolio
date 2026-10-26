import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import { formatDate, getPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.blog.title} | Martín Minghetti`, description: dict.blog.lead };
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
        </div>
      </section>

      <section className="py-(--section-gap-s)">
        <div className="container">
          {posts.length === 0 ? (
            <p>{dict.blog.empty}</p>
          ) : (
            <ol className="set">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="group grid gap-(--space-sm) py-(--space-xl) no-underline md:grid-cols-12 md:gap-(--gap-columns)"
                  >
                    <span className="label md:col-span-3">
                      <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
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
