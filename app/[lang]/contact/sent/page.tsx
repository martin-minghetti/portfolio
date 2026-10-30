import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";

export const metadata: Metadata = { robots: { index: false } };

const copyByLocale = {
  en: {
    h1: "Message sent.",
    body: "I'll reply within 24h, usually faster.",
    waitTitle: "While you wait:",
    waitItems: [
      { label: "See the sample sites", href: "/en#track-a" },
      {
        label: "Open the GitHub",
        href: "https://github.com/martin-minghetti",
      },
    ],
    back: "Back to home",
  },
  es: {
    h1: "Mensaje enviado.",
    body: "Te respondo en 24h, normalmente antes.",
    waitTitle: "Mientras esperás:",
    waitItems: [
      { label: "Mirá los sitios de muestra", href: "/es#track-a" },
      {
        label: "Abrí el GitHub",
        href: "https://github.com/martin-minghetti",
      },
    ],
    back: "Volver al inicio",
  },
} as const;

export default async function ContactSentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const copy = copyByLocale[locale];

  return (
    <section>
      <div className="container py-(--space-3xl)">
        <h1>{copy.h1}</h1>
        <p className="lead mt-(--space-lg)">{copy.body}</p>

        <p className="label mt-(--space-2xl)">{copy.waitTitle}</p>
        <ul className="set mt-(--space-xs) max-w-[480px]">
          {copy.waitItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="tlink w-full"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <Link href={`/${locale}`} className="btn btn--primary mt-(--space-2xl)">
          {copy.back}
        </Link>
      </div>
    </section>
  );
}
