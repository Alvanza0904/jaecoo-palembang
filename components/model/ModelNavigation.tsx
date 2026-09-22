/**
 * JAECOO Palembang — Model Sticky Mini Navigation
 *
 * OVERVIEW | TECHNOLOGY | SPECIFICATIONS
 *
 * Step 8.x — Scroll-Aware Visual System:
 *   Reuses the same scroll/hero detection logic as ScrollHeader.
 *   - On hero (top of page): transparent, menyatu dengan hero.
 *   - On scroll: solid background, konsisten dengan Header.
 *   Top position turun sedikit untuk memastikan area touch bebas dari Header.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ModelNavigation.module.css";

interface ModelNavigationProps {
  slug: string;
  modelName: string;
}

export function ModelNavigation({ slug, modelName }: ModelNavigationProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isHeroPage, setIsHeroPage] = useState(false);

  // Reuse same data-hero detection as ScrollHeader
  useEffect(() => {
    setIsHeroPage(document.documentElement.hasAttribute("data-hero"));
    const observer = new MutationObserver(() => {
      setIsHeroPage(document.documentElement.hasAttribute("data-hero"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-hero"] });
    return () => observer.disconnect();
  }, []);

  // Reuse same scroll threshold as ScrollHeader (60px)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = isHeroPage && !scrolled;

  const tabs = [
    { label: "Overview", href: `/model/${slug}` },
    { label: "Teknologi", href: `/model/${slug}/technology` },
    { label: "Spesifikasi", href: `/model/${slug}/specifications` },
  ];

  return (
    <nav
      className={[
        styles.nav,
        isTransparent ? styles.navTransparent : styles.navSolid,
      ].join(" ")}
      aria-label={`Navigasi ${modelName}`}
    >
      <div className={styles.inner}>
        <span className={styles.modelLabel}>{modelName}</span>
        <div className={styles.tabs} role="tablist">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  styles.tab,
                  isActive ? styles.tabActive : "",
                  isTransparent ? styles.tabLight : "",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
