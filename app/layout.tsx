/**
 * JAECOO Palembang — Root Layout
 * Provides html/body shell, fonts, and global CSS only.
 * Header/Footer live in app/(public)/layout.tsx (public pages only).
 * Admin routes use AdminShell via app/admin/layout.tsx.
 *
 * STEP 6I: Added all curated automotive font families so that
 * Typography Editor font_family setting is reflected in Live Hero.
 */

import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/styles/globals.css";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/utils/seo";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Dealer Resmi JAECOO`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
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
    url: SITE_URL,
    siteName: SITE_NAME,
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
      <body>{children}</body>
    </html>
  );
}
