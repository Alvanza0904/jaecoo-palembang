/**
 * JAECOO Palembang — Footer
 *
 * Minimal dark charcoal footer.
 * Social links + legal — no giant nav columns.
 */

import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";
import styles from "./Footer.module.css";
import { getEntityMedia } from "@/lib/supabase/media";
import Image from "next/image";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://instagram.com/jaecoopalembang",
    external: true,
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@jaecoopalembang",
    external: true,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/jaecoopalembang",
    external: true,
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    external: true,
  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

export async function Footer() {
  const logo = await getEntityMedia("global", "site", "logo_dark");
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
        </div>

        {/* Gold divider */}
        <div className={styles.divider} aria-hidden="true" />

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
            © {year} JAECOO Palembang
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
