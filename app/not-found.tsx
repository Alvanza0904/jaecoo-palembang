/**
 * JAECOO Palembang — 404 Not Found
 */

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <section className={styles.section}>
      <Container size="narrow">
        <div className={styles.content}>
          <p className={styles.code}>404</p>
          <h1 className={styles.heading}>Halaman tidak ditemukan.</h1>
          <p className={styles.body}>
            Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </p>
          <Button as="link" href="/" variant="primary" size="md">
            Kembali ke Beranda
          </Button>
        </div>
      </Container>
    </section>
  );
}
