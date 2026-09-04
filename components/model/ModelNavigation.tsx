/**
 * JAECOO Palembang — Model Sticky Mini Navigation
 *
 * OVERVIEW | TECHNOLOGY | SPECIFICATIONS
 * "use client" untuk active link detection.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ModelNavigation.module.css";

interface ModelNavigationProps {
  slug: string;
  modelName: string;
}

export function ModelNavigation({ slug, modelName }: ModelNavigationProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/model/${slug}` },
    { label: "Technology", href: `/model/${slug}/technology` },
    { label: "Specifications", href: `/model/${slug}/specifications` },
  ];

  return (
    <nav className={styles.nav} aria-label={`Navigasi ${modelName}`}>
      <div className={styles.inner}>
        <span className={styles.modelLabel}>{modelName}</span>
        <div className={styles.tabs} role="tablist">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[styles.tab, isActive ? styles.tabActive : ""].join(" ")}
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
