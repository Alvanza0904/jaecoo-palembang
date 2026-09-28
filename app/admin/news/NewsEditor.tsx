'use client';

import { useState, useTransition, useRef, useCallback, useEffect } from 'react';
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

// ── WYSIWYG Toolbar ────────────────────────────────────────────────
interface ToolbarProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onChange: (html: string) => void;
}

function RichToolbar({ editorRef, onChange }: ToolbarProps) {
  const exec = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    // Ambil HTML terbaru setelah eksekusi
    setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  }, [editorRef, onChange]);

  const insertBlock = useCallback((tag: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const text = sel.toString() || 'Judul section';
    const el = document.createElement(tag);
    el.textContent = text;
    range.deleteContents();
    range.insertNode(el);
    // Pindah kursor ke setelah elemen
    range.setStartAfter(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  }, [editorRef, onChange]);

  const insertList = useCallback((tag: 'ul' | 'ol') => {
    editorRef.current?.focus();
    document.execCommand(tag === 'ul' ? 'insertUnorderedList' : 'insertOrderedList', false);
    setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  }, [editorRef, onChange]);

  const insertDivider = useCallback(() => {
    editorRef.current?.focus();
    document.execCommand('insertHorizontalRule', false);
    setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  }, [editorRef, onChange]);

  const insertBlockquote = useCallback(() => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const text = sel.toString() || 'Kutipan penting di sini...';
    const bq = document.createElement('blockquote');
    bq.textContent = text;
    range.deleteContents();
    range.insertNode(bq);
    range.setStartAfter(bq);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  }, [editorRef, onChange]);

  return (
    <div className={editorStyles.toolbar}>
      <div className={editorStyles.toolbarGroup}>
        <span className={editorStyles.toolbarLabel}>Heading</span>
        <button type="button" className={editorStyles.toolBtn} title="Heading 2" onClick={() => insertBlock('h2')}>H2</button>
        <button type="button" className={editorStyles.toolBtn} title="Heading 3" onClick={() => insertBlock('h3')}>H3</button>
      </div>
      <div className={editorStyles.toolbarDivider} />
      <div className={editorStyles.toolbarGroup}>
        <span className={editorStyles.toolbarLabel}>Format</span>
        <button type="button" className={editorStyles.toolBtn} title="Bold — pilih teks lalu klik" onClick={() => exec('bold')}>
          <strong>B</strong>
        </button>
        <button type="button" className={editorStyles.toolBtn} title="Italic — pilih teks lalu klik" onClick={() => exec('italic')}>
          <em>I</em>
        </button>
        <button type="button" className={editorStyles.toolBtn} title="Underline" onClick={() => exec('underline')}>
          <u>U</u>
        </button>
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

// ── WYSIWYG Editor ─────────────────────────────────────────────────
interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function WysiwygEditor({ value, onChange }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Track apakah sedang user yang ngetik (bukan update dari luar)
  const isUserEditing = useRef(false);

  // Sync value dari luar ke editor (misal saat buka artikel lama)
  useEffect(() => {
    if (editorRef.current && !isUserEditing.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value ?? '';
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    isUserEditing.current = true;
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    // Reset flag setelah selesai
    setTimeout(() => { isUserEditing.current = false; }, 100);
  }, [onChange]);

  // Paste: pertahankan bold/italic/heading, buang tag berbahaya
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      // Parse HTML dari clipboard, buang tag berbahaya
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const ALLOWED = new Set(['B','STRONG','I','EM','U','H1','H2','H3','H4','UL','OL','LI','P','BR','BLOCKQUOTE','HR','SPAN','DIV','A']);
      function clean(node: Element) {
        Array.from(node.children).forEach(child => {
          if (!ALLOWED.has(child.tagName)) {
            // Ganti node tidak diizinkan dengan kontennya saja
            child.replaceWith(...Array.from(child.childNodes));
          } else {
            // Hapus semua atribut kecuali href di <a>
            Array.from(child.attributes).forEach(attr => {
              if (!(child.tagName === 'A' && attr.name === 'href')) {
                child.removeAttribute(attr.name);
              }
            });
            clean(child);
          }
        });
      }
      clean(doc.body);
      document.execCommand('insertHTML', false, doc.body.innerHTML);
    } else {
      document.execCommand('insertText', false, text);
    }

    setTimeout(() => {
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    }, 0);
  }, [onChange]);

  return (
    <div className={editorStyles.bodyEditorWrap}>
      <RichToolbar editorRef={editorRef} onChange={onChange} />
      <div
        ref={editorRef}
        className={editorStyles.wysiwygEditor}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder="Ketik isi artikel di sini... Pilih teks lalu klik toolbar untuk format."
        spellCheck={false}
      />
      <p className={editorStyles.bodyHint}>
        💡 Pilih teks → klik <strong>B</strong>, <strong>I</strong>, <strong>H2</strong>, dll di toolbar. Enter untuk paragraf baru.
      </p>
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

          {/* Body WYSIWYG */}
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
              <WysiwygEditor value={form.body_html ?? ''} onChange={handleBodyChange} />
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
