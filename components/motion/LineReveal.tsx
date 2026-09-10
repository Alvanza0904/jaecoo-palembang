/**
 * JAECOO Palembang — LineReveal
 * STEP 7C: Per-line staggered reveal for multi-line headlines.
 *
 * Each line clips up from an overflow:hidden mask independently.
 * Lines appear with a subtle stagger — premium editorial feel.
 *
 * Usage:
 *   <LineReveal lines={["DESIGNED", "TO STAND OUT"]} />
 *   <LineReveal lines={["Intelligence", "in every", "detail."]} tag="h2" className={styles.heading} />
 */

"use client";

import { useEffect, useRef } from "react";
import styles from "./LineReveal.module.css";

interface LineRevealProps {
  /** Array of text lines to reveal */
  lines: string[];
  /** HTML tag for each line — default "span" (block) */
  tag?: "span" | "h1" | "h2" | "h3" | "h4" | "p";
  /** Base delay before first line animates */
  delay?: number;
  /** Stagger between lines in ms */
  staggerMs?: number;
  /** Intersection threshold */
  threshold?: number;
  className?: string;
  lineClassName?: string;
}

export function LineReveal({
  lines,
  tag: Tag = "span",
  delay = 0,
  staggerMs = 120,
  threshold = 0.15,
  className = "",
  lineClassName = "",
}: LineRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const lineEls = container.querySelectorAll<HTMLElement>("[data-line]");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          lineEls.forEach((el, i) => {
            setTimeout(() => {
              el.setAttribute("data-visible", "true");
            }, delay + i * staggerMs);
          });
          observer.disconnect();
        }
      },
      { threshold }
    );

    const fallback = setTimeout(() => {
      lineEls.forEach((el) => el.setAttribute("data-visible", "true"));
      observer.disconnect();
    }, 3000);

    observer.observe(container);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [delay, staggerMs, threshold]);

  return (
    <div ref={ref} className={[styles.lineRevealContainer, className].filter(Boolean).join(" ")}>
      {lines.map((line, i) => (
        <div key={i} className={styles.lineClip} aria-hidden={i > 0 ? true : undefined}>
          <Tag
            data-line={i}
            data-visible="false"
            className={[styles.line, lineClassName].filter(Boolean).join(" ")}
          >
            {line}
          </Tag>
        </div>
      ))}
    </div>
  );
}
