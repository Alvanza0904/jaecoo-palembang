'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { saveNews, deleteNews, type NewsFormData } from './actions';
import { MediaPicker } from '@/components/admin/media/MediaPicker';
import type { MediaAsset } from '@/lib/types/media-asset';
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

// ── Markdown → HTML converter (no external deps) ──────────────────
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading 1 → <h2>
    if (/^# (.+)/.test(line)) {
      output.push(`<h2>${inlineConvert(line.replace(/^# /, ''))}</h2>`);
      i++;
      continue;
    }

    // Heading 2 → <h3>
    if (/^## (.+)/.test(line)) {
      output.push(`<h3>${inlineConvert(line.replace(/^## /, ''))}</h3>`);
      i++;
      continue;
    }

    // Heading 3+ → <h4>
    if (/^#{3,} (.+)/.test(line)) {
      output.push(`<h4>${inlineConvert(line.replace(/^#{3,} /, ''))}</h4>`);
      i++;
      continue;
    }

    // Unordered list — kumpulkan baris * atau - berurutan
    if (/^[*-] (.+)/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[*-] (.+)/.test(lines[i])) {
        items.push(`  <li>${inlineConvert(lines[i].replace(/^[*-] /, ''))}</li>`);
        i++;
      }
      output.push(`<ul>\n${items.join('\n')}\n</ul>`);
      continue;
    }

    // Ordered list — kumpulkan baris 1. 2. dst berurutan
    if (/^\d+\. (.+)/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. (.+)/.test(lines[i])) {
        items.push(`  <li>${inlineConvert(lines[i].replace(/^\d+\. /, ''))}</li>`);
        i++;
      }
      output.push(`<ol>\n${items.join('\n')}\n</ol>`);
      continue;
    }

    // Baris kosong → skip (pemisah paragraf)
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Teks biasa → <p>
    output.push(`<p>${inlineConvert(line)}</p>`);
    i++;
  }

  return output.join('\n');
}

/** Konversi inline: **bold**, *italic*, `code` */
function inlineConvert(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

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

// ── Rich Text Toolbar ──────────────────────────────────────────────
interface ToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChange: (val: string) => void;
  value: string;
}

function RichToolbar({ textareaRef, onChange, value }: ToolbarProps) {
  const wrap = useCallback((before: string, after: string, placeholder: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const newVal = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newVal);
    // Restore cursor after tag
    setTimeout(() => {
      el.focus();
      const pos = start + before.length + selected.length + after.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  }, [textareaRef, onChange, value]);

  const insertBlock = useCallback((tag: string, placeholder: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const selected = value.slice(el.selectionStart, el.selectionEnd) || placeholder;
    const block = `\n<${tag}>${selected}</${tag}>\n`;
    const newVal = value.slice(0, start) + block + value.slice(el.selectionEnd);
    onChange(newVal);
    setTimeout(() => { el.focus(); }, 0);
  }, [textareaRef, onChange, value]);

  const insertList = useCallback((tag: 'ul' | 'ol') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const selected = value.slice(el.selectionStart, el.selectionEnd);
    // Split selected text by newline jadi list items
    const items = selected
      ? selected.split('\n').filter(Boolean).map(l => `  <li>${l.trim()}</li>`).join('\n')
      : '  <li>Item pertama</li>\n  <li>Item kedua</li>';
    const block = `\n<${tag}>\n${items}\n</${tag}>\n`;
    const newVal = value.slice(0, start) + block + value.slice(el.selectionEnd);
    onChange(newVal);
    setTimeout(() => { el.focus(); }, 0);
  }, [textareaRef, onChange, value]);

  const insertDivider = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const newVal = value.slice(0, start) + '\n<hr>\n' + value.slice(start);
    onChange(newVal);
    setTimeout(() => { el.focus(); }, 0);
  }, [textareaRef, onChange, value]);

  const insertBlockquote = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const selected = value.slice(el.selectionStart, el.selectionEnd) || 'Kutipan penting di sini...';
    const block = `\n<blockquote>${selected}</blockquote>\n`;
    const newVal = value.slice(0, start) + block + value.slice(el.selectionEnd);
    onChange(newVal);
    setTimeout(() => { el.focus(); }, 0);
  }, [textareaRef, onChange, value]);

  return (
    <div className={editorStyles.toolbar}>
      <div className={editorStyles.toolbarGroup}>
        <span className={editorStyles.toolbarLabel}>Heading</span>
        <button type="button" className={editorStyles.toolBtn} title="Heading 2" onClick={() => insertBlock('h2', 'Judul Section')}>H2</button>
        <button type="button" className={editorStyles.toolBtn} title="Heading 3" onClick={() => insertBlock('h3', 'Sub-judul')}>H3</button>
      </div>
      <div className={editorStyles.toolbarDivider} />
      <div className={editorStyles.toolbarGroup}>
        <span className={editorStyles.toolbarLabel}>Format</span>
        <button type="button" className={editorStyles.toolBtn} title="Bold — pilih teks lalu klik" onClick={() => wrap('<strong>', '</strong>', 'teks tebal')}>
          <strong>B</strong>
        </button>
        <button type="button" className={editorStyles.toolBtn} title="Italic — pilih teks lalu klik" onClick={() => wrap('<em>', '</em>', 'teks miring')}>
          <em>I</em>
        </button>
        <button type="button" className={editorStyles.toolBtn} title="Paragraf baru" onClick={() => insertBlock('p', 'Isi paragraf...')}>¶</button>
      </div>
      <div className={editorStyles.toolbarDivider} />
      <div className={editorStyles.toolbarGroup}>
        <span className={editorStyles.toolbarLabel}>List</span>
        <button type="button" className={editorStyles.toolBtn} title="Bullet list" onClick={() => insertList('ul')}>• List</button>
        <button type="button" className={editorStyles.toolBtn} title="Numbered list" onClick={() => insertList('ol')}>1. List</button>
      </div>
      <div className={editorStyles.toolbarDivider} />
      <div className={editorStyles.toolbarGroup}>
        <span className={editorStyles.toolbarLabel}>Lainnya</span>
        <button type="button" className={editorStyles.toolBtn} title="Blockquote / kutipan" onClick={insertBlockquote}>&ldquo;&rdquo;</button>
        <button type="button" className={editorStyles.toolBtn} title="Garis pemisah" onClick={insertDivider}>─</button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export function NewsEditor({ initialNews }: { initialNews: NewsRow[] }) {
  const [news, setNews] = useState<NewsRow[]>(initialNews);
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<NewsFormData>(EMPTY_FORM);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function openNew() {
    setEditing(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setMessage(null);
    setPreviewHtml(false);
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
    setPreviewHtml(false);
  }

  function closeForm() {
    setEditing(null);
    setIsNew(false);
    setForm(EMPTY_FORM);
    setMessage(null);
    setPreviewHtml(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleBodyChange(val: string) {
    setForm(prev => ({ ...prev, body_html: val }));
  }

  function handleBodyPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text/plain');
    // Deteksi apakah teks mengandung sintaks Markdown
    const hasMarkdown = /^#{1,6} |^\*\*|^\* |^- |^\d+\. |\*\*.*\*\*/.test(text);
    if (!hasMarkdown) return; // biarkan paste normal jika bukan Markdown

    e.preventDefault();
    const html = markdownToHtml(text);

    // Sisipkan di posisi kursor jika ada teks sebelumnya
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = form.body_html ?? '';
    const newVal = current.slice(0, start) + (current && start > 0 ? '\n' : '') + html + current.slice(end);
    handleBodyChange(newVal);
  }

  function handleMediaSelect(asset: MediaAsset) {
    setForm(prev => ({ ...prev, cover_url: asset.public_url ?? '' }));
  }

  function handleSubmit() {
    if (!form.title.trim()) { setMessage({ type: 'err', text: 'Judul wajib diisi.' }); return; }
    if (!form.excerpt.trim()) { setMessage({ type: 'err', text: 'Excerpt wajib diisi.' }); return; }

    startTransition(async () => {
      const result = await saveNews(editing?.id ?? null, form);
      if (result.success) {
        setMessage({ type: 'ok', text: editing ? 'Artikel diperbarui.' : 'Artikel disimpan.' });
        setTimeout(() => window.location.reload(), 800);
      } else {
        setMessage({ type: 'err', text: JSON.stringify(result) });
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
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
        defaultCategory="news"
        title="Pilih Foto Cover"
      />

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

          {/* Cover */}
          <div className={editorStyles.field}>
            <label className={editorStyles.label}>Foto Cover</label>
            <div className={editorStyles.coverWrap}>
              {form.cover_url ? (
                <div className={editorStyles.coverPreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_url} alt="Cover preview" className={editorStyles.coverImg} />
                  <div className={editorStyles.coverActions}>
                    <button type="button" className={editorStyles.btnGhost} onClick={() => setPickerOpen(true)}>Ganti Foto</button>
                    <button type="button" className={editorStyles.btnDanger} onClick={() => setForm(p => ({ ...p, cover_url: '' }))}>Hapus</button>
                  </div>
                </div>
              ) : (
                <button type="button" className={editorStyles.coverUploadBtn} onClick={() => setPickerOpen(true)}>
                  <span className={editorStyles.coverUploadIcon}>📷</span>
                  <span>Pilih atau Upload Foto</span>
                  <span className={editorStyles.coverUploadHint}>JPG, PNG, WebP — maks. 10 MB</span>
                </button>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className={editorStyles.field}>
            <label className={editorStyles.label}>Excerpt (ringkasan singkat) *</label>
            <textarea className={editorStyles.textarea} name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} placeholder="Ringkasan artikel yang muncul di homepage dan listing..." />
          </div>

          {/* Body dengan toolbar */}
          <div className={editorStyles.field}>
            <div className={editorStyles.bodyLabelRow}>
              <label className={editorStyles.label}>Isi Artikel</label>
              <button
                type="button"
                className={editorStyles.previewToggle}
                onClick={() => setPreviewHtml(p => !p)}
              >
                {previewHtml ? '✏️ Edit' : '👁 Preview'}
              </button>
            </div>

            {!previewHtml ? (
              <div className={editorStyles.bodyEditorWrap}>
                <RichToolbar
                  textareaRef={bodyRef}
                  onChange={handleBodyChange}
                  value={form.body_html ?? ''}
                />
                <textarea
                  ref={bodyRef}
                  className={editorStyles.bodyTextarea}
                  name="body_html"
                  value={form.body_html ?? ''}
                  onChange={e => handleBodyChange(e.target.value)}
                  onPaste={handleBodyPaste}
                  rows={18}
                  placeholder="Klik tombol di toolbar untuk insert format, atau ketik HTML langsung..."
                  spellCheck={false}
                />
                <p className={editorStyles.bodyHint}>
                  💡 Pilih teks lalu klik <strong>B</strong> atau <strong>I</strong> untuk format. Klik <strong>H2 / H3</strong> untuk judul section. <strong>Preview</strong> untuk lihat hasil. Paste teks Markdown dari ChatGPT → otomatis dikonversi ke HTML.
                </p>
              </div>
            ) : (
              <div
                className={editorStyles.bodyPreview}
                dangerouslySetInnerHTML={{ __html: form.body_html ?? '<em>Belum ada konten.</em>' }}
              />
            )}
          </div>

          {/* Published */}
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
              <button className={editorStyles.btnGhost} onClick={closeForm} disabled={isPending}>Batal</button>
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
            {item.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.cover_url} alt="" className={editorStyles.listThumb} />
            )}
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
