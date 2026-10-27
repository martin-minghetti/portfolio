import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LenisProvider from "@/components/layout/LenisProvider";
import ScrollEffects from "@/components/layout/ScrollEffects";
import { getDictionary } from "@/lib/dictionaries";
import { isLocale, locales, ogLocale, type Locale } from "@/lib/i18n";
import "../globals.css";
import { SITE_URL } from "@/lib/site";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const meta = {
  en: {
    title: "Martín Minghetti, web developer",
    description:
      "Web developer based in Bariloche, Argentina. Seven and a half years building event sites at AirLST (Munich). Now I make my own projects with the help of AI agents.",
    social:
      "Websites and apps, built with the help of AI. Seven and a half years of frontend at AirLST. Based in Bariloche, Argentina.",
  },
  es: {
    title: "Martín Minghetti, desarrollador web",
    description:
      "Desarrollador web en Bariloche, Argentina. Siete años y medio haciendo sitios de eventos en AirLST (Múnich). Ahora hago mis propios proyectos con ayuda de agentes de IA.",
    social:
      "Sitios web y apps, hechos con ayuda de IA. Siete años y medio de frontend en AirLST. En Bariloche, Argentina.",
  },
} as const;

// Site-wide defaults per language. Pages override title, description, alternates and social cards.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = meta[lang];
  return {
    title: m.title,
    description: m.description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: m.title,
      description: m.social,
      type: "website",
      siteName: "Martin Minghetti",
      locale: ogLocale[lang],
      images: [{ url: "/api/og", width: 1200, height: 630, alt: m.title }],
    },
    twitter: { card: "summary_large_image", title: m.title, description: m.social, images: ["/api/og"] },
  };
}

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Martin Minghetti",
  alternateName: "Martín Minghetti",
  jobTitle: "Web developer",
  url: SITE_URL,
  alumniOf: {
    "@type": "Organization",
    name: "AirLST GmbH",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Munich",
      addressCountry: "DE",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bariloche",
    addressRegion: "Río Negro",
    addressCountry: "AR",
  },
  nationality: { "@type": "Country", name: "Iceland" },
  knowsLanguage: ["es", "en", "is", "de"],
  sameAs: [
    "https://github.com/martin-minghetti",
    "https://www.linkedin.com/in/martin-minghetti",
    "https://cal.com/martin-minghetti",
  ],
});

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} className={bricolage.variable}>
      <head>
        <script type="application/ld+json">{personJsonLd}</script>
      </head>
      <body>
        <LenisProvider>
          <Header locale={locale} dict={dict} />
          <main className="min-h-screen">{children}</main>
          <Footer dict={dict} />
        </LenisProvider>
        <ScrollEffects />
      </body>
    </html>
  );
}
