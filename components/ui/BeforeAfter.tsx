"use client";

import { useState } from "react";
import FadeImage from "@/components/ui/FadeImage";

type Shot = { src: string; label: string };

type Props = {
  left: Shot;
  right: Shot;
  slider: string;
};

// The range input sits invisible over both pictures, so drag, tap and arrow keys all move the split.
export default function BeforeAfter({ left, right, slider }: Props) {
  const [pos, setPos] = useState(50);
  const sizes = "(min-width: 1280px) 1200px, 100vw";

  return (
    <div className="crop-shadow relative aspect-[16/10] overflow-hidden rounded-card outline outline-1 -outline-offset-1 outline-ink/10">
      <FadeImage src={right.src} alt={right.label} fill sizes={sizes} className="object-cover object-top" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <FadeImage src={left.src} alt={left.label} fill sizes={sizes} className="object-cover object-top" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.15)]" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-paper text-ink shadow-md">↔</span>
      </div>
      <span className="label pointer-events-none absolute bottom-3 left-3 rounded-card bg-ink/80 px-2 py-0.5 !text-paper">{left.label}</span>
      <span className="label pointer-events-none absolute right-3 bottom-3 rounded-card bg-ink/80 px-2 py-0.5 !text-paper">{right.label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={slider}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
