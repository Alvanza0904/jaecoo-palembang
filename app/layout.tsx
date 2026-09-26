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
    default: "JAECOO Palembang | SUV Listrik & Hybrid",
    template: "%s | JAECOO Palembang",
  },
  description:
    "JAECOO di Palembang: SUV listrik J5 EV, SUV hybrid J7 SHS dan J7 SIVP, serta J8 ARDIS dan J8 SHS-P ARDIS. Harga OTR dan test drive bersama Alvan.",
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
