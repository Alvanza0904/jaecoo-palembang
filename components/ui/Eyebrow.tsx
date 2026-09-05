/**
 * JAECOO Palembang — Eyebrow
 *
 * Small uppercase label used above section headings.
 * Subtle gold line accent.
 */

import styles from "./Eyebrow.module.css";

interface EyebrowProps {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function Eyebrow({ children, accent = true, className = "" }: EyebrowProps) {
  return (
    <p
      className={[
        styles.eyebrow,
        accent ? styles.eyebrowAccent : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </p>
  );
}
