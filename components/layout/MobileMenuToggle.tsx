/**
 * JAECOO Palembang — Mobile Menu Toggle + Menu
 * "use client" — manages open/close state
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./MobileMenuToggle.module.css";

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuToggleProps {
  navLinks: NavLink[];
}

export function MobileMenuToggle({ navLinks }: MobileMenuToggleProps) {
  const [open, setOpen] = useState(false);

  const whatsappUrl = buildWhatsAppUrl({
    source: "other",
    source_cta: "mobile_menu",
  });

  return (
    <>
      {/* Hamburger button */}
      <button
        className={styles.toggle}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <span className={[styles.bar, open ? styles.barTop : ""].join(" ")} />
        <span className={[styles.bar, open ? styles.barMid : ""].join(" ")} />
        <span className={[styles.bar, open ? styles.barBot : ""].join(" ")} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <nav
        id="mobile-menu"
        className={[styles.menu, open ? styles.menuOpen : ""].join(" ")}
        aria-label="Navigasi mobile"
        aria-hidden={!open}
      >
        <ul className={styles.links} role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={styles.link}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.menuCta}>
          <Button
            as="a"
            href={whatsappUrl}
            variant="primary"
            size="md"
            fullWidth
            target="_blank"
            rel="noopener noreferrer"
          >
            Hubungi Sales
          </Button>
        </div>
      </nav>
    </>
  );
}
