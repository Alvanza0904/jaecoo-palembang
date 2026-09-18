/**
 * JAECOO Palembang — Admin Control Center
 */

import { createSupabaseServerClient, getServerUser } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Control Center | JAECOO Admin',
};

async function getDashboardStats() {
  try {
    const supabase = await createSupabaseServerClient();
    const [models, news, promos] = await Promise.all([
      supabase.from('models').select('*', { count: 'exact', head: true }),
      supabase.from('news').select('*', { count: 'exact', head: true }),
      supabase.from('promos').select('*', { count: 'exact', head: true }),
    ]);
    return {
      modelsCount: models.count ?? 0,
      newsCount: news.count ?? 0,
      promosCount: promos.count ?? 0,
      isConnected: !models.error,
    };
  } catch {
    return { modelsCount: 0, newsCount: 0, promosCount: 0, isConnected: false };
  }
}

export default async function AdminDashboardPage() {
  const [stats, user] = await Promise.all([getDashboardStats(), getServerUser()]);

  const MODULES = [
    {
      category: 'CONTENT & WEBSITE',
      items: [
        { title: 'Homepage', description: 'Hero, sections, dan layout halaman utama', href: '/admin/homepage', live: true, stat: null },
        { title: 'Homepage Content', description: 'Teks, headline, dan SEO homepage', href: '/admin/homepage-content', live: true, stat: null },
        { title: 'Models', description: 'Spesifikasi J5 EV, J7 SHS, J8 ARDIS SHS', href: '/admin/models', live: true, stat: `${stats.modelsCount}` },
        { title: 'News & Journal', description: 'Artikel, berita, dan rilis pers', href: '/admin/news', live: true, stat: `${stats.newsCount}` },
        { title: 'Promotions', description: 'Banner, penawaran, dan promo eksklusif', href: '/admin/promo', live: true, stat: `${stats.promosCount}` },
        { title: 'Gallery', description: 'Foto event dan galeri JAECOO Palembang', href: '/admin/gallery', live: true, stat: null },
      ],
    },
    {
      category: 'MEDIA & ASSETS',
      items: [
        { title: 'Media Library', description: 'Kelola aset gambar, hero, dan logo', href: '/admin/media', live: true, stat: null },
        { title: 'Brand Assets', description: 'Logo, warna, tipografi brand', href: '/admin/brand-assets', live: true, stat: null },
      ],
    },
    {
      category: 'SYSTEM',
      items: [
        { title: 'Settings', description: 'Konfigurasi website dan SEO global', href: '/admin/settings', live: true, stat: null },
        { title: 'Leads', description: 'Data kontak prospek dan test drive', href: '/admin/leads', live: true, stat: null },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Control Center</p>
          <h1 className={styles.title}>JAECOO Palembang Admin</h1>
        </div>
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <span className={styles.statusDot} style={{ background: stats.isConnected ? '#22c55e' : '#ef4444' }} />
            <span>Database</span>
          </div>
          <div className={styles.statusDivider} />
          <div className={styles.statusItem}>
            <span className={styles.statusDot} style={{ background: '#22c55e' }} />
            <span>Auth · {user?.email?.split('@')[0]}</span>
          </div>
        </div>
      </div>

      <div className={styles.goldLine} />

      <div className={styles.modules}>
        {MODULES.map((section) => (
          <div key={section.category} className={styles.moduleSection}>
            <p className={styles.moduleCategory}>{section.category}</p>
            <div className={styles.moduleList}>
              {section.items.map((item) => (
                <div key={item.title} className={styles.moduleRow}>
                  <div className={styles.moduleInfo}>
                    <div className={styles.moduleMeta}>
                      <span className={item.live ? styles.moduleTitle : styles.moduleTitleMuted}>{item.title}</span>
                      <span className={item.live ? styles.badgeLive : styles.badgeSoon}>{item.live ? 'LIVE' : 'SOON'}</span>
                    </div>
                    <p className={styles.moduleDesc}>{item.description}</p>
                  </div>
                  <div className={styles.moduleAction}>
                    {item.stat !== null && <span className={styles.moduleStat}>{item.stat}</span>}
                    {item.live ? (
                      <Link href={item.href} className={styles.actionBtn}>{item.title === 'Leads' ? 'View' : 'Edit'}</Link>
                    ) : (
                      <span className={styles.actionBtnDisabled}>Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
