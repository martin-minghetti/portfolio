import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import Comments from "@/components/blog/Comments";
import { formatDate, getPost, getPosts } from "@/lib/blog";

export function generateStaticParams() {
  return locales.flatMap((lang) => getPosts(lang).map((post) => ({ lang, slug: post.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = getPost(lang, slug);
  if (!post) return {};
  return {
    title: `${post.title} | Martín Minghetti`,
    description: post.description,
    openGraph: { type: "article", title: post.title, description: post.description },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const post = getPost(locale, slug);
  if (!post) notFound();
  const dict = await getDictionary(locale);

  return (
    <article>
      <div className="read-progress" aria-hidden />
      <header className="hero-ground">
        <div className="container pt-(--space-2xl) pb-(--space-2xl)">
          <Link href={`/${locale}/blog`} className="tlink">
            {dict.blog.back}
          </Link>
          <p className="label mt-(--space-lg) !text-paper-3">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </p>
          <h1 className="mt-(--space-sm) max-w-[22ch] text-(length:--text-display-s) leading-[1.02]">{post.title}</h1>
        </div>
      </header>

      <div className="container py-(--section-gap-s)">
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        <section className="mt-(--space-3xl) max-w-[66ch] border-t border-ink pt-(--space-xl)">
          <h2 className="text-(length:--text-title)">{dict.blog.comments}</h2>
          <p className="label mt-(--space-xs)">{dict.blog.commentsHint}</p>
          <div className="mt-(--space-lg)">
            <Comments locale={locale} />
          </div>
        </section>
        <Link href={`/${locale}/blog`} className="tlink mt-(--space-2xl)">
          {dict.blog.back}
        </Link>
      </div>
    </article>
  );
}
