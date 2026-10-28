import type { Dictionary } from "@/lib/dictionaries";
import { getProjectsByTrack } from "@/lib/projects";
import CTAButton from "@/components/ui/CTAButton";
import FadeImage from "@/components/ui/FadeImage";

type Props = {
  dict: Dictionary;
};

// Between the section titles below and the hero headline, so "Apps y automatizaciones" holds on one line.
const TITLE = "text-[clamp(1.75rem,2.4vw+0.5rem,2.75rem)] leading-[1.05]";

export default function Hero({ dict }: Props) {
  const count = (track: "a" | "b") => dict.hero.seeProjects.replace("{n}", String(getProjectsByTrack(track).length));

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
        <div className="container relative pt-[calc(56.25vw+var(--space-sm))] pb-(--space-2xl) md:flex md:min-h-[min(80vh,760px)] md:flex-col md:justify-center md:pt-(--space-3xl)">
          <h1 className="max-w-none text-(length:--text-display) leading-[0.98]">
            <span className="line"><span className="keep-motion">{dict.hero.h1Line1}</span></span>
            <span className="line"><span className="keep-motion">{dict.hero.h1Line2}</span></span>
            <span className="line"><span className="keep-motion">{dict.hero.h1Line3}</span></span>
          </h1>
        </div>
      </section>

      {/* The two offers as one band split down the middle, flush under the hero: cobalt for sites, paper for AI apps.
          The colors bleed to the screen edges; the text stays on the page container like everything else. */}
      <section className="relative">
        <div aria-hidden className="absolute inset-0 hidden md:grid md:grid-cols-2">
          <div className="bg-accent" />
          <div className="bg-paper-hi" />
        </div>
        <div className="container relative grid md:grid-cols-2">
          <article className="-mx-(--gutter) flex flex-col bg-accent px-(--gutter) py-(--space-2xl) md:mx-0 md:bg-transparent md:pl-0 md:pr-(--space-2xl)">
            <h2 className={`${TITLE} !text-paper-hi`}>{dict.hero.trackA.label}</h2>
            <p className="lead mt-(--space-md) max-w-[38ch] !text-paper-hi">{dict.hero.trackA.tagline}</p>
            <div className="mt-auto flex flex-wrap items-center gap-(--space-lg) pt-(--space-xl)">
              <CTAButton href="https://wa.me/5492241622290" external className="!border-paper-hi !bg-paper-hi !text-accent">
                {dict.hero.trackA.cta}
              </CTAButton>
              <a href="#track-a" className="tlink !text-paper-hi">
                {count("a")}
              </a>
            </div>
          </article>

          <article className="-mx-(--gutter) flex flex-col bg-paper-hi px-(--gutter) py-(--space-2xl) md:mx-0 md:bg-transparent md:pr-0 md:pl-(--space-2xl)">
            <h2 className={TITLE}>{dict.hero.trackB.label}</h2>
            <p className="lead mt-(--space-md) max-w-[38ch]">{dict.hero.trackB.tagline}</p>
            <div className="mt-auto flex flex-wrap items-center gap-(--space-lg) pt-(--space-xl)">
              <CTAButton href="https://cal.com/martin-minghetti" external variant="outline">
                {dict.hero.trackB.cta}
              </CTAButton>
              <a href="#track-b" className="tlink">
                {count("b")}
              </a>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
