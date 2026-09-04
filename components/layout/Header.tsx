/**
 * JAECOO Palembang — Header
 *
 * Server Component wrapper — passes open state to client MobileMenu.
 * Navigation links and logo are rendered server-side.
 */

import Link from "next/link";
import { MobileMenuToggle } from "./MobileMenuToggle";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./Header.module.css";

const NAV_LINKS = [
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
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo} aria-label="JAECOO Palembang — Beranda">
          <span className={styles.logoText}>JAECOO</span>
          <span className={styles.logoSub}>Palembang</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav} aria-label="Navigasi utama">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className={styles.cta}>
          <Button as="a" href={whatsappUrl} variant="primary" size="sm" target="_blank" rel="noopener noreferrer">
            Hubungi Sales
          </Button>
        </div>

        {/* Mobile menu toggle — client component */}
        <MobileMenuToggle navLinks={NAV_LINKS} />
      </div>
    </header>
  );
}
