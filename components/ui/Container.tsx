/**
 * JAECOO Palembang — Container Component
 */

import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Container.module.css";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "default" | "content" | "narrow";
}

export function Container({ children, size = "default", className = "", ...rest }: ContainerProps) {
  const cls = [
    styles.container,
    size === "content" ? styles["container--content"] : "",
    size === "narrow" ? styles["container--narrow"] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
