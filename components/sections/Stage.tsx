"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type StageItem = { slug: string; name: string; liveUrl?: string; desktop: string; phone: string };

type Props = {
  items: StageItem[];
  label: string;
  openLabel: string;
};

// The half of the split that never scrolls: it shows the project crossing the middle of the screen,
// or the one under the pointer, as its desktop and phone screens.
export default function Stage({ items, label, openLabel }: Props) {
  const [active, setActive] = useState(items[0].slug);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-stage]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.getAttribute("data-stage")!);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    const onPoint = (e: Event) => setActive((e.currentTarget as HTMLElement).dataset.stage!);
    targets.forEach((el) => {
      observer.observe(el);
      el.addEventListener("pointerenter", onPoint);
      el.addEventListener("focusin", onPoint);
    });
    return () => {
      observer.disconnect();
      targets.forEach((el) => {
        el.removeEventListener("pointerenter", onPoint);
        el.removeEventListener("focusin", onPoint);
      });
    };
  }, []);

  const current = items.find((i) => i.slug === active) ?? items[0];

  return (
    <aside className="stage" aria-label={label}>
      <div className="stage-frame">
        <div className="stage-desktop">
          {items.map((item, i) => (
            <Image
              key={item.slug}
              src={item.desktop}
              alt={item.slug === active ? `${item.name}, desktop` : ""}
              fill
              sizes="50vw"
              priority={i === 0}
              data-on={item.slug === active}
              className="object-cover object-top"
            />
          ))}
        </div>
        <div className="stage-phone">
          {items.map((item, i) => (
            <Image
              key={item.slug}
              src={item.phone}
              alt={item.slug === active ? `${item.name}, phone` : ""}
              fill
              sizes="16vw"
              priority={i === 0}
              data-on={item.slug === active}
              className="object-cover object-top"
            />
          ))}
        </div>
      </div>
      <p className="stage-caption" aria-live="polite">
        <span className="stage-name">{current.name}</span>
        {current.liveUrl ? (
          <a href={current.liveUrl} target="_blank" rel="noopener noreferrer" className="tlink">
            {openLabel}
          </a>
        ) : null}
      </p>
    </aside>
  );
}
