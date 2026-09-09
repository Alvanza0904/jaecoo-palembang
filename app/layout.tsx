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
import {
  Manrope,
  Montserrat,
  Outfit,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  IBM_Plex_Sans,
  Exo_2,
} from "next/font/google";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-exo-2",
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
  const fontVariables = [
    manrope.variable,
    montserrat.variable,
    outfit.variable,
    plusJakartaSans.variable,
    spaceGrotesk.variable,
    ibmPlexSans.variable,
    exo2.variable,
  ].join(" ");

  return (
    <html lang="id" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
