/**
 * JAECOO Palembang — Admin Control Center
 * Step 8.7+: Central hub dengan live stats dan route map lengkap.
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
    const { count, error } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true });
    return {
      modelsCount: error ? 0 : (count ?? 0),
      isSupabaseConnected: !error,
    };
  } catch {
    return { modelsCount: 0, isSupabaseConnected: false };
  }
}

export default async function AdminDashboardPage() {
  const [stats, user] = await Promise.all([getDashboardStats(), getServerUser()]);

  const MODULES = [
    {
      category: 'CONTENT & WEBSITE',
      items: [
        {
          title: 'Homepage Content',
          description: 'Kelola teks, headline, dan SEO homepage',
          href: '/admin/homepage-content',
          live: true,
          actionText: 'Edit Content',
          stat: null,
        },
        {
          title: 'Models',
          description: 'Data spesifikasi J5 EV, J7 SHS & J8 ARDIS',
          href: '/admin/models',
          live: true,
          actionText: 'Manage Models',
          stat: `${stats.modelsCount} model`,
        },
        {
          title: 'Media Library',
          description: 'Kelola aset gambar dan media hero',
          href: '/admin/media',
          live: true,
          actionText: 'Open Library',
          stat: null,
        },
      ],
    },
    {
      category: 'MARKETING & LEADS',
      items: [
        {
          title: 'Promotions',
          description: 'Banner dan penawaran spesial',
          href: '#',
          live: false,
          actionText: 'Coming Soon',
          stat: null,
        },
        {
          title: 'News & Journal',
          description: 'Artikel, event, dan rilis pers',
          href: '#',
          live: false,
          actionText: 'Coming Soon',
          stat: null,
        },
        {
          title: 'Leads',
          description: 'Data kontak prospek dan test drive',
          href: '#',
          live: false,
          actionText: 'Coming Soon',
          stat: null,
        },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Control Center</p>
          <h1 className={styles.title}>JAECOO Palembang Admin</h1>
        </div>
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <span
              className={styles.statusDot}
              style={{ background: stats.isSupabaseConnected ? '#22c55e' : '#ef4444' }}
            />
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

      {/* Modules */}
      <div className={styles.modules}>
        {MODULES.map((section) => (
          <div key={section.category} className={styles.moduleSection}>
            <p className={styles.moduleCategory}>{section.category}</p>
            <div className={styles.moduleList}>
              {section.items.map((item) => (
                <div key={item.title} className={styles.moduleRow}>
                  <div className={styles.moduleInfo}>
                    <div className={styles.moduleMeta}>
                      <span className={item.live ? styles.moduleTitle : styles.moduleTitleMuted}>
                        {item.title}
                      </span>
                      <span className={item.live ? styles.badgeLive : styles.badgeSoon}>
                        {item.live ? 'LIVE' : 'SOON'}
                      </span>
                    </div>
                    <p className={styles.moduleDesc}>{item.description}</p>
                  </div>
                  <div className={styles.moduleAction}>
                    {item.stat && (
                      <span className={styles.moduleStat}>{item.stat}</span>
                    )}
                    {item.live ? (
                      <Link href={item.href} className={styles.actionBtn}>
                        {item.actionText}
                      </Link>
                    ) : (
                      <span className={styles.actionBtnDisabled}>{item.actionText}</span>
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
