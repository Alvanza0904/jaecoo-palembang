import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jaecoopalembang.web.id"),
  title: {
    default: "JAECOO Palembang — Dealer Resmi JAECOO",
    template: "%s — JAECOO Palembang",
  },
  description:
    "Dealer Resmi OMODA JAECOO Palembang. Temukan JAECOO J5 EV, J7 SHS, dan J8 SHS. Konsultasi, test drive, dan promo eksklusif bersama Alvan.",
  keywords: ["JAECOO", "OMODA JAECOO Palembang", "dealer JAECOO Palembang", "SUV Palembang"],
  openGraph: {
    siteName: "JAECOO Palembang",
    locale: "id_ID",
    type: "website",
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
