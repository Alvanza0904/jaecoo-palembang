/**
 * JAECOO Palembang — Reveal Motion Component
 *
 * Scroll-triggered entrance animation.
 * Respects prefers-reduced-motion automatically via CSS.
 *
 * "use client" — requires IntersectionObserver.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Reveal.module.css";

type RevealVariant = "fade-up" | "fade" | "blur" | "scale" | "slide-left" | "slide-right";

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
  threshold = 0.15,
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
          el.setAttribute("data-visible", "true");
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={[styles.reveal, styles[`reveal--${variant}`], className].filter(Boolean).join(" ")}
      data-visible="false"
    >
      {children}
    </div>
  );
}
