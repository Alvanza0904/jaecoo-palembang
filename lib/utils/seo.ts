/**
 * JAECOO Palembang — SEO Utilities
 */

export const SITE_NAME = "JAECOO Palembang";
export const SITE_URL = "https://jaecoopalembang.web.id";
export const SITE_DESCRIPTION =
  "Dealer resmi JAECOO di Palembang. Temukan JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS. Hubungi Sales JAECOO Palembang untuk test drive dan penawaran terbaik.";

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
