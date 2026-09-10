/**
 * JAECOO Palembang — Reveal Motion Component
 * STEP 7C: Extended animation variant pool.
 *
 * Variants:
 *   fade-up       — rise from below (standard)
 *   fade-down     — settle from above
 *   fade          — opacity only
 *   blur          — soft blur to sharp
 *   scale         — slight grow + fade
 *   slide-left    — enter from left
 *   slide-right   — enter from right
 *   mask          — clip-path wipe reveal
 *   line-reveal   — for use with LineReveal component (wrapper)
 *
 * Respects prefers-reduced-motion via CSS.
 * "use client" — requires IntersectionObserver.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Reveal.module.css";

export type RevealVariant =
  | "fade-up"
  | "fade-down"
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

    if (threshold === 0) {
      el.style.transitionDelay = `${delay}ms`;
      el.style.animationDelay = `${delay}ms`;
      el.setAttribute("data-visible", "true");
      return;
    }

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

    const fallback = setTimeout(() => {
      el.setAttribute("data-visible", "true");
      observer.disconnect();
    }, 3000);

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [delay, threshold]);

  const cls = [
    styles.reveal,
    styles[`reveal--${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={cls} data-visible="false">
      {children}
    </div>
  );
}
