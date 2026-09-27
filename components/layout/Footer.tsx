import Link from "next/link";
import { SITE_SETTINGS } from "@/lib/data/site";
import styles from "./Footer.module.css";
import type { SiteBrandAssets } from "@/lib/supabase/media";
import Image from "next/image";

const SOCIAL_LINKS = [
  { label: "Instagram", href: SITE_SETTINGS.instagram },
  { label: "TikTok", href: SITE_SETTINGS.tiktok },
  { label: "Facebook", href: SITE_SETTINGS.facebook },
  { label: "WhatsApp", href: `https://wa.me/${SITE_SETTINGS.whatsappNumber}` },
];

const PAGE_LINKS = [
  { label: "Model", href: "/model" },
  { label: "Promo", href: "/promo" },
  { label: "Sales JAECOO Palembang", href: "/sales-jaecoo-palembang" },
  { label: "Berita", href: "/berita" },
];

const LEGAL_LINKS = [
  { label: "Kebijakan Privasi", href: "/privacy-policy" },
  { label: "Ketentuan", href: "/terms" },
];

export function Footer({ brand }: { brand: SiteBrandAssets }) {
  const logo = brand.logoDark ?? brand.logo;
  const year = new Date().getFullYear();
  const street = `${SITE_SETTINGS.dealerAddress.lines[0]}, ${SITE_SETTINGS.dealerAddress.lines[1]}`;

  return (
    <footer className={styles.footer} aria-label="Footer JAECOO Palembang">
      <div className={styles.inner}>
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
          <p className={styles.kicker}>Sales JAECOO Palembang</p>
          <p className={styles.brandText}>
            Informasi harga, promo, spesifikasi, test drive, dan konsultasi pembelian JAECOO.
          </p>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <section className={styles.local} aria-label="JAECOO di Palembang">
          <p className={styles.kicker}>JAECOO di Palembang</p>
          <p className={styles.place}>Palembang, {SITE_SETTINGS.dealerAddress.region}</p>
          <address>{street}</address>
          <p className={styles.hours}>{SITE_SETTINGS.openingHours}</p>
        </section>

        <nav className={styles.links} aria-label="Halaman JAECOO Palembang">
          {PAGE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.pageLink}>
              {link.label}
            </Link>
          ))}
        </nav>

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
