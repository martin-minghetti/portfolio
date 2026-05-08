"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  className?: string;
};

const NUMBER_REGEX = /(\d+(?:\.\d+)?)/;

export default function Counter({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const match = value.match(NUMBER_REGEX);
  const targetNumber = match ? parseFloat(match[1]) : null;
  const prefix = match ? value.slice(0, match.index) : value;
  const suffix = match ? value.slice((match.index ?? 0) + match[1].length) : "";
  const decimals = match && match[1].includes(".") ? 1 : 0;
  const [display, setDisplay] = useState<string>(targetNumber !== null ? "0" : value);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (targetNumber === null) return;
    const node = ref.current;
    if (!node) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(targetNumber.toFixed(decimals));
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (!visible || animated) return;
        setAnimated(true);

        const duration = 800;
        const start = performance.now();
        function tick(now: number) {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 5);
          const current = targetNumber! * eased;
          setDisplay(current.toFixed(decimals));
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(targetNumber!.toFixed(decimals));
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [targetNumber, decimals, animated]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {targetNumber !== null ? display : ""}
      {suffix}
    </span>
  );
}
