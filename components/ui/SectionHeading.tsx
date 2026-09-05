/**
 * JAECOO Palembang — Section Heading
 *
 * Editorial heading component.
 * Supports eyebrow (with gold accent), heading, subheading.
 */

import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: ReactNode;
  subheading?: string;
  align?: "left" | "center";
  size?: "default" | "large" | "display";
  /** Inverted for dark sections */
  inverted?: boolean;
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "left",
  size = "default",
  inverted = false,
}: SectionHeadingProps) {
  return (
    <div
      className={[
        styles.root,
        styles[`root--${align}`],
        styles[`root--${size}`],
        inverted ? styles["root--inverted"] : "",
      ].filter(Boolean).join(" ")}
    >
      {eyebrow && (
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className={styles.heading}>{heading}</h2>
      {subheading && (
        <p className={styles.subheading}>{subheading}</p>
      )}
    </div>
  );
}
