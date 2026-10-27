import type { Dictionary } from "@/lib/dictionaries";
import CTAButton from "@/components/ui/CTAButton";

type Props = {
  dict: Dictionary;
  firstSlug: string;
};

// The name runs across the whole split; the rest of the first screen sits in the reading half,
// beside the stage that already shows the first project.
export function HeroTitle({ dict }: { dict: Dictionary }) {
  return (
    <h1 className="hero-title">
      <span className="line"><span className="keep-motion">{dict.hero.h1Line1}</span></span>
      <span className="line"><span className="keep-motion">{dict.hero.h1Line2}</span></span>
    </h1>
  );
}

export default function Hero({ dict, firstSlug }: Props) {
  return (
    <div className="hero" data-stage={firstSlug}>
      <p className="lead hero-lead keep-motion">{dict.hero.lead}</p>
      <div className="hero-actions keep-motion">
        <CTAButton href="https://wa.me/5492241622290" external>
          {dict.hero.ctaPrimary}
        </CTAButton>
        <CTAButton href="https://cal.com/martin-minghetti" external variant="outline">
          {dict.hero.ctaSecondary}
        </CTAButton>
      </div>
    </div>
  );
}
