/**
 * JAECOO Palembang — SectionObserver
 * STEP 7C: Section entrance transition trigger.
 *
 * Adds data-entered="true" to matched sections when they
 * enter the viewport. CSS handles the actual transition.
 *
 * This is separate from the Reveal component so that:
 * - Section-level entrance (opacity + translateY) uses CSS transitions
 * - Text-level entrance uses the Reveal component
 *
 * Usage: render once in layout or page root.
 * Targets: [data-section-transition]
 *
 * "use client" — requires IntersectionObserver.
 */

"use client";

import { useEffect } from "react";

export function SectionObserver() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-section-transition]"
    );

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.setAttribute("data-entered", "true");
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
