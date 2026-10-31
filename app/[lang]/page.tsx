import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, type Locale } from "@/lib/i18n";
import Hero from "@/components/sections/Hero";
import TrackSection from "@/components/sections/TrackSection";
import AirLST from "@/components/sections/AirLST";
import Redesigns from "@/components/sections/Redesigns";
import Stack from "@/components/sections/Stack";
import About from "@/components/sections/About";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: alternates(lang, "") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Hero dict={dict} />
      <Redesigns dict={dict} locale={locale} />
      <TrackSection dict={dict} locale={locale} />
      <AirLST dict={dict} />
      <About dict={dict} />
      <Stack dict={dict} />
    </>
  );
}
