/**
 * JAECOO Palembang — Footer
 *
 * Minimal dark charcoal footer.
 * Social links + legal — no giant nav columns.
 */

import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { SITE_SETTINGS } from "@/lib/data/site";
import styles from "./Footer.module.css";
import type { SiteBrandAssets } from "@/lib/supabase/media";
import Image from "next/image";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: SITE_SETTINGS.instagram,
    external: true,
  },
  {
    label: "TikTok",
    href: SITE_SETTINGS.tiktok,
    external: true,
  },
  {
    label: "Facebook",
    href: SITE_SETTINGS.facebook,
    external: true,
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${SITE_SETTINGS.whatsappNumber}`,
    external: true,
  },
];

const PAGE_LINKS = [
  { label: "Harga JAECOO Palembang", href: "/model" },
  { label: "Promo JAECOO Palembang", href: "/promo" },
  { label: "Test Drive", href: buildWhatsAppUrl({ source: "footer", source_cta: "footer_test_drive" }), external: true },
  { label: "Sales JAECOO Palembang", href: "/sales-jaecoo-palembang" },
  { label: "JAECOO J5", href: "/model/jaecoo-j5-ev" },
  { label: "JAECOO J7 SHS", href: "/model/jaecoo-j7-shs" },
  { label: "JAECOO J7 SIVP", href: "/model/jaecoo-j7-sivp" },
  { label: "JAECOO J8 SHS ARDIS", href: "/model/jaecoo-j8-shs" },
  { label: "Berita", href: "/berita" },
] as const;

const LEGAL_LINKS = [
  { label: "Kebijakan Privasi", href: "/privacy-policy" },
  { label: "Ketentuan", href: "/terms" },
];

export function Footer({ brand }: { brand: SiteBrandAssets }) {
  const logo = brand.logoDark ?? brand.logo;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Footer JAECOO Palembang">
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          {logo ? (
            <Image
              src={logo.desktop ?? logo.tablet ?? logo.mobile ?? logo.small_mobile ?? ""}
              alt={logo.alt || "JAECOO Palembang"}
              width={logo.width ?? 180}
              height={logo.height ?? 48}
              className={styles.brandLogo}
              sizes="180px"
            />
          ) : (
            <>
              <p className={styles.brandName}>JAECOO</p>
              <p className={styles.brandSub}>Palembang</p>
            </>
          )}
          <p className={styles.brandText}>
            Sales JAECOO Palembang untuk informasi harga, promo, spesifikasi, test drive, dan konsultasi pembelian mobil JAECOO.
          </p>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <section className={styles.local} aria-label="JAECOO di Palembang">
          <p className={styles.kicker}>JAECOO di Palembang</p>
          <p className={styles.localCopy}>
            JAECOO Palembang melayani kebutuhan informasi dan pembelian mobil JAECOO untuk pelanggan di Kota Palembang dan wilayah Sumatera Selatan.
          </p>
          <address>
            {SITE_SETTINGS.dealerAddress.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p className={styles.hours}>{SITE_SETTINGS.openingHours}</p>
        </section>

        <nav className={styles.links} aria-label="Halaman JAECOO Palembang">
          {PAGE_LINKS.map((link) => (
            "external" in link ? (
              <a key={link.label} href={link.href} className={styles.pageLink} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className={styles.pageLink}>
                {link.label}
              </Link>
            )
          ))}
        </nav>

        {/* Social */}
        <nav className={styles.social} aria-label="Media sosial JAECOO Palembang">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={styles.socialLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} {SITE_SETTINGS.brandName} · Palembang, Sumatera Selatan
          </p>
          <div className={styles.legal}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.legalLink}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
