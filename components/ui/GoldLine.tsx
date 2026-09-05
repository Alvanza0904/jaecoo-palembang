/**
 * JAECOO Palembang — Gold Line
 *
 * Minimal decorative accent line.
 * Used to signal premium section breaks.
 */

import styles from "./GoldLine.module.css";

interface GoldLineProps {
  width?: "short" | "medium" | "full";
  className?: string;
}

export function GoldLine({ width = "short", className = "" }: GoldLineProps) {
  return (
    <div
      className={[styles.line, styles[`line--${width}`], className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
