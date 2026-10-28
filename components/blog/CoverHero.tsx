import type { ReactNode } from "react";
import FadeImage from "@/components/ui/FadeImage";

// Blog header over a cover image. Phone: the whole cover on top, text below on navy.
// Wider: the cover fills the header and the text sits over its dark left side.
// Without an image it falls back to the plain cobalt header.
export default function CoverHero({ image, className = "", children }: { image?: string; className?: string; children: ReactNode }) {
  if (!image) {
    return (
      <header className="hero-ground">
        <div className={`container ${className}`}>{children}</div>
      </header>
    );
  }
  return (
    <header className="hero-ground relative overflow-hidden !bg-[rgb(4_10_40)]">
      <div className="absolute inset-x-0 top-0 aspect-[16/9] md:inset-0 md:aspect-auto">
        <FadeImage src={image} alt="" fill priority sizes="100vw" className="object-cover md:object-right" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(4_10_40)_100%)] md:bg-[linear-gradient(90deg,rgb(4_10_40/0.92)_0%,rgb(4_10_40/0.75)_45%,rgb(4_10_40/0.15)_100%)]"
        />
      </div>
      <div
        className={`container relative ${className} !pt-[calc(56.25vw+var(--space-sm))] md:!pt-(--space-2xl) md:flex md:min-h-[min(68vh,620px)] md:flex-col md:justify-end`}
      >
        {children}
      </div>
    </header>
  );
}
