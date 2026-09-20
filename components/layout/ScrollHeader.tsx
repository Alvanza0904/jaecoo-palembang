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
import Image from "next/image";
import type { ResponsiveImage as ResponsiveImageData } from "@/lib/types/media";

interface NavLink {
  label: string;
  href: string;
}

interface ScrollHeaderProps {
  navLinks: NavLink[];
  whatsappUrl: string;
  logo?: ResponsiveImageData;
  logoLight?: ResponsiveImageData;
}

export function ScrollHeader({ navLinks, whatsappUrl, logo, logoLight }: ScrollHeaderProps) {
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
          {logo ? (
            <Image
              src={(isTransparent ? (logoLight?.desktop ?? logoLight?.mobile) : undefined) ?? logo.desktop ?? logo.tablet ?? logo.mobile ?? logo.small_mobile ?? ""}
              alt={logo.alt || "JAECOO Palembang"}
              width={logo.width ?? 180}
              height={logo.height ?? 48}
              className={styles.logoImage}
              priority
              sizes="180px"
            />
          ) : (
            <>
              <span className={[styles.logoText, isTransparent ? styles.logoTextLight : ""].join(" ")}>
                JAECOO
              </span>
              <span className={styles.logoSub}>Palembang</span>
            </>
          )}
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
            Chat dengan Alvan
          </Button>
        </div>

        {/* Mobile toggle */}
        <MobileMenuToggle navLinks={navLinks} inverted={isTransparent} />
      </div>
    </header>
  );
}
