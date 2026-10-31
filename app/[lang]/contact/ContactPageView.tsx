import type { Locale } from "@/lib/i18n";
import ContactForm from "@/components/sections/ContactForm";
import CTAButton from "@/components/ui/CTAButton";
import CoverHero from "@/components/ui/CoverHero";

type Labels = {
  title: string;
  lead: string;
  whatsapp: string;
  toForm: string;
  formTitle: string;
  stepsTitle: string;
  steps: readonly string[];
};

export default function ContactPageView({ labels, locale }: { labels: Labels; locale: Locale }) {
  return (
    <>
      <CoverHero image="/contact/hero.jpg" className="pt-(--space-3xl) pb-(--space-2xl)">
        <h1 className="max-w-none text-(length:--text-display) leading-[0.98]">{labels.title}</h1>
        <p className="lead mt-(--space-lg) max-w-[38ch] !text-paper-hi">{labels.lead}</p>
        <div className="flex flex-wrap items-center gap-(--space-lg) pt-(--space-xl)">
          <CTAButton href="https://wa.me/5492241622290" external variant="primary">
            {labels.whatsapp}
          </CTAButton>
          <a href="#form" className="tlink !text-paper-hi">
            {labels.toForm}
          </a>
        </div>
      </CoverHero>

      <section id="form" className="py-(--section-gap-s)">
        <div className="container grid gap-(--space-2xl) md:grid-cols-12 md:gap-(--gap-columns)">
          <div className="sheet reveal p-(--space-lg) md:col-span-7 md:p-(--space-xl)">
            <h2 className="text-(length:--text-title) leading-tight">{labels.formTitle}</h2>
            <div className="mt-(--space-lg)">
              <ContactForm locale={locale} />
            </div>
          </div>

          <aside className="reveal md:sticky md:top-(--space-3xl) md:col-span-4 md:col-start-9 md:self-start">
            <h2 className="text-(length:--text-title) leading-tight">{labels.stepsTitle}</h2>
            <ol className="mt-(--space-lg) space-y-(--space-lg)">
              {labels.steps.map((step, i) => (
                <li key={step} className="grid grid-cols-[1.25rem_1fr] gap-(--space-md)">
                  <span className="font-display text-(length:--text-title) leading-none text-accent">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}
