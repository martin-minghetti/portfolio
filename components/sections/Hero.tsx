import type { Dictionary } from "@/lib/dictionaries";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  dict: Dictionary;
};

export default function Hero({ dict }: Props) {
  return (
    <section className="hero-ground">
      <div className="container pt-(--space-3xl) pb-(--space-2xl)">
        <h1 className="max-w-none text-(length:--text-display) leading-[0.98]">
          <span className="line"><span className="keep-motion">{dict.hero.h1Line1}</span></span>
          <span className="line"><span className="keep-motion">{dict.hero.h1Line2}</span></span>
          <span className="line"><span className="keep-motion">{dict.hero.h1Line3}</span></span>
        </h1>

        <div className="mt-(--space-2xl) grid gap-(--space-xl) md:grid-cols-2 md:gap-(--gap-columns)">
          <article className="sheet keep-motion flex flex-col p-(--space-lg) md:p-(--space-xl)">
            <h2 className="text-(length:--text-title) leading-tight">{dict.hero.trackA.label}</h2>
            <p className="mt-(--space-sm)">{dict.hero.trackA.tagline}</p>
            <div className="mt-auto pt-(--space-lg)">
              <CTAButton href="https://wa.me/5492241622290" external className="w-full sm:w-auto">
                {dict.hero.trackA.cta}
              </CTAButton>
            </div>
          </article>

          <article className="sheet keep-motion flex flex-col p-(--space-lg) md:p-(--space-xl)">
            <h2 className="text-(length:--text-title) leading-tight">{dict.hero.trackB.label}</h2>
            <p className="mt-(--space-sm)">{dict.hero.trackB.tagline}</p>
            <div className="mt-auto pt-(--space-lg)">
              <CTAButton
                href="https://cal.com/martin-minghetti"
                external
                variant="outline"
                className="w-full sm:w-auto"
              >
                {dict.hero.trackB.cta}
              </CTAButton>
            </div>
          </article>
        </div>

        <p className="hero-hint keep-motion mt-(--space-xl)">
          <a href="#track-a" className="tlink">
            {dict.hero.scrollHint}
          </a>
        </p>
      </div>
    </section>
  );
}
