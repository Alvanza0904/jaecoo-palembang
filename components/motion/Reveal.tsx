/**
 * JAECOO Palembang — Reveal Motion Component
 *
 * Scroll-triggered entrance animations.
 * Variants: fade-up, fade, blur, scale, slide-left, slide-right, mask
 * Respects prefers-reduced-motion via CSS.
 *
 * "use client" — requires IntersectionObserver.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Reveal.module.css";

export type RevealVariant =
  | "fade-up"
  | "fade"
  | "blur"
  | "scale"
  | "slide-left"
  | "slide-right"
  | "mask";

interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  threshold?: number;
  className?: string;
}

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  threshold = 0.12,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.style.animationDelay = `${delay}ms`;
          el.setAttribute("data-visible", "true");
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const cls = [
    styles.reveal,
    styles[`reveal--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={cls}
      data-visible="false"
    >
      {children}
    </div>
  );
}
