/**
 * JAECOO Palembang — Admin Dashboard
 * STEP 5A: Foundation
 *
 * Protected by middleware + AdminLayout server-side auth check.
 * Shows overview tiles — content will be populated in later steps.
 */

import { getServerUser } from '@/lib/supabase/server'
import styles from './dashboard.module.css'

const TILES = [
  { label: 'Models', value: '3', sub: 'J5 EV, J7 SHS, J8 Ardis', href: '/admin/models', status: 'soon' },
  { label: 'Promo', value: '—', sub: 'Promo aktif', href: '/admin/promo', status: 'soon' },
  { label: 'News', value: '—', sub: 'Artikel dipublish', href: '/admin/news', status: 'soon' },
  { label: 'Gallery', value: '—', sub: 'Foto dipublish', href: '/admin/gallery', status: 'soon' },
  { label: 'Leads', value: '—', sub: 'Leads masuk', href: '/admin/leads', status: 'soon' },
]

export default async function AdminDashboardPage() {
  const user = await getServerUser()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Selamat pagi'
    if (h < 17) return 'Selamat siang'
    return 'Selamat malam'
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting()}</p>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaLabel}>Logged in as</span>
          <span className={styles.metaValue}>{user?.email}</span>
        </div>
      </div>

      <div className={styles.goldLine} />

      {/* Status Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerDot} />
        <span>Supabase terhubung — STEP 4B ✓ &nbsp;·&nbsp; Admin Auth aktif — STEP 5A ✓</span>
      </div>

      {/* Tiles */}
      <div className={styles.tiles}>
        {TILES.map((tile) => (
          <a key={tile.href} href={tile.href} className={styles.tile}>
            <div className={styles.tileLabel}>{tile.label}</div>
            <div className={styles.tileValue}>{tile.value}</div>
            <div className={styles.tileSub}>{tile.sub}</div>
            {tile.status === 'soon' && tile.label !== 'Models' && (
              <span className={styles.tileBadge}>Coming soon</span>
            )}
          </a>
        ))}
      </div>

      {/* Architecture note */}
      <div className={styles.note}>
        <h2 className={styles.noteTitle}>Architecture Status</h2>
        <ul className={styles.noteList}>
          <li>✅ Supabase Auth — email/password</li>
          <li>✅ Middleware route protection — /admin/*</li>
          <li>✅ Server-side session verification</li>
          <li>✅ Cookie-based session (persist on refresh)</li>
          <li>✅ Logout bersih</li>
          <li>✅ Role foundation siap (admin / alvan)</li>
          <li>⏳ Model editor — STEP 5B</li>
          <li>⏳ Promo / News / Gallery editor — berikutnya</li>
        </ul>
      </div>
    </div>
  )
}
