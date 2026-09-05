/**
 * JAECOO Palembang — Mobile Menu Toggle
 *
 * Premium full-panel mobile menu.
 * Hamburger → X with stagger reveal.
 * "use client" — manages open/close state.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./MobileMenuToggle.module.css";

interface NavLink {
  label: string;
  href: string;
}

interface MobileMenuToggleProps {
  navLinks: NavLink[];
  /** When true (transparent header), bars are white */
  inverted?: boolean;
}

const WHATSAPP_URL =
  "https://wa.me/6285183145926?text=Halo%20Alvan%2C%20saya%20ingin%20mendapatkan%20informasi%20lebih%20lanjut%20mengenai%20JAECOO%20Palembang.";

export function MobileMenuToggle({ navLinks, inverted = false }: MobileMenuToggleProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        className={[
          styles.toggle,
          inverted && !open ? styles.toggleInverted : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <span
          aria-hidden="true"
          className={[styles.icon, open ? styles.iconOpen : ""].join(" ")}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </span>
      </button>

      {/* Backdrop */}
      <div
        className={[
          styles.backdrop,
          open ? styles.backdropVisible : "",
        ].join(" ")}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Full-panel menu */}
      <nav
        id="mobile-menu"
        className={[styles.panel, open ? styles.panelOpen : ""].join(" ")}
        aria-label="Navigasi mobile"
        aria-hidden={!open}
      >
        {/* Close button inside panel */}
        <button
          className={styles.closeBtn}
          onClick={() => setOpen(false)}
          aria-label="Tutup menu"
          tabIndex={open ? 0 : -1}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <line
              x1="4"
              y1="4"
              x2="20"
              y2="20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="4"
              x2="4"
              y2="20"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Gold accent line */}
        <div className={styles.accentLine} aria-hidden="true" />

        {/* Nav links with stagger */}
        <ul className={styles.links} role="list">
          {navLinks.map((link, i) => (
            <li
              key={link.href}
              className={styles.linkItem}
              style={{ "--stagger-i": i } as React.CSSProperties}
            >
              <Link
                href={link.href}
                className={styles.link}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
              >
                <span className={styles.linkLabel}>{link.label}</span>
                <span className={styles.linkArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA — last element */}
        <div className={styles.cta}>
          <a
            href={WHATSAPP_URL}
            className={styles.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            Talk to Alvan <span aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </>
  );
}
