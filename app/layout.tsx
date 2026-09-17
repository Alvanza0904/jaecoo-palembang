import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import PremiumHeader from "@/components/layout/PremiumHeader";
import PremiumFooter from "@/components/layout/PremiumFooter";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: "JAECOO Palembang | Premium Automotive",
  description: "Dealer Resmi OMODA JAECOO Palembang. Discover the J5, J7, and flagship J8.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-offwhite text-charcoal antialiased selection:bg-charcoal selection:text-white`}>
        <PremiumHeader />
        <main className="min-h-screen">
          {children}
        </main>
        <PremiumFooter />
      </body>
    </html>
  );
}
