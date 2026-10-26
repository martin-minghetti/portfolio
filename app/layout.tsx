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
  title: "Martín Minghetti, web developer",
  description:
    "Web developer based in Bariloche, Argentina. Seven and a half years building event sites at AirLST (Munich). Now I make my own projects with the help of AI agents.",
  metadataBase: new URL("https://martin-minghetti.vercel.app"),
  openGraph: {
    title: "Martín Minghetti, web developer",
    description:
      "Websites and apps, built with the help of AI. Seven and a half years of frontend at AirLST. Based in Bariloche, Argentina.",
    type: "website",
    url: "https://martin-minghetti.vercel.app",
    siteName: "Martin Minghetti",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Martín Minghetti, web developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Martín Minghetti, web developer",
    description:
      "Websites and apps, built with the help of AI. Seven and a half years of frontend at AirLST. Based in Bariloche, Argentina.",
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
  jobTitle: "Web developer",
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
