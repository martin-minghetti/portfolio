import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { alternates, isLocale, type Locale } from "@/lib/i18n";
import Hero from "@/components/sections/Hero";
import WhoIAm from "@/components/sections/WhoIAm";
import TrackSection from "@/components/sections/TrackSection";
import AirLST from "@/components/sections/AirLST";
import HowIThink from "@/components/sections/HowIThink";
import Stack from "@/components/sections/Stack";
import About from "@/components/sections/About";
import LiveBuildLog from "@/components/sections/LiveBuildLog";

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
      <TrackSection track="a" dict={dict} locale={locale} />
      <TrackSection track="b" dict={dict} locale={locale} />
      <WhoIAm dict={dict} />
      <AirLST dict={dict} />
      <HowIThink dict={dict} />
      <LiveBuildLog locale={locale} />
      <About dict={dict} />
      <Stack dict={dict} />
    </>
  );
}
