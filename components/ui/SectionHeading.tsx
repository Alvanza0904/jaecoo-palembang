/**
 * JAECOO Palembang — Section Heading
 */

import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: ReactNode;
  subheading?: string;
  align?: "left" | "center";
  size?: "default" | "large";
}

export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = "left",
  size = "default",
}: SectionHeadingProps) {
  return (
    <div className={[styles.root, styles[`root--${align}`], styles[`root--${size}`]].join(" ")}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 className={styles.heading}>{heading}</h2>
      {subheading && <p className={styles.subheading}>{subheading}</p>}
    </div>
  );
}
