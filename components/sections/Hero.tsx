import type { Dictionary } from "@/lib/dictionaries";
import CTAButton from "@/components/ui/CTAButton";
import FadeImage from "@/components/ui/FadeImage";

type Props = {
  dict: Dictionary;
};

export default function Hero({ dict }: Props) {
  return (
    <>
    <section className="hero-ground relative overflow-hidden !bg-[rgb(4_10_40)]">
      {/* Phone: the picture on top, title below. Wider: the picture fills the right side and fades into navy under the title. */}
      <div className="absolute inset-x-0 top-0 aspect-[16/9] md:inset-y-0 md:left-[34%] md:aspect-auto">
        <FadeImage src="/home/hero.jpg" alt="" fill priority sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(4_10_40)_100%)] md:bg-[linear-gradient(90deg,rgb(4_10_40)_0%,rgb(4_10_40/0.55)_30%,transparent_60%)]"
        />
      </div>
      <div className="container relative pt-[calc(56.25vw+var(--space-sm))] pb-[calc(var(--space-2xl)+4rem)] md:pb-[calc(var(--space-2xl)+7rem)] md:flex md:min-h-[min(88vh,820px)] md:flex-col md:justify-center md:pt-(--space-3xl)">
        <h1 className="max-w-none text-(length:--text-display) leading-[0.98]">
          <span className="line"><span className="keep-motion">{dict.hero.h1Line1}</span></span>
          <span className="line"><span className="keep-motion">{dict.hero.h1Line2}</span></span>
          <span className="line"><span className="keep-motion">{dict.hero.h1Line3}</span></span>
        </h1>

        <p className="hero-hint keep-motion mt-(--space-xl)">
          <a href="#track-a" className="tlink">
            {dict.hero.scrollHint}
          </a>
        </p>
      </div>
    </section>

    {/* The cards ride up over the hero's bottom edge so they read as part of it, not a strip of their own. */}
    <section className="relative z-10 -mt-16 pb-(--section-gap-s) md:-mt-28">
      <div className="container">
        <div className="grid gap-(--space-xl) md:grid-cols-2 md:gap-(--gap-columns)">
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
      </div>
    </section>
    </>
  );
}
