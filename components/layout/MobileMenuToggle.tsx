/**
 * JAECOO Palembang — MobileMenuToggle
 * Stable hamburger → fullscreen menu overlay.
 * Body lock + iOS scroll fix included.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./MobileMenuToggle.module.css";
import { WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";

interface NavLink { label: string; href: string; }
interface Props { navLinks: NavLink[]; inverted?: boolean; }

export function MobileMenuToggle({ navLinks, inverted = false }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Body lock — prevents background scroll on iOS
  useEffect(() => {
    if (open) {
      const y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
    } else {
      const y = parseInt(document.body.style.top || "0") * -1;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  return (
    <>
      {/* Hamburger button */}
      <button
        className={[styles.toggle, inverted && !open ? styles.toggleLight : ""].join(" ")}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <span className={[styles.bar, open ? styles.barTop : ""].join(" ")} />
        <span className={[styles.bar, open ? styles.barHide : ""].join(" ")} />
        <span className={[styles.bar, open ? styles.barBottom : ""].join(" ")} />
      </button>

      {/* Fullscreen overlay */}
      <div
        id="mobile-menu"
        className={[styles.overlay, open ? styles.overlayOpen : ""].join(" ")}
        aria-hidden={!open}
        role="dialog"
        aria-label="Navigasi utama"
      >
        <div className={styles.overlayInner}>
          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={close}
            aria-label="Tutup menu"
          >
            <span className={[styles.bar, styles.barTop].join(" ")} />
            <span className={[styles.bar, styles.barBottom].join(" ")} />
          </button>

          <nav className={styles.nav}>
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.navItem}
                onClick={close}
                style={{ animationDelay: open ? `${i * 60 + 100}ms` : "0ms" }}
                tabIndex={open ? 0 : -1}
              >
                <span className={styles.navIndex}>0{i + 1}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.footer}>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              className={styles.footerCta}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              tabIndex={open ? 0 : -1}
            >
              Talk to Alvan →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
