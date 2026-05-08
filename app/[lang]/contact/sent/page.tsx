import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

const copyByLocale = {
  en: {
    h1: "MESSAGE SENT.",
    body: "I'll reply within 24h, usually faster.",
    waitTitle: "While you wait:",
    waitItems: [
      { label: "Read a build log", href: "/en#build-log" },
      { label: "See the projects", href: "/en#track-a" },
      {
        label: "Open the GitHub",
        href: "https://github.com/martin-minghetti",
      },
    ],
    back: "Back to home",
  },
  es: {
    h1: "MENSAJE ENVIADO.",
    body: "Te respondo en 24h, normalmente antes.",
    waitTitle: "Mientras esperás:",
    waitItems: [
      { label: "Leé un build log", href: "/es#build-log" },
      { label: "Mirá los proyectos", href: "/es#track-a" },
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
    <div className="mx-auto max-w-[var(--container-narrow)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-32)]">
      <h1 className="text-[var(--text-3xl)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
        {copy.h1}
      </h1>
      <p className="mt-[var(--spacing-6)] text-[var(--text-lg)] leading-[var(--leading-relaxed)] text-[var(--color-fg)]">
        {copy.body}
      </p>

      <hr className="my-[var(--spacing-12)] border-[var(--color-border)]" />

      <p className="text-[var(--text-xs)] uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
        {copy.waitTitle}
      </p>
      <ul className="mt-[var(--spacing-4)] space-y-[var(--spacing-2)] text-[var(--text-sm)]">
        {copy.waitItems.map((item) => (
          <li key={item.label} className="flex gap-2">
            <span className="text-[var(--color-accent)]">→</span>
            <a
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={
                item.href.startsWith("http") ? "noreferrer noopener" : undefined
              }
              className="text-[var(--color-fg-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-fg)]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <Link
        href={`/${locale}`}
        className="mt-[var(--spacing-12)] inline-block border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
      >
        [ ← {copy.back} ]
      </Link>
    </div>
  );
}
