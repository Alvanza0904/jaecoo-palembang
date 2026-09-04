/**
 * JAECOO Palembang — Footer
 */

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";
import styles from "./Footer.module.css";

const MODEL_LINKS = [
  { label: "JAECOO J5 EV", href: "/model/j5-ev" },
  { label: "JAECOO J7 SHS", href: "/model/j7-shs" },
  { label: "JAECOO J8 Ardis SHS", href: "/model/j8-ardis-shs" },
];

const INFO_LINKS = [
  { label: "Promo", href: "/promo" },
  { label: "Gallery", href: "/gallery" },
  { label: "JAECOO Journal", href: "/berita" },
  { label: "Sales Alvan", href: "/sales-jaecoo-palembang" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  const whatsappUrl = buildWhatsAppUrl({ source: "footer" });
  const displayNumber = WHATSAPP_NUMBER.replace("62", "0").replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <p className={styles.brandName}>JAECOO</p>
            <p className={styles.brandSub}>Palembang</p>
            <p className={styles.brandDesc}>
              Dealer resmi JAECOO di Palembang. Temukan SUV premium pilihan Anda bersama Sales kami.
            </p>
            <a
              href={whatsappUrl}
              className={styles.phone}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Hubungi Sales via WhatsApp: ${displayNumber}`}
            >
              {displayNumber}
            </a>
          </div>

          {/* Model Links */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Model</p>
            <ul className={styles.colLinks} role="list">
              {MODEL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.colLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div className={styles.col}>
            <p className={styles.colTitle}>Informasi</p>
            <ul className={styles.colLinks} role="list">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.colLink}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} JAECOO Palembang. Harga dan informasi dapat berubah sewaktu-waktu.
          </p>
          <div className={styles.legal}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.legalLink}>{link.label}</Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
