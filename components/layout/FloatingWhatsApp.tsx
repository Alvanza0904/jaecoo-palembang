"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppUrl, SALES_NAME } from "@/lib/utils/whatsapp";
import styles from "./FloatingWhatsApp.module.css";

const HINT = `Konsultasi JAECOO dengan ${SALES_NAME}`;

export function FloatingWhatsApp() {
  const [hint, setHint] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const href = buildWhatsAppUrl(
    { source: "other", source_cta: "floating_whatsapp" },
    `Hai ${SALES_NAME}, saya melihat website JAECOO Palembang dan ingin mendapatkan informasi mengenai JAECOO.`,
  );

  useEffect(() => {
    const show = window.setTimeout(() => setHint(true), 2800);
    const hide = window.setTimeout(() => setHint(false), 7200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  const visible = hint || engaged;

  return (
    <div className={styles.wrap}>
      <p className={visible ? styles.hintVisible : styles.hint} aria-hidden={!visible}>
        {HINT}
      </p>
      <a
        className={styles.button}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat WhatsApp dengan ${SALES_NAME}`}
        onMouseEnter={() => setEngaged(true)}
        onMouseLeave={() => setEngaged(false)}
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
          <path
            fill="currentColor"
            d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.76 13.92c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.25-4.76-4.15-4.9-4.35-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.39.85-.39h.61c.2 0 .46-.07.72.55.27.64.91 2.22.99 2.38.08.16.13.35.03.56-.1.21-.15.34-.3.52-.14.18-.3.4-.43.54-.14.14-.29.29-.12.57.16.27.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.44.12.6-.07.17-.19.71-.82.9-1.1.19-.29.38-.24.64-.14.26.1 1.66.78 1.95.92.28.14.47.21.54.33.07.12.07.69-.17 1.37Z"
          />
        </svg>
      </a>
    </div>
  );
}
