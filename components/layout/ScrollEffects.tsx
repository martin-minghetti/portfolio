"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-linked touches, done with scroll events and an observer so they work in every browser:
// the header's edge, the reading bar, and the project screens that print in as they arrive.
export default function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scrolled", Math.min(y / 140, 1).toFixed(3));
      root.style.setProperty("--read", max > 0 ? Math.min(y / max, 1).toFixed(4) : "0");
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    let observer: IntersectionObserver | undefined;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.reveal = "done";
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      // Screens already in view stay as they are; only the ones still below the fold wait to print in.
      document.querySelectorAll<HTMLElement>(".screen").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.dataset.reveal = "pending";
        observer?.observe(el);
      });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
