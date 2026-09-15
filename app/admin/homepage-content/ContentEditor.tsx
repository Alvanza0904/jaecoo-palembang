'use client'

import { useState, useTransition } from 'react';
import { HomepageContent } from '@/types/homepage-content';
import { updateHomepageContent } from './actions';
import styles from './homepage-content.module.css';
import AIAssistant from '@/components/admin/ai/AIAssistant';

type ContentSection = Omit<HomepageContent, 'id' | 'updated_at'>;
type SectionKey = keyof ContentSection;

// ─────────────────────────────────────────────────────────────
// FIX KEYBOARD IPHONE: Komponen Field dan Card WAJIB dideklarasikan
// di LUAR HomepageContentEditor. Jika dideklarasikan di dalam (inline),
// setiap keystroke menyebabkan re-render → komponen Field dianggap
// elemen baru oleh React → input di-unmount & re-mount → keyboard menutup.
// ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  section: SectionKey;
  field: string;
  textarea?: boolean;
  value: string;
  onChange: (section: SectionKey, field: string, value: string) => void;
  formData: HomepageContent;
}

function Field({ label, section, field, textarea = false, value, onChange, formData }: FieldProps) {
  const isUrlField = field.toLowerCase().includes('url');

  const relevantFacts =
    section === 'dealer_location'
      ? 'Alamat Dealer: Jl. R. Sukamto, Palembang. Konsultan: Alvan (085183145926)'
      : undefined;

  const aiContext = {
    pageType: 'Homepage',
    sectionType: section as string,
    field,
    relevantFacts,
  };

  return (
    <div className={styles.field}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
        <label className={styles.label}>{label}</label>
        {!isUrlField && (
          <AIAssistant
            context={aiContext}
            currentContent={value}
            onApply={(newText) => onChange(section, field, newText)}
          />
        )}
      </div>
      {textarea ? (
        <textarea
          className={styles.textarea}
          rows={3}
          value={value}
          onChange={(e) => onChange(section, field, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(section, field, e.target.value)}
        />
      )}
    </div>
  );
}

interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Editor Component
// ─────────────────────────────────────────────────────────────

interface Props {
  initialData: HomepageContent;
}

export default function HomepageContentEditor({ initialData }: Props) {
  const [formData, setFormData] = useState<HomepageContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleChange = (section: SectionKey, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string>),
        [field]: value,
      },
    }));
  };

  const getVal = (section: SectionKey, field: string): string =>
    ((formData[section] as Record<string, string>)?.[field]) || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    startTransition(async () => {
      const result = await updateHomepageContent(formData);
      if (result.success) {
        setStatus({ type: 'success', message: 'Homepage content berhasil disimpan!' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Gagal menyimpan data.' });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {status.message && (
        <div className={status.type === 'success' ? styles.bannerSuccess : styles.bannerError}>
          <span className={styles.bannerDot} />
          {status.message}
        </div>
      )}

      <Card title="1. Homepage Hero">
        <Field label="Eyebrow (Teks Kecil di Atas)" section="hero" field="eyebrow"
          value={getVal('hero', 'eyebrow')} onChange={handleChange} formData={formData} />
        <Field label="Headline" section="hero" field="headline"
          value={getVal('hero', 'headline')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="hero" field="description" textarea
          value={getVal('hero', 'description')} onChange={handleChange} formData={formData} />
        <div className={styles.row}>
          <Field label="CTA Text" section="hero" field="ctaText"
            value={getVal('hero', 'ctaText')} onChange={handleChange} formData={formData} />
          <Field label="CTA URL" section="hero" field="ctaUrl"
            value={getVal('hero', 'ctaUrl')} onChange={handleChange} formData={formData} />
        </div>
      </Card>

      <Card title="2. Experience Section">
        <Field label="Title" section="experience" field="title"
          value={getVal('experience', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="experience" field="description" textarea
          value={getVal('experience', 'description')} onChange={handleChange} formData={formData} />
      </Card>

      <Card title="3. Technology Section">
        <Field label="Title" section="technology" field="title"
          value={getVal('technology', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="technology" field="description" textarea
          value={getVal('technology', 'description')} onChange={handleChange} formData={formData} />
      </Card>

      <Card title="4. About Section">
        <Field label="Title" section="about" field="title"
          value={getVal('about', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="about" field="description" textarea
          value={getVal('about', 'description')} onChange={handleChange} formData={formData} />
      </Card>

      <Card title="5. Promo Section">
        <Field label="Title" section="promo" field="title"
          value={getVal('promo', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="promo" field="description" textarea
          value={getVal('promo', 'description')} onChange={handleChange} formData={formData} />
        <div className={styles.row}>
          <Field label="CTA Text" section="promo" field="ctaText"
            value={getVal('promo', 'ctaText')} onChange={handleChange} formData={formData} />
          <Field label="CTA URL" section="promo" field="ctaUrl"
            value={getVal('promo', 'ctaUrl')} onChange={handleChange} formData={formData} />
        </div>
      </Card>

      <Card title="6. Journal Section">
        <Field label="Title" section="journal" field="title"
          value={getVal('journal', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="journal" field="description" textarea
          value={getVal('journal', 'description')} onChange={handleChange} formData={formData} />
      </Card>

      <Card title="7. Dealer Location">
        <Field label="Title" section="dealer_location" field="title"
          value={getVal('dealer_location', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="dealer_location" field="description" textarea
          value={getVal('dealer_location', 'description')} onChange={handleChange} formData={formData} />
        <Field label="Address" section="dealer_location" field="address" textarea
          value={getVal('dealer_location', 'address')} onChange={handleChange} formData={formData} />
      </Card>

      <Card title="8. Final CTA">
        <Field label="Title" section="final_cta" field="title"
          value={getVal('final_cta', 'title')} onChange={handleChange} formData={formData} />
        <Field label="Description" section="final_cta" field="description" textarea
          value={getVal('final_cta', 'description')} onChange={handleChange} formData={formData} />
        <div className={styles.row}>
          <Field label="CTA Text" section="final_cta" field="ctaText"
            value={getVal('final_cta', 'ctaText')} onChange={handleChange} formData={formData} />
          <Field label="CTA URL" section="final_cta" field="ctaUrl"
            value={getVal('final_cta', 'ctaUrl')} onChange={handleChange} formData={formData} />
        </div>
      </Card>

      <Card title="9. SEO Metadata">
        <Field label="Meta Title" section="seo" field="metaTitle"
          value={getVal('seo', 'metaTitle')} onChange={handleChange} formData={formData} />
        <Field label="Meta Description" section="seo" field="metaDescription" textarea
          value={getVal('seo', 'metaDescription')} onChange={handleChange} formData={formData} />
      </Card>

      <div className={styles.saveBar}>
        <span className={styles.saveHint}>Cek ulang teks sebelum menyimpan.</span>
        <button type="submit" disabled={isPending} className={styles.saveBtn}>
          {isPending ? 'Menyimpan...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
