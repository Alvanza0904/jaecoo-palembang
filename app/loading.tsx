/**
 * JAECOO Palembang — Root Loading State
 */

import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.loading} aria-label="Memuat..." role="status">
      <div className={styles.bar} />
    </div>
  );
}
