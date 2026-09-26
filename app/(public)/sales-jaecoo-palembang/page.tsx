/**
 * JAECOO Palembang — Sales Page (Alvan)
 * Route: /sales-jaecoo-palembang
 */

export const revalidate = 60;

import type { Metadata } from "next";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { SalesPageView } from "@/components/sales/SalesPage";
import { getSalesDeliveries, getSalesMedia } from "@/lib/supabase/media";
import { SITE_URL } from "@/lib/utils/seo";

const title = "Sales JAECOO Palembang — Alvan";
const description =
  "Alvan, Sales Consultant JAECOO Palembang. Konsultasi untuk JAECOO J5 EV, J7 SHS, J7 SIVP, dan J8, termasuk momen serah terima bersama pelanggan.";

export async function generateMetadata(): Promise<Metadata> {
  const images = await getSalesMedia();
  const image = images.hero?.desktop || images.hero?.mobile;
  return {
    title,
    description,
    alternates: { canonical: "/sales-jaecoo-palembang" },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/sales-jaecoo-palembang`,
      siteName: "JAECOO Palembang",
      locale: "id_ID",
      type: "profile",
      images: image ? [{ url: image, alt: "Alvan, Sales Consultant JAECOO Palembang" }] : undefined,
    },
  };
}

export default async function SalesPage() {
  const [images, deliveries] = await Promise.all([getSalesMedia(), getSalesDeliveries()]);
  return (
    <>
      <TransparentHeader />
      <SalesPageView images={images} deliveries={deliveries} />
    </>
  );
}
