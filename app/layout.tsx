import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import LenisProvider from "@/components/layout/LenisProvider";
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
  metadataBase: new URL("https://martin-minghetti.vercel.app"),
  openGraph: {
    title: "Martin Minghetti — Senior Fullstack & AI Engineer",
    description:
      "Production AI engineering and fullstack web apps. 7.5 years shipping at AirLST. 14 OSS projects. 4 commercial demos live.",
    type: "website",
    url: "https://martin-minghetti.vercel.app",
    siteName: "Martin Minghetti",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Martin Minghetti — Senior Fullstack & AI Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Martin Minghetti — Senior Fullstack & AI Engineer",
    description:
      "Production AI engineering and fullstack web apps. 7.5 years shipping at AirLST. 14 OSS projects. 4 commercial demos live.",
    images: ["/api/og"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Martin Minghetti",
  alternateName: "Martín Minghetti",
  jobTitle: "Senior Fullstack & AI Engineer",
  url: "https://martin-minghetti.vercel.app",
  alumniOf: {
    "@type": "Organization",
    name: "AirLST GmbH",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Munich",
      addressCountry: "DE",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bariloche",
    addressRegion: "Río Negro",
    addressCountry: "AR",
  },
  nationality: { "@type": "Country", name: "Iceland" },
  knowsLanguage: ["es", "en", "is", "de"],
  sameAs: [
    "https://github.com/martin-minghetti",
    "https://linkedin.com/in/martin-minghetti",
    "https://cal.com/martin-minghetti",
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <script type="application/ld+json">{personJsonLd}</script>
      </head>
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
