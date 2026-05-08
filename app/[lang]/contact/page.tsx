import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import ContactForm from "@/components/sections/ContactForm";

const labelsByLocale = {
  en: {
    sectionHeader: "LET'S WORK",
    lead: "Two ways to reach me. Pick whichever feels right.",
    trackA: {
      heading: "TRACK A · WEBSITE OR FULLSTACK",
      tagline:
        "WhatsApp is fastest. Tell me what you need, I'll send a quote within 24h. No commitment.",
      cta: "Hablemos por WhatsApp",
      ctaHref: "https://wa.me/5492241622290",
      orForm: "Or use the form below.",
    },
    trackB: {
      heading: "TRACK B · AI ENGINEERING",
      tagline:
        "Book 30 minutes on my calendar. Bring a use case, a stack, or a hiring brief.",
      cta: "Book a 30min intro",
      ctaHref: "https://cal.com/martin-minghetti",
      orForm: "Or use the form below.",
    },
  },
  es: {
    sectionHeader: "TRABAJEMOS",
    lead: "Dos formas de contactarme. Elegí la que te sirva.",
    trackA: {
      heading: "TRACK A · SITIO O FULLSTACK",
      tagline:
        "WhatsApp es lo más rápido. Contame qué necesitás, te paso presupuesto en 24h. Sin compromiso.",
      cta: "Hablemos por WhatsApp",
      ctaHref: "https://wa.me/5492241622290",
      orForm: "O usá el formulario abajo.",
    },
    trackB: {
      heading: "TRACK B · AI ENGINEERING",
      tagline:
        "Reservá 30 minutos en mi calendario. Traé un caso de uso, un stack, o un brief de hiring.",
      cta: "Reservá 30 minutos",
      ctaHref: "https://cal.com/martin-minghetti",
      orForm: "O usá el formulario abajo.",
    },
  },
} as const;

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  await getDictionary(locale);
  const labels = labelsByLocale[locale];

  return (
    <div className="mx-auto max-w-[var(--container-default)] px-[clamp(16px,4vw,32px)] py-[var(--spacing-24)]">
      <header className="space-y-[var(--spacing-4)]">
        <h1 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-accent)]">
          {labels.sectionHeader}
        </h1>
        <p className="text-[var(--text-2xl)] leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
          {labels.lead}
        </p>
      </header>

      <div className="mt-[var(--spacing-12)] grid gap-[var(--spacing-6)] md:grid-cols-2">
        <TrackBlock data={labels.trackA} />
        <TrackBlock data={labels.trackB} />
      </div>

      <hr className="my-[var(--spacing-16)] border-[var(--color-border)]" />

      <ContactForm locale={locale} />
    </div>
  );
}

type TrackBlockData = {
  heading: string;
  tagline: string;
  cta: string;
  ctaHref: string;
  orForm: string;
};

function TrackBlock({ data }: { data: TrackBlockData }) {
  return (
    <article className="border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-[var(--spacing-8)]">
      <h2 className="text-[var(--text-xs)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-muted)]">
        {data.heading}
      </h2>
      <p className="mt-[var(--spacing-4)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-fg)]">
        {data.tagline}
      </p>
      <a
        href={data.ctaHref}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-[var(--spacing-6)] inline-block border-2 border-[var(--color-fg)] px-[var(--spacing-6)] py-[var(--spacing-3)] font-bold uppercase tracking-[var(--tracking-widest)] text-[var(--text-xs)] text-[var(--color-fg)] transition-all duration-[var(--duration-instant)] ease-[var(--ease-snap)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-accent)]"
      >
        [ {data.cta} → ]
      </a>
      <p className="mt-[var(--spacing-4)] text-[var(--text-xs)] uppercase tracking-[var(--tracking-wider)] text-[var(--color-fg-subtle)]">
        {data.orForm}
      </p>
    </article>
  );
}
