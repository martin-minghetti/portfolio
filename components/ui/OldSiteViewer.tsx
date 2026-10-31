"use client";

import { useState } from "react";

type Device = "mobile" | "tablet" | "desktop";

type Props = {
  shots: Record<Device, string>;
  labels: Record<Device, string> & { alt: string };
};

// Max frame width per device, so a phone page reads at phone width instead of being stretched.
const frame: Record<Device, string> = { mobile: "max-w-[390px]", tablet: "max-w-[768px]", desktop: "max-w-none" };
const devices: Device[] = ["mobile", "tablet", "desktop"];

export default function OldSiteViewer({ shots, labels }: Props) {
  const [device, setDevice] = useState<Device>("mobile");

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
      {/* data-lenis-prevent: the page's smooth scroll would otherwise swallow the wheel inside the frame. */}
      <div
        role="tabpanel"
        data-lenis-prevent
        tabIndex={0}
        className={`crop-shadow mx-auto mt-(--space-md) h-[75vh] overflow-y-auto rounded-card outline outline-1 -outline-offset-1 outline-ink/10 ${frame[device]}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- very tall captures; the optimizer would only shrink them */}
        <img key={device} src={shots[device]} alt={`${labels.alt} (${labels[device]})`} className="block w-full" />
      </div>
    </div>
  );
}
