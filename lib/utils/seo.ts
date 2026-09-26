/**
 * JAECOO Palembang — SEO Utilities
 */

export const SITE_NAME = "JAECOO Palembang";
export const SITE_URL = "https://jaecoopalembang.web.id";
export const SITE_DESCRIPTION =
  "JAECOO di Palembang: SUV listrik J5 EV, SUV hybrid J7 SHS dan J7 SIVP, serta J8 ARDIS dan J8 SHS-P ARDIS. Lihat harga OTR dan jadwalkan test drive.";

export const MODEL_PAGE_SEO: Record<string, { title: string; description: string }> = {
  "jaecoo-j5-ev": {
    title: "JAECOO J5 EV Palembang | SUV Listrik, Harga & Spesifikasi",
    description:
      "Kenali JAECOO J5 EV di Palembang, SUV listrik untuk perjalanan harian. Lihat harga OTR, spesifikasi, dan jadwalkan test drive.",
  },
  "jaecoo-j7-shs": {
    title: "JAECOO J7 SHS Palembang | SUV Plug-in Hybrid & Spesifikasi",
    description:
      "JAECOO J7 SHS di Palembang adalah SUV plug-in hybrid dengan Super Hybrid System. Lihat harga, spesifikasi, dan jadwalkan test drive.",
  },
  "jaecoo-j7-sivp": {
    title: "JAECOO J7 SIVP Palembang | Smart Valet Parking & Spesifikasi",
    description:
      "JAECOO J7 SIVP di Palembang menambahkan Smart Valet Parking pada platform hybrid J7. Lihat cara kerjanya dan spesifikasi lengkapnya.",
  },
  "jaecoo-j8-shs": {
    title: "JAECOO J8 Palembang | ARDIS & SHS-P ARDIS",
    description:
      "JAECOO J8 di Palembang hadir sebagai J8 ARDIS bensin dan J8 SHS-P ARDIS plug-in hybrid, keduanya dengan AWD ARDIS. Lihat harga dan spesifikasi.",
  },
};

export interface SeoMetaInput {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}

/** Build canonical URL */
export function buildCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/** Build page title with site name */
export function buildPageTitle(title: string): string {
  if (title === SITE_NAME) return title;
  return `${title} | ${SITE_NAME}`;
}
