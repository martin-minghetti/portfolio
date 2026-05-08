import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n";
import ContactPageView from "./ContactPageView";

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

  return <ContactPageView labels={labels} locale={locale} />;
}
