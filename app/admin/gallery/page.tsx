import styles from '../dashboard.module.css'

export default function AdminPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Admin</p>
          <h1 className={styles.title}>gallery</h1>
        </div>
      </div>
      <div className={styles.goldLine} />
      <div className={styles.note}>
        <h2 className={styles.noteTitle}>Public gallery source</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', margin: 0 }}>
          Halaman publik <code>/gallery</code> dan <code>/gallery/[slug]</code> memakai media yang sudah
          di-assign di <strong>Models</strong> (slot exterior, interior, detail, technology, warna) plus
          foto delivery di <strong>Sales</strong> jika tersedia. Tidak ada hardcode path gambar.
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)', margin: '12px 0 0' }}>
          Untuk menambah foto gallery: unggah di Media, lalu assign ke slot model yang relevan di editor model.
          Section kosong otomatis disembunyikan jika belum ada asset.
        </p>
      </div>
    </div>
  )
}
