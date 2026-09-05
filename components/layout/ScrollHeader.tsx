/**
 * JAECOO Palembang — ScrollHeader
 *
 * Client component: manages scroll-aware header state.
 * Reads data-hero="true" on <html> to start transparent.
 * Transitions → solid on scroll.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MobileMenuToggle } from "./MobileMenuToggle";
import styles from "./ScrollHeader.module.css";

interface NavLink {
  label: string;
  href: string;
}

interface ScrollHeaderProps {
  navLinks: NavLink[];
  whatsappUrl: string;
}

export function ScrollHeader({ navLinks, whatsappUrl }: ScrollHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isHeroPage, setIsHeroPage] = useState(false);

  useEffect(() => {
    // Read data-hero attribute set by TransparentHeader component
    setIsHeroPage(document.documentElement.hasAttribute("data-hero"));

    // Listen for attribute changes (route navigation)
    const observer = new MutationObserver(() => {
      setIsHeroPage(document.documentElement.hasAttribute("data-hero"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hero"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHeroPage && !scrolled;

  return (
    <header
      className={[
        styles.header,
        isTransparent ? styles.headerTransparent : styles.headerSolid,
      ].join(" ")}
    >
      <div className={styles.inner}>
        {/* Logo */}
        <Link
          href="/"
          className={styles.logo}
          aria-label="JAECOO Palembang — Beranda"
        >
          <span className={[styles.logoText, isTransparent ? styles.logoTextLight : ""].join(" ")}>
            JAECOO
          </span>
          <span className={styles.logoSub}>Palembang</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav} aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[styles.navLink, isTransparent ? styles.navLinkLight : ""].join(" ")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className={styles.cta}>
          <Button
            as="a"
            href={whatsappUrl}
            variant={isTransparent ? "secondary" : "primary"}
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Talk to Alvan
          </Button>
        </div>

        {/* Mobile toggle */}
        <MobileMenuToggle navLinks={navLinks} inverted={isTransparent} />
      </div>
    </header>
  );
}
