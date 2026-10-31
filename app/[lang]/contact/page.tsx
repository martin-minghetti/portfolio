import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, type Locale } from "@/lib/i18n";
import ContactPageView from "./ContactPageView";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: `${lang === "es" ? "Contacto" : "Contact"} | Martín Minghetti`,
    alternates: alternates(lang, "/contact"),
  };
}

const labelsByLocale = {
  en: {
    title: "Let's talk.",
    lead: "Tell me what you need: a website, an online store or changes to the one you have. I'll send you a quote within 24 hours, no commitment.",
    whatsapp: "Message me on WhatsApp",
    toForm: "Or use the form",
    formTitle: "Send me a message",
    stepsTitle: "What happens next",
    steps: [
      "You tell me about your business and what you need.",
      "I reply within 24 hours with questions or a quote.",
      "If it works for you, we get started.",
    ],
  },
  es: {
    title: "Hablemos.",
    lead: "Contame qué necesitás: un sitio, una tienda online o cambios en el que ya tenés. Te paso presupuesto en 24 horas, sin compromiso.",
    whatsapp: "Escribime por WhatsApp",
    toForm: "O usá el formulario",
    formTitle: "Mandame un mensaje",
    stepsTitle: "Cómo sigue",
    steps: [
      "Me contás de tu negocio y qué necesitás.",
      "Te respondo en 24 horas con preguntas o un presupuesto.",
      "Si te sirve, arrancamos.",
    ],
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
