/**
 * JAECOO Palembang — Error Boundary
 * "use client" required by Next.js
 */

"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import styles from "./error.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={styles.section}>
      <Container size="narrow">
        <div className={styles.content}>
          <p className={styles.label}>Terjadi Kesalahan</p>
          <h1 className={styles.heading}>Sesuatu tidak berjalan dengan benar.</h1>
          <p className={styles.body}>
            Silakan coba lagi. Jika masalah berlanjut, hubungi Sales kami via WhatsApp.
          </p>
          <Button variant="primary" size="md" onClick={reset}>
            Coba Lagi
          </Button>
        </div>
      </Container>
    </section>
  );
}
