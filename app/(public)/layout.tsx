/**
 * JAECOO Palembang — Public Layout
 * Wraps all public-facing pages with Header and Footer.
 * Admin routes are excluded (they use app/admin/layout.tsx via AdminShell).
 */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
