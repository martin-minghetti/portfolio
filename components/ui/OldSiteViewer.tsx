"use client";

import { useEffect, useRef, useState } from "react";

type Device = "mobile" | "tablet" | "desktop";

type Props = {
  shots: Record<Device, string>;
  url: string;
  labels: Record<Device, string> & { alt: string };
};

const devices: Device[] = ["mobile", "tablet", "desktop"];

// Each device gets its own body: a phone with an island, a tablet with a camera dot, a browser window.
// One frame stays mounted and its width, padding and corners animate from one device to the next.
const body: Record<Device, string> = {
  mobile: "max-w-[414px] rounded-[3rem] border-ink bg-ink p-3",
  tablet: "max-w-[800px] rounded-[2rem] border-ink bg-ink p-4 pt-7",
  desktop: "max-w-full rounded-xl border-rule bg-paper-2 p-0",
};
const screen: Record<Device, string> = {
  mobile: "h-[min(75vh,760px)] rounded-[2.25rem]",
  tablet: "h-[75vh] rounded-xl",
  desktop: "h-[75vh] rounded-b-xl",
};

export default function OldSiteViewer({ shots, url, labels }: Props) {
  const [device, setDevice] = useState<Device>("mobile");
  const [loaded, setLoaded] = useState<Device | null>(null);
  const loading = loaded !== device;
  // Once the first capture is in, fetch and decode the other two so switching devices is instant.
  const warm = useRef<HTMLImageElement[] | null>(null);
  useEffect(() => {
    if (!loaded || warm.current) return;
    warm.current = devices.map((d) => {
      const img = new Image();
      img.src = shots[d];
      img.decode().catch(() => {});
      return img;
    });
  }, [loaded, shots]);

  return (
    <div>
      <div role="tablist" className="flex gap-2">
        {devices.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === device}
            onClick={() => setDevice(d)}
            className={`label rounded-full border px-4 py-1.5 transition-colors ${d === device ? "border-ink bg-ink !text-paper" : "border-rule hover:border-ink"}`}
          >
            {labels[d]}
          </button>
        ))}
      </div>

      <div
        className={`relative mx-auto mt-(--space-lg) w-full border shadow-xl transition-[max-width,padding,border-radius,background-color,border-color] duration-700 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none ${body[device]}`}
      >
        {device === "mobile" ? (
          <span aria-hidden className="absolute top-6 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
        ) : null}
        {device === "tablet" ? (
          <span aria-hidden className="absolute top-2.5 left-1/2 size-2 -translate-x-1/2 rounded-full bg-paper/25" />
        ) : null}
        {device === "desktop" ? (
          <div aria-hidden className="flex h-10 items-center gap-2 px-4">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="label mx-auto w-full max-w-sm truncate rounded-md bg-paper px-3 py-0.5 text-center">{url}</span>
          </div>
        ) : null}

        {/* data-lenis-prevent: the page's smooth scroll would otherwise swallow the wheel inside the screen. */}
        <div role="tabpanel" data-lenis-prevent tabIndex={0} aria-busy={loading} className={`relative overflow-y-auto bg-paper transition-[height,border-radius] duration-700 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none ${screen[device]}`}>
          {loading ? (
            <div className="absolute inset-0 grid place-items-center">
              <span aria-hidden className="size-8 animate-spin rounded-full border-2 border-rule border-t-ink" />
            </div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- very tall captures; the optimizer would only shrink them */}
          <img
            key={device}
            src={shots[device]}
            alt={`${labels.alt} (${labels[device]})`}
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setLoaded(device);
            }}
            loading="lazy"
            onLoad={() => setLoaded(device)}
            onError={() => setLoaded(device)}
            className={`block w-full transition-opacity duration-150 ${loading ? "opacity-0" : "opacity-100"}`}
          />
        </div>
      </div>
    </div>
  );
}
