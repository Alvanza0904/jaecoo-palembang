/**
 * JAECOO Palembang — Header
 *
 * Server Component wrapper.
 * ScrollHeader (client) handles transparent → solid transition
 * by reading data-hero attribute set by TransparentHeader component.
 */

import { ScrollHeader } from "./ScrollHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

export const NAV_LINKS = [
  { label: "Model", href: "/model" },
  { label: "Promo", href: "/promo" },
  { label: "JAECOO Journal", href: "/berita" },
  { label: "Gallery", href: "/gallery" },
  { label: "Sales", href: "/sales-jaecoo-palembang" },
];

export function Header() {
  const whatsappUrl = buildWhatsAppUrl({
    source: "other",
    source_cta: "header",
  });

  return (
    <ScrollHeader
      navLinks={NAV_LINKS}
      whatsappUrl={whatsappUrl}
    />
  );
}
