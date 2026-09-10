/**
 * JAECOO Palembang — Public Layout
 * Wraps all public-facing pages with Header and Footer.
 * Admin routes are excluded (they use app/admin/layout.tsx via AdminShell).
 */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteBrandAssets } from "@/lib/supabase/media";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getSiteBrandAssets();

  return (
    <>
      <Header brand={brand} />
      <main id="main-content">{children}</main>
      <Footer brand={brand} />
    </>
  );
}
