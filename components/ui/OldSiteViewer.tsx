"use client";

import { useState } from "react";

type Device = "mobile" | "tablet" | "desktop";

type Props = {
  shots: Record<Device, string>;
  url: string;
  labels: Record<Device, string> & { alt: string };
};

const devices: Device[] = ["mobile", "tablet", "desktop"];

// Each device gets its own body: a phone with an island, a tablet with a camera dot, a browser window.
const body: Record<Device, string> = {
  mobile: "max-w-[414px] rounded-[3rem] bg-ink p-3",
  tablet: "max-w-[800px] rounded-[2rem] bg-ink p-4 pt-7",
  desktop: "max-w-none rounded-xl border border-rule bg-paper-2",
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

      {/* key remounts the frame, so every switch replays the rise-in. */}
      <div key={device} className={`device-in relative mx-auto mt-(--space-lg) shadow-xl ${body[device]}`}>
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
        <div role="tabpanel" data-lenis-prevent tabIndex={0} aria-busy={loading} className={`relative overflow-y-auto bg-paper ${screen[device]}`}>
          {loading ? (
            <div className="absolute inset-0 grid place-items-center">
              <span aria-hidden className="size-8 animate-spin rounded-full border-2 border-rule border-t-ink" />
            </div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- very tall captures; the optimizer would only shrink them */}
          <img
            src={shots[device]}
            alt={`${labels.alt} (${labels[device]})`}
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setLoaded(device);
            }}
            onLoad={() => setLoaded(device)}
            onError={() => setLoaded(device)}
            className={`block w-full transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}
          />
        </div>
      </div>
    </div>
  );
}
