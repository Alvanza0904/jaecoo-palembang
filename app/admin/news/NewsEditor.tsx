'use client';

import { useState, useTransition } from 'react';
import { saveNews, deleteNews, type NewsFormData } from './actions';
import styles from '../dashboard.module.css';
import editorStyles from './news.module.css';

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html?: string;
  category: string;
  cover_url?: string;
  published: boolean;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
}

const CATEGORIES = ['Brand', 'Produk', 'Promo', 'Event', 'Tips', 'Teknologi'];

const EMPTY_FORM: NewsFormData = {
  title: '',
  slug: '',
  excerpt: '',
  body_html: '',
  category: 'Brand',
  cover_url: '',
  published: false,
  published_at: new Date().toISOString().split('T')[0],
  meta_title: '',
  meta_description: '',
};

export function NewsEditor({ initialNews }: { initialNews: NewsRow[] }) {
  const [news, setNews] = useState<NewsRow[]>(initialNews);
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<NewsFormData>(EMPTY_FORM);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function openNew() {
    setEditing(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setMessage(null);
  }

  function openEdit(item: NewsRow) {
    setEditing(item);
    setIsNew(false);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      body_html: item.body_html ?? '',
      category: item.category,
      cover_url: item.cover_url ?? '',
      published: item.published,
      published_at: item.published_at?.split('T')[0] ?? '',
      meta_title: item.meta_title ?? '',
      meta_description: item.meta_description ?? '',
    });
    setMessage(null);
  }

  function closeForm() {
    setEditing(null);
    setIsNew(false);
    setForm(EMPTY_FORM);
    setMessage(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit() {
    if (!form.title.trim()) { setMessage({ type: 'err', text: 'Judul wajib diisi.' }); return; }
    if (!form.excerpt.trim()) { setMessage({ type: 'err', text: 'Excerpt wajib diisi.' }); return; }

    startTransition(async () => {
      const result = await saveNews(editing?.id ?? null, form);
      if (result.success) {
        setMessage({ type: 'ok', text: editing ? 'Artikel diperbarui.' : 'Artikel disimpan.' });
        // Reload list
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMessage({ type: 'err', text: result.error ?? 'Gagal menyimpan.' });
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteNews(id);
      if (result.success) {
        setNews(prev => prev.filter(n => n.id !== id));
        setConfirmDelete(null);
        closeForm();
      } else {
        setMessage({ type: 'err', text: result.error ?? 'Gagal menghapus.' });
        setConfirmDelete(null);
      }
    });
  }

  const showForm = isNew || editing !== null;

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Content</p>
          <h1 className={styles.title}>News &amp; Journal</h1>
        </div>
        <button className={editorStyles.btnPrimary} onClick={openNew} disabled={isPending}>
          + Artikel Baru
        </button>
      </div>
      <div className={styles.goldLine} />

      {/* Form */}
      {showForm && (
        <div className={editorStyles.formCard}>
          <div className={editorStyles.formHeader}>
            <h2 className={editorStyles.formTitle}>{isNew ? 'Artikel Baru' : 'Edit Artikel'}</h2>
            <button className={editorStyles.btnGhost} onClick={closeForm}>✕ Tutup</button>
          </div>

          {message && (
            <div className={message.type === 'ok' ? editorStyles.alertOk : editorStyles.alertErr}>
              {message.text}
            </div>
          )}

          <div className={editorStyles.grid2}>
            <div className={editorStyles.field}>
              <label className={editorStyles.label}>Judul *</label>
              <input className={editorStyles.input} name="title" value={form.title} onChange={handleChange} placeholder="Judul artikel" />
            </div>
            <div className={editorStyles.field}>
              <label className={editorStyles.label}>Slug (auto-generate jika kosong)</label>
              <input className={editorStyles.input} name="slug" value={form.slug} onChange={handleChange} placeholder="judul-artikel" />
            </div>
          </div>

          <div className={editorStyles.grid2}>
            <div className={editorStyles.field}>
              <label className={editorStyles.label}>Kategori *</label>
              <select className={editorStyles.input} name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={editorStyles.field}>
              <label className={editorStyles.label}>Tanggal Publish</label>
              <input className={editorStyles.input} type="date" name="published_at" value={form.published_at} onChange={handleChange} />
            </div>
          </div>

          <div className={editorStyles.field}>
            <label className={editorStyles.label}>URL Foto Cover</label>
            <input className={editorStyles.input} name="cover_url" value={form.cover_url} onChange={handleChange} placeholder="https://..." />
            {form.cover_url && <img src={form.cover_url} alt="preview" className={editorStyles.imgPreview} />}
          </div>

          <div className={editorStyles.field}>
            <label className={editorStyles.label}>Excerpt (ringkasan singkat) *</label>
            <textarea className={editorStyles.textarea} name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} placeholder="Ringkasan artikel yang muncul di homepage dan listing..." />
          </div>

          <div className={editorStyles.field}>
            <label className={editorStyles.label}>Isi Artikel (HTML)</label>
            <textarea className={editorStyles.textarea} name="body_html" value={form.body_html} onChange={handleChange} rows={12} placeholder="<p>Isi artikel dalam format HTML...</p>" style={{ fontFamily: 'monospace', fontSize: '13px' }} />
          </div>

          <div className={editorStyles.fieldRow}>
            <label className={editorStyles.checkLabel}>
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className={editorStyles.checkbox} />
              Published (tampil di website)
            </label>
          </div>

          <div className={editorStyles.formFooter}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className={editorStyles.btnPrimary} onClick={handleSubmit} disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan Artikel'}
              </button>
              <button className={editorStyles.btnGhost} onClick={closeForm} disabled={isPending}>
                Batal
              </button>
            </div>
            {editing && (
              confirmDelete === editing.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-muted)' }}>Yakin hapus?</span>
                  <button className={editorStyles.btnDanger} onClick={() => handleDelete(editing.id)} disabled={isPending}>Ya, Hapus</button>
                  <button className={editorStyles.btnGhost} onClick={() => setConfirmDelete(null)}>Batal</button>
                </div>
              ) : (
                <button className={editorStyles.btnDanger} onClick={() => setConfirmDelete(editing.id)}>Hapus Artikel</button>
              )
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className={styles.moduleList}>
        {news.length === 0 && (
          <div className={styles.note} style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--color-ink-muted)', marginBottom: '1rem' }}>Belum ada artikel.</p>
            <button className={editorStyles.btnPrimary} onClick={openNew}>+ Buat Artikel Pertama</button>
          </div>
        )}
        {news.map(item => (
          <div key={item.id} className={styles.moduleRow}>
            <div className={styles.moduleInfo}>
              <div className={styles.moduleMeta}>
                <span className={styles.moduleTitle}>{item.title}</span>
                <span className={item.published ? styles.badgeLive : styles.badgeSoon}>
                  {item.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className={styles.moduleDesc}>
                {item.category} · {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className={styles.moduleAction} style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={editorStyles.actionBtn} onClick={() => openEdit(item)}>Edit</button>
              <a href={`/berita/${item.slug}`} target="_blank" rel="noopener noreferrer" className={editorStyles.actionBtnGhost}>Preview ↗</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
