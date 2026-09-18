/**
 * JAECOO Palembang — Admin Leads
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils/format';
import styles from '../dashboard.module.css';

export const metadata = { title: 'Leads — JAECOO Admin' };
export const revalidate = 0;

interface Lead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
  model?: string;
  message?: string;
  created_at: string;
}

async function getLeads(): Promise<Lead[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminLeadsPage() {
  const leads = await getLeads();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Marketing</p>
          <h1 className={styles.title}>Leads &amp; Kontak</h1>
        </div>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)' }}>
          {leads.length} leads
        </span>
      </div>

      <div className={styles.goldLine} />

      {leads.length === 0 ? (
        <div className={styles.note}>
          <h2 className={styles.noteTitle}>Belum ada leads</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-muted)' }}>
            Data leads akan muncul di sini setelah pengunjung menghubungi melalui form atau WhatsApp.
            Pastikan tabel <code>leads</code> sudah dibuat di Supabase.
          </p>
        </div>
      ) : (
        <div className={styles.moduleList}>
          {leads.map((lead) => (
            <div key={lead.id} className={styles.moduleRow}>
              <div className={styles.moduleInfo}>
                <div className={styles.moduleMeta}>
                  <span className={styles.moduleTitle}>{lead.name ?? 'Tanpa nama'}</span>
                  {lead.model && (
                    <span className={styles.badgeLive}>{lead.model}</span>
                  )}
                </div>
                <p className={styles.moduleDesc}>
                  {lead.phone && `📞 ${lead.phone}`}
                  {lead.email && ` · ${lead.email}`}
                  {lead.source && ` · ${lead.source}`}
                  {' · '}{formatDate(lead.created_at)}
                </p>
                {lead.message && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-subtle)', marginTop: 'var(--space-1)' }}>
                    {lead.message}
                  </p>
                )}
              </div>
              {lead.phone && (
                <div className={styles.moduleAction}>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
