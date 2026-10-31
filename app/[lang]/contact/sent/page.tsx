import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import CTAButton from "@/components/ui/CTAButton";
import CoverHero from "@/components/ui/CoverHero";
import FadeImage from "@/components/ui/FadeImage";

export const metadata: Metadata = { robots: { index: false } };

const copyByLocale = {
  en: {
    h1: "Message sent.",
    body: "I'll reply within 24 hours, usually sooner. If it's urgent, message me on WhatsApp.",
    whatsapp: "Message me on WhatsApp",
    back: "Back to home",
    waitTitle: "While you wait",
    waitItems: [
      { label: "Sample sites and stores", text: "Working shops and booking sites, with payments.", href: "/en#track-a", image: "/projects/bosque.jpg" },
      { label: "A proposed redesign", text: "Before and after of a real hostel's website.", href: "/en/redesigns/italia-inn", image: "/projects/italia-inn/despues-desktop.jpg" },
      { label: "The blog", text: "Notes on building with AI, explained simply.", href: "/en/blog", image: "/blog/blog.jpg" },
    ],
  },
  es: {
    h1: "Mensaje enviado.",
    body: "Te respondo en 24 horas, normalmente antes. Si es urgente, escribime por WhatsApp.",
    whatsapp: "Escribime por WhatsApp",
    back: "Volver al inicio",
    waitTitle: "Mientras esperás",
    waitItems: [
      { label: "Sitios y tiendas de muestra", text: "Tiendas y sitios de reservas que funcionan, con pagos.", href: "/es#track-a", image: "/projects/bosque.jpg" },
      { label: "Un rediseño propuesto", text: "El antes y el después del sitio de un hostel real.", href: "/es/redesigns/italia-inn", image: "/projects/italia-inn/despues-desktop.jpg" },
      { label: "El blog", text: "Notas sobre cómo construir con IA, explicadas simple.", href: "/es/blog", image: "/blog/blog.jpg" },
    ],
  },
} as const;

export default async function ContactSentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const copy = copyByLocale[locale];

  return (
    <>
      <CoverHero image="/contact/hero.jpg" className="pt-(--space-3xl) pb-(--space-2xl)">
        <h1 className="max-w-none text-(length:--text-display) leading-[0.98]">{copy.h1}</h1>
        <p className="lead mt-(--space-lg) max-w-[38ch] !text-paper-hi">{copy.body}</p>
        <div className="flex flex-wrap items-center gap-(--space-lg) pt-(--space-xl)">
          <Link href={`/${locale}`} className="btn btn--primary">
            {copy.back}
          </Link>
          <CTAButton href="https://wa.me/5492241622290" external variant="outline" className="!border-paper-hi !text-paper-hi">
            {copy.whatsapp}
          </CTAButton>
        </div>
      </CoverHero>

      <section className="py-(--section-gap-s)">
        <div className="container">
          <h2 className="text-(length:--text-title) leading-tight">{copy.waitTitle}</h2>
          <ul className="mt-(--space-lg) grid gap-(--space-lg) md:grid-cols-3 md:gap-(--gap-columns)">
            {copy.waitItems.map((item) => (
              <li key={item.href} className="reveal">
                <Link href={item.href} className="group block no-underline">
                  <span className="screen relative block aspect-[16/9] overflow-hidden rounded-card">
                    <FadeImage src={item.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-top" />
                  </span>
                  <span className="mt-(--space-md) block font-display text-(length:--text-title) leading-tight text-ink transition-colors duration-(--dur-short) ease-(--ease-out) group-hover:text-accent">
                    {item.label}
                  </span>
                  <span className="mt-(--space-xs) block">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
