"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

// next/image already loads lazily; this adds the visible part: a shimmer on the slot while the
// picture is on its way and a fade when it lands. With scripting off the image just shows.
export default function FadeImage(props: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "loaded">("idle");

  useEffect(() => {
    setState(ref.current?.complete && ref.current.naturalWidth > 0 ? "loaded" : "loading");
  }, []);

  return <Image {...props} ref={ref} data-state={state} onLoad={() => setState("loaded")} />;
}
