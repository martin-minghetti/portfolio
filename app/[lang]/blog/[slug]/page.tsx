import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, locales, ogLocale, type Locale } from "@/lib/i18n";
import Comments from "@/components/blog/Comments";
import CoverHero from "@/components/ui/CoverHero";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

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
  const image = post.image ?? ogImage(post.title);
  return {
    // Long titles go without the name so search results don't cut them.
    title: post.title.length > 45 ? post.title : `${post.title} | Martín Minghetti`,
    description: post.description,
    alternates: { ...alternates(lang, `/blog/${slug}`, postLanguages(slug)), types: { "application/rss+xml": `/${lang}/blog/feed.xml` } },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      locale: ogLocale[lang],
      publishedTime: post.date,
      authors: ["Martín Minghetti"],
      images: [post.image ? { url: image, width: 1344, height: 768 } : { url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [image] },
  };
}


function ogImage(title: string) {
  return `/api/og?title=${encodeURIComponent(title)}`;
}

// Only languages the post is actually written in get an hreflang.
function postLanguages(slug: string) {
  return locales.filter((l) => getPost(l, slug));
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
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: locale,
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${slug}`,
    image: `${SITE_URL}${post.image ?? ogImage(post.title)}`,
    author: { "@type": "Person", name: "Martín Minghetti", url: SITE_URL },
  });

  return (
    <article>
      <script type="application/ld+json">{jsonLd}</script>
      <div className="read-progress" aria-hidden />
      <CoverHero image={post.image} className="pt-(--space-2xl) pb-(--space-2xl)">
          <Link href={`/${locale}/blog`} className="tlink">
            {dict.blog.back}
          </Link>
          <p className="label mt-(--space-lg) !text-paper-3">
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time> · {post.minutes} {dict.blog.minutes}
          </p>
          <h1 className="mt-(--space-sm) max-w-[22ch] text-(length:--text-display-s) leading-[1.02]">{post.title}</h1>
      </CoverHero>

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
