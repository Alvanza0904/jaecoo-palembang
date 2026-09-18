/**
 * JAECOO Palembang — Admin Settings
 * Shows site config + quick links
 */

import styles from '../dashboard.module.css';
import { SITE_SETTINGS } from '@/lib/data/site';

export const metadata = { title: 'Settings — JAECOO Admin' };

export default function AdminSettingsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>System</p>
          <h1 className={styles.title}>Settings</h1>
        </div>
      </div>
      <div className={styles.goldLine} />

      {/* Site Info */}
      <div className={styles.moduleSection}>
        <p className={styles.moduleCategory}>SITE CONFIGURATION</p>
        <div className={styles.moduleList}>
          {[
            { label: 'Brand Name', value: SITE_SETTINGS.brandName },
            { label: 'Dealer Name', value: SITE_SETTINGS.dealerName },
            { label: 'Sales', value: SITE_SETTINGS.salesName },
            { label: 'WhatsApp', value: `+${SITE_SETTINGS.whatsappNumber}` },
            { label: 'Instagram', value: SITE_SETTINGS.instagram },
            { label: 'TikTok', value: SITE_SETTINGS.tiktok },
            { label: 'Facebook', value: SITE_SETTINGS.facebook },
          ].map((item) => (
            <div key={item.label} className={styles.moduleRow}>
              <div className={styles.moduleInfo}>
                <span className={styles.moduleTitle} style={{ fontSize: 'var(--text-sm)' }}>{item.label}</span>
              </div>
              <div className={styles.moduleAction}>
                <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>{item.value}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.note}>
        <h2 className={styles.noteTitle}>Cara Mengubah Konfigurasi</h2>
        <ul className={styles.noteList}>
          <li>Edit <code>lib/data/site.ts</code> untuk mengubah nama dealer, WhatsApp, dan sosial media</li>
          <li>Untuk SEO global, edit <code>lib/utils/seo.ts</code></li>
          <li>Untuk Supabase URL / credentials, edit <code>.env.local</code></li>
          <li>Setelah edit, jalankan <code>npm run build</code> dan redeploy</li>
        </ul>
      </div>
    </div>
  );
}
