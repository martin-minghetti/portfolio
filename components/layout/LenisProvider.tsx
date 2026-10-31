"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // A glide still running when a link is clicked would drag the new page back down after Next puts it at the top:
  // stop() and start() drop the glide and resync Lenis with where the page really is.
  useLayoutEffect(() => {
    lenisRef.current?.stop();
    lenisRef.current?.start();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Links to a place on this same page (including "/es#track-a") glide there instead of jumping.
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      // Lenis reads the target's scroll-margin and the page's scroll-padding, so the landing spot is set in the CSS.
      lenis.scrollTo(target, { duration: 1.3 });
      window.history.pushState(null, "", url.hash);
    }
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
