import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import NotFound from "./[lang]/not-found";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font-bricolage" });

export const metadata: Metadata = { title: "404 | Martín Minghetti", robots: { index: false } };

// URLs that match no route at all. Inside /en and /es, [lang]/not-found.tsx renders with the site chrome.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={bricolage.variable}>
      <body>
        <NotFound />
      </body>
    </html>
  );
}
