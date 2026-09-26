/**
 * JAECOO Palembang — Public Layout
 * Wraps all public-facing pages with Header and Footer.
 * Admin routes are excluded (they use app/admin/layout.tsx via AdminShell).
 */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteBrandAssets } from "@/lib/supabase/media";
import { SITE_SETTINGS } from "@/lib/data/site";
import { SITE_URL } from "@/lib/utils/seo";

export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getSiteBrandAssets();
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "JAECOO Palembang",
    url: SITE_URL,
    telephone: `+${SITE_SETTINGS.whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_SETTINGS.dealerAddress.street,
      addressLocality: "Palembang",
      addressRegion: SITE_SETTINGS.dealerAddress.region,
      postalCode: SITE_SETTINGS.dealerAddress.postalCode,
      addressCountry: "ID",
    },
    areaServed: {
      "@type": "City",
      name: "Palembang",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <Header brand={brand} />
      <main id="main-content">{children}</main>
      <Footer brand={brand} />
    </>
  );
}
