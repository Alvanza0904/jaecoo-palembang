/**
 * JAECOO Palembang — Admin News Management
 */

import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import styles from '../dashboard.module.css';

export const metadata = { title: 'News — JAECOO Admin' };
export const revalidate = 0;

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  published: boolean;
  published_at: string;
}

async function getNews(): Promise<NewsRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('news')
      .select('id, slug, title, category, published, published_at')
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminNewsPage() {
  const news = await getNews();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Content</p>
          <h1 className={styles.title}>News &amp; Journal</h1>
        </div>
        <div className={styles.statusBar}>
          <span className={styles.statusItem} style={{ color: 'var(--color-ink-muted)', fontSize: 'var(--text-sm)' }}>
            {news.length} artikel
          </span>
        </div>
      </div>

      <div className={styles.goldLine} />

      <div className={styles.note} style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)' }}>
          Artikel dikelola langsung melalui <strong>Supabase Dashboard</strong> → Table: <code>news</code>.
          Kolom: <code>title</code>, <code>slug</code>, <code>excerpt</code>, <code>body_html</code>, <code>category</code>, <code>cover_url</code>, <code>published</code>.
        </p>
      </div>

      {news.length === 0 ? (
        <div className={styles.note}>
          <h2 className={styles.noteTitle}>Belum ada artikel</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)' }}>
            Tambahkan artikel di Supabase Dashboard pada tabel <code>news</code>.
          </p>
        </div>
      ) : (
        <div className={styles.moduleList}>
          {news.map((item) => (
            <div key={item.id} className={styles.moduleRow}>
              <div className={styles.moduleInfo}>
                <div className={styles.moduleMeta}>
                  <span className={styles.moduleTitle}>{item.title}</span>
                  <span className={item.published ? styles.badgeLive : styles.badgeSoon}>
                    {item.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className={styles.moduleDesc}>
                  {item.category} · {formatDate(item.published_at)}
                </p>
              </div>
              <div className={styles.moduleAction}>
                <Link
                  href={`/berita/${item.slug}`}
                  target="_blank"
                  className={styles.actionBtn}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Preview ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
