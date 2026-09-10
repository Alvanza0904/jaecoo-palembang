/**
 * JAECOO Palembang — Header
 *
 * Server Component wrapper.
 * ScrollHeader (client) handles transparent → solid transition
 * by reading data-hero attribute set by TransparentHeader component.
 */

import { ScrollHeader } from "./ScrollHeader";
import { getEntityMedia } from "@/lib/supabase/media";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

export const NAV_LINKS = [
  { label: "MODELS", href: "/model" },
  { label: "PROMO", href: "/promo" },
  { label: "BERITA", href: "/berita" },
  { label: "GALLERY", href: "/gallery" },
  { label: "SALES ALVAN", href: "/sales-jaecoo-palembang" },
];

export async function Header() {
  const [logo, logoLight] = await Promise.all([
    getEntityMedia("global", "site", "logo"),
    getEntityMedia("global", "site", "logo_light"),
  ]);

  const whatsappUrl = buildWhatsAppUrl({
    source: "other",
    source_cta: "header",
  });

  return (
    <ScrollHeader
      navLinks={NAV_LINKS}
      whatsappUrl={whatsappUrl}
      logo={logo}
      logoLight={logoLight}
    />
  );
}
