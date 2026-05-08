import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title =
    searchParams.get("title") ?? "Senior Fullstack & AI Engineer";
  const subtitle =
    searchParams.get("subtitle") ??
    "Production AI systems and commercial web apps";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0A0A0A",
          color: "#F5F5F0",
          fontFamily: "monospace",
          padding: "64px",
          position: "relative",
        }}
      >
        {/* Grid pattern background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, #2A2A2A 1px, transparent 1px), linear-gradient(to bottom, #2A2A2A 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            MARTIN MINGHETTI
          </span>
          <span style={{ color: "#7CFF50", fontSize: "20px", fontWeight: 700 }}>
            _
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Title */}
        <h1
          style={{
            fontSize: "84px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
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
            fontSize: "28px",
            color: "#A8A8A0",
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
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #2A2A2A",
            fontSize: "16px",
            color: "#6E6E66",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            zIndex: 1,
          }}
        >
          <span>martin-minghetti.vercel.app</span>
          <span style={{ color: "#7CFF50" }}>14 OSS · 4 DEMOS LIVE</span>
        </div>
      </div>
    ),
    { ...SIZE },
  );
}
