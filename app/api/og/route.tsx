import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

// Cobalto tokens as hex: the image renderer has no CSS variables, so these mirror app/tokens.css.
const color = {
  paper: "#F8FAFD",
  ink: "#0A183B",
  inkMuted: "#4E5B75",
  rule: "#C9D1E2",
  dot: "#C9D1E2",
  accent: "#174BD7",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title =
    searchParams.get("title") ?? "Web developer";
  const subtitle =
    searchParams.get("subtitle") ??
    "Websites and apps, built with the help of AI";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: color.paper,
          color: color.ink,
          fontFamily: "sans-serif",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* Dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${color.dot} 1px, transparent 1.4px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", zIndex: 1 }}>
          <span style={{ fontSize: "32px", letterSpacing: "-0.01em" }}>
            Martin Minghetti
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Title */}
        <h1
          style={{
            fontSize: "96px",
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: "-0.022em",
            margin: 0,
            zIndex: 1,
            maxWidth: "1000px",
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "30px",
            fontFamily: "sans-serif",
            color: color.inkMuted,
            marginTop: "24px",
            marginBottom: 0,
            zIndex: 1,
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: `2px solid ${color.accent}`,
            fontFamily: "sans-serif",
            fontSize: "20px",
            color: color.inkMuted,
            zIndex: 1,
          }}
        >
          <span>martin-minghetti.is-a.dev</span>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
