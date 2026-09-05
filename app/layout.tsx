/**
 * JAECOO Palembang — Root Layout
 * Phase 2: Visual Foundation.
 */

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jaecoopalembang.web.id"),
  title: {
    default: "JAECOO Palembang — Dealer Resmi JAECOO",
    template: "%s | JAECOO Palembang",
  },
  description:
    "Dealer resmi JAECOO di Palembang. Temukan JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS. Hubungi Sales JAECOO Palembang untuk test drive dan penawaran terbaik.",
  keywords: [
    "JAECOO Palembang",
    "sales JAECOO Palembang",
    "JAECOO J5 Palembang",
    "JAECOO J7 SHS Palembang",
    "JAECOO J8 Palembang",
    "harga JAECOO Palembang",
    "promo JAECOO Palembang",
    "dealer JAECOO Sumatera Selatan",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://jaecoopalembang.web.id",
    siteName: "JAECOO Palembang",
    title: "JAECOO Palembang — Dealer Resmi JAECOO",
    description:
      "Dealer resmi JAECOO di Palembang. SUV premium pilihan — J5 EV, J7 SHS, J8 Ardis SHS.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "JAECOO Palembang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JAECOO Palembang",
    description: "Dealer resmi JAECOO di Palembang.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={manrope.variable}>
      <body>
        {/*
          Header is fixed/sticky via CSS.
          transparent=true on pages with hero that needs overlay header.
          Default (no prop): solid off-white header.
          Hero pages (model pages, homepage) pass transparent={true}
          directly to Header in their own layout file.
        */}
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
