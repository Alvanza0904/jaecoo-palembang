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


// ── Markdown → HTML converter (no external deps) ─────────────────────────────
// Digunakan saat paste: mengonversi Markdown dari clipboard (AI tools, dll)
// menjadi HTML yang setara, lalu disanitasi sebelum dimasukkan ke editor.
function markdownToHtml(md: string): string {
  // Normalisasi line endings
  const s = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Escape HTML entities yang ada di input supaya tidak jadi raw HTML
  // (keamanan: user tidak bisa inject arbitrary tag via plain-text paste)
  const escapeHtml = (t: string) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Pisah per blok (paragraf dipisah double newline)
  // Tapi jaga heading, list, blockquote agar tidak dipecah lebih dulu
  const lines = s.split('\n');
  const htmlLines: string[] = [];
  let i = 0;
  let inList: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (inList) {
      htmlLines.push(inList === 'ul' ? '</ul>' : '</ol>');
      inList = null;
    }
  };

  // Inline formatting (dipanggil pada konten dalam blok)
  const inlineFmt = (t: string): string => {
    // Escape HTML dulu pada raw text
    t = escapeHtml(t);
    // bold+italic: ***text*** atau ___text___
    t = t.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
    t = t.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>');
    // bold: **text** atau __text__
    t = t.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
    t = t.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');
    // italic: *text* atau _text_
    t = t.replace(/\*([^*]+?)\*/g, '<em>$1</em>');
    t = t.replace(/_([^_]+?)_/g, '<em>$1</em>');
    // strikethrough: ~~text~~
    t = t.replace(/~~(.+?)~~/g, '<s>$1</s>');
    // inline code: `code`
    t = t.replace(/`([^`]+?)`/g, '<code>$1</code>');
    // link: [text](url)
    t = t.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2">$1</a>');
    return t;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Heading: # Heading (1-6)
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      htmlLines.push(`<h${level}>${inlineFmt(hMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote: > text (greedy: gabungkan baris berturutan)
    if (line.match(/^>\s?/)) {
      closeList();
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].match(/^>\s?/)) {
        bqLines.push(inlineFmt(lines[i].replace(/^>\s?/, '')));
        i++;
      }
      htmlLines.push(`<blockquote><p>${bqLines.join('<br>')}</p></blockquote>`);
      continue;
    }

    // Horizontal rule: --- atau *** atau ___
    if (line.match(/^(---+|\*\*\*+|___+)\s*$/)) {
      closeList();
      htmlLines.push('<hr>');
      i++;
      continue;
    }

    // Unordered list: - item, * item, + item
    const ulMatch = line.match(/^[\-\*\+]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== 'ul') {
        closeList();
        htmlLines.push('<ul>');
        inList = 'ul';
      }
      htmlLines.push(`<li>${inlineFmt(ulMatch[1])}</li>`);
      i++;
      continue;
    }

    // Ordered list: 1. item
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== 'ol') {
        closeList();
        htmlLines.push('<ol>');
        inList = 'ol';
      }
      htmlLines.push(`<li>${inlineFmt(olMatch[1])}</li>`);
      i++;
      continue;
    }

    // Empty line = end of list, or paragraph separator
    if (line.trim() === '') {
      closeList();
      htmlLines.push(''); // separator
      i++;
      continue;
    }

    // Plain paragraph line — kumpulkan sampai baris kosong / blok lain
    closeList();
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].match(/^>\s?/) &&
      !lines[i].match(/^[\-\*\+]\s/) &&
      !lines[i].match(/^\d+\.\s/) &&
      !lines[i].match(/^(---+|\*\*\*+|___+)\s*$/)
    ) {
      paraLines.push(inlineFmt(lines[i]));
      i++;
    }
    if (paraLines.length > 0) {
      htmlLines.push(`<p>${paraLines.join('<br>')}</p>`);
    }
  }

  closeList();

  // Gabungkan, hapus separator berulang, trim
  return htmlLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}


// Deteksi apakah teks terlihat seperti Markdown
function looksLikeMarkdown(text: string): boolean {
  return /^#{1,6}\s/m.test(text)
    || /\*\*[\s\S]+?\*\*/.test(text)
    || /(?<!\*)\*(?!\*)[\s\S]+?(?<!\*)\*(?!\*)/.test(text)
    || /~~[\s\S]+?~~/.test(text)
    || /^[\-\*\+]\s+/m.test(text)
    || /^\d+\.\s+/m.test(text)
    || /^>\s?/m.test(text)
    || /\[[\s\S]+?\]\([\s\S]+?\)/.test(text);
}

// Plain text (tanpa Markdown) → HTML paragraf
function plainToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

// ── Rich-text → sanitized HTML (untuk paste dari browser/Google Docs) ─────────
function sanitizeRichHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Tag yang diizinkan di output
  const ALLOWED = new Set([
    'B','STRONG','I','EM','U','S','DEL','STRIKE',
    'H1','H2','H3','H4','H5','H6',
    'UL','OL','LI','P','BR','BLOCKQUOTE','HR',
    'SPAN','DIV','A','CODE','PRE',
  ]);

  function clean(node: Element) {
    for (const child of Array.from(node.children).reverse()) {
      if (!ALLOWED.has(child.tagName)) {
        // Ganti dengan isi, bukan buang sama sekali
        child.replaceWith(...Array.from(child.childNodes));
      } else {
        // Hapus semua atribut kecuali href di <a> dan style bold/italic di span
        for (const attr of Array.from(child.attributes)) {
          const keep =
            (child.tagName === 'A' && attr.name === 'href') ||
            (child.tagName === 'SPAN' && attr.name === 'style');
          if (!keep) child.removeAttribute(attr.name);
        }
        // Konversi span style="font-weight:bold" → strong, dsb.
        if (child.tagName === 'SPAN') {
          const style = (child as HTMLElement).style;
          if (style.fontWeight === 'bold' || style.fontWeight === '700') {
            const strong = document.createElement('strong');
            strong.innerHTML = child.innerHTML;
            child.replaceWith(strong);
            clean(strong);
            continue;
          }
          if (style.fontStyle === 'italic') {
            const em = document.createElement('em');
            em.innerHTML = child.innerHTML;
            child.replaceWith(em);
            clean(em);
            continue;
          }
          if (style.textDecoration?.includes('line-through')) {
            const s = document.createElement('s');
            s.innerHTML = child.innerHTML;
            child.replaceWith(s);
            clean(s);
            continue;
          }
          // Span tanpa style berguna → unwrap
          child.replaceWith(...Array.from(child.childNodes));
          continue;
        }
        clean(child);
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
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

  // Paste: robust handler untuk Markdown (dari AI tools) dan rich text (dari browser/Docs)
  // Alur:
  //   1. Ada text/html di clipboard → sanitize rich HTML (Google Docs, browser copy, dll)
  //   2. Tidak ada HTML / HTML hanya berisi plain text → deteksi Markdown → konversi ke HTML
  //   3. Tidak ada formatting sama sekali → insert sebagai paragraf biasa
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipHtml = e.clipboardData.getData('text/html');
    const clipText = e.clipboardData.getData('text/plain');

    let insertHtml = '';

    if (clipHtml && clipHtml.trim()) {
      // Cek apakah HTML dari clipboard mengandung formatting nyata
      // (bukan hanya wrapper kosong dari beberapa aplikasi)
      const stripped = clipHtml.replace(/<[^>]+>/g, '').trim();
      const hasRealFormatting = /<(strong|b|em|i|h[1-6]|ul|ol|li|blockquote|s|del|strike)\b/i.test(clipHtml);

      if (hasRealFormatting) {
        // Rich text dari browser/Google Docs/Word → sanitize
        insertHtml = sanitizeRichHtml(clipHtml);
      } else {
        // HTML wrapper tapi isinya flat text → perlakukan sebagai plain text
        // supaya Markdown syntax dari AI tools tidak hilang
        const text = stripped || clipText;
        insertHtml = looksLikeMarkdown(text) ? markdownToHtml(text) : plainToHtml(text);
      }
    } else if (clipText && clipText.trim()) {
      // Pure plain text (terminal, AI tools, Notepad, dll)
      insertHtml = looksLikeMarkdown(clipText) ? markdownToHtml(clipText) : plainToHtml(clipText);
    }

    if (insertHtml) {
      document.execCommand('insertHTML', false, insertHtml);
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
        data-placeholder="Paste artikel dari ChatGPT/Claude/Gemini langsung di sini — Markdown (**bold**, *italic*, ## Heading, - list) otomatis dikonversi. Atau ketik dan format dengan toolbar di atas."
        spellCheck={false}
      />
      <p className={editorStyles.bodyHint}>
        💡 Paste dari ChatGPT/Claude/Gemini → format Markdown otomatis dipertahankan. Paste dari Google Docs/browser → rich text dikonversi. Atau ketik manual dan gunakan toolbar.
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
