import styles from '../../dashboard.module.css'

export default function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Admin</p>
          <h1 className={styles.title}>news</h1>
        </div>
      </div>
      <div className={styles.goldLine} />
      <div className={styles.note}>
        <h2 className={styles.noteTitle}>Coming Soon</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', margin: 0 }}>
          Halaman ini akan dibuat pada step berikutnya.
        </p>
      </div>
    </div>
  )
}
