/**
 * JAECOO Palembang — Transparent Header Trigger
 *
 * "use client" — mounts on hero pages to trigger transparent header mode.
 * Sets data-hero="true" on <html>, yang dibaca oleh ScrollHeader.
 * Unmounts = header kembali solid.
 */

"use client";

import { useEffect } from "react";

export function TransparentHeader() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hero", "true");
    return () => {
      document.documentElement.removeAttribute("data-hero");
    };
  }, []);

  return null;
}
