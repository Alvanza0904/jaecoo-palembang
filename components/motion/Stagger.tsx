/**
 * JAECOO Palembang — Stagger Container
 *
 * Wraps children with staggered Reveal delays.
 */

"use client";

import { Children, type ReactNode } from "react";
import { Reveal } from "./Reveal";
import type { ComponentProps } from "react";

interface StaggerProps {
  children: ReactNode;
  delay?: number;
  staggerMs?: number;
  variant?: ComponentProps<typeof Reveal>["variant"];
}

export function Stagger({ children, delay = 0, staggerMs = 100, variant = "fade-up" }: StaggerProps) {
  return (
    <>
      {Children.map(children, (child, i) => (
        <Reveal key={i} variant={variant} delay={delay + i * staggerMs}>
          {child}
        </Reveal>
      ))}
    </>
  );
}
