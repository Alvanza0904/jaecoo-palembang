/**
 * JAECOO Palembang — Header
 *
 * Server Component wrapper.
 * ScrollHeader (client) handles transparent → solid transition
 * by reading data-hero attribute set by TransparentHeader component.
 */

import { ScrollHeader } from "./ScrollHeader";
import type { SiteBrandAssets } from "@/lib/supabase/media";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

export const NAV_LINKS = [
  { label: "MODEL", href: "/model" },
  { label: "PROMO", href: "/promo" },
  { label: "BERITA", href: "/berita" },
  { label: "GALERI", href: "/gallery" },
  { label: "ALVAN", href: "/sales-jaecoo-palembang" },
];

export function Header({ brand }: { brand: SiteBrandAssets }) {
  const { logo, logoLight } = brand;

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
