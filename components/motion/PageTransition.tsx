/**
 * JAECOO Palembang — Page Transition
 *
 * Wraps page content with a subtle fade-up entrance.
 * Fast, premium, not distracting.
 *
 * "use client" — uses CSS animation triggered on mount.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./PageTransition.module.css";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Trigger animation after mount
    requestAnimationFrame(() => {
      el.setAttribute("data-ready", "true");
    });
  }, []);

  return (
    <div ref={ref} className={styles.transition} data-ready="false">
      {children}
    </div>
  );
}
