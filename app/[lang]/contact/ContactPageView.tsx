import type { Locale } from "@/lib/i18n";
import ContactForm from "@/components/sections/ContactForm";
import CTAButton from "@/components/ui/CTAButton";

type TrackBlockData = {
  heading: string;
  tagline: string;
  cta: string;
  ctaHref: string;
  orForm: string;
};

type Labels = {
  sectionHeader: string;
  lead: string;
  trackA: TrackBlockData;
  trackB: TrackBlockData;
};

export default function ContactPageView({
  labels,
  locale,
}: {
  labels: Labels;
  locale: Locale;
}) {
  return (
    <>
      <section className="proof">
        <div className="container pt-(--space-3xl) pb-(--space-2xl)">
        <header className="grid gap-(--space-lg) md:grid-cols-12 md:gap-(--gap-columns)">
          <h1 className="md:col-span-7">{labels.sectionHeader}</h1>
          <p className="lead md:col-span-5 md:col-start-8 md:self-end">{labels.lead}</p>
        </header>

        <div className="mt-(--space-2xl) grid gap-(--space-xl) md:grid-cols-2 md:gap-(--gap-columns)">
          <TrackBlock data={labels.trackA} primary />
          <TrackBlock data={labels.trackB} />
        </div>

        </div>
      </section>

      <section className="border-t border-ink py-(--section-gap-s)">
        <div className="container">
          <div className="max-w-[640px]">
            <ContactForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}

function TrackBlock({ data, primary }: { data: TrackBlockData; primary?: boolean }) {
  return (
    <article className="crop sheet flex flex-col p-(--space-lg) md:p-(--space-xl)">
      <h2 className="text-(length:--text-title) leading-tight">{data.heading}</h2>
      <p className="mt-(--space-sm)">{data.tagline}</p>
      <div className="mt-auto pt-(--space-lg)">
        <CTAButton href={data.ctaHref} external variant={primary ? "primary" : "outline"}>
          {data.cta}
        </CTAButton>
      </div>
      <p className="label mt-(--space-md)">{data.orForm}</p>
    </article>
  );
}
