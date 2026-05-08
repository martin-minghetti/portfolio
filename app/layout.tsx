import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Martin Minghetti — Senior Fullstack & AI Engineer",
  description:
    "Senior fullstack engineer building production AI systems and commercial web apps. 7.5 years at AirLST GmbH (Munich). Now independent — 14 open-source projects and 4 commercial demos live. Available for contract AI engineering and fullstack work.",
  metadataBase: new URL("https://portfolio-martin-minghetti.vercel.app"),
  openGraph: {
    title: "Martin Minghetti — Senior Fullstack & AI Engineer",
    description:
      "Production AI engineering and fullstack web apps. 7.5 years shipping at AirLST. 14 OSS projects. 4 commercial demos live.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Martin Minghetti — Senior Fullstack & AI Engineer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body>{children}</body>
    </html>
  );
}
