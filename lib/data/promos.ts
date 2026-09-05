/**
 * JAECOO Palembang — Mock Promo Data
 */

import type { PromoData } from "@/lib/types/promo";

export const PROMOS: PromoData[] = [
  {
    id: "promo-001",
    slug: "promo-spesial-j5-ev",
    title: "Promo Spesial JAECOO J5 EV",
    description: "Dapatkan keuntungan spesial untuk pembelian JAECOO J5 EV. Hubungi Sales kami untuk informasi lengkap.",
    badge: "Terbatas",
    valid_until: "2025-03-31",
    expired_at: null,
    image: {
      desktop: "/images/promo/j5-promo-desktop.jpg",
      mobile: "/images/promo/j5-promo-mobile.jpg",
      alt: "Promo Spesial JAECOO J5 EV",
    },
    cta_label: "Tanya Sekarang",
    cta_whatsapp_context: "Promo Spesial J5 EV",
    model_slug: "jaecoo-j5-ev",
    published: true,
    updated_at: "2025-01-01T00:00:00Z",
  },
];

export function getActivePromos(): PromoData[] {
  const now = new Date();
  return PROMOS.filter((p) => {
    if (!p.published) return false;
    if (p.expired_at && new Date(p.expired_at) < now) return false;
    return true;
  });
}

export function getPromoBySlug(slug: string): PromoData | undefined {
  return PROMOS.find((p) => p.slug === slug && p.published);
}
