'use client'

import { useState, useTransition } from 'react';
import { HomepageContent } from '@/types/homepage-content';
import { updateHomepageContent } from './actions';
import styles from './homepage-content.module.css';

type ContentSection = Omit<HomepageContent, 'id' | 'updated_at'>;
type SectionKey = keyof ContentSection;

interface Props {
  initialData: HomepageContent;
}

export default function HomepageContentEditor({ initialData }: Props) {
  const [formData, setFormData] = useState<HomepageContent>(initialData);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

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
    ((formData[section] as Record<string, string>)[field]) || '';

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

  const Field = ({
    label,
    section,
    field,
    textarea = false,
  }: {
    label: string;
    section: SectionKey;
    field: string;
    textarea?: boolean;
  }) => (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {textarea ? (
        <textarea
          className={styles.textarea}
          rows={3}
          value={getVal(section, field)}
          onChange={(e) => handleChange(section, field, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={styles.input}
          value={getVal(section, field)}
          onChange={(e) => handleChange(section, field, e.target.value)}
        />
      )}
    </div>
  );

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {status.message && (
        <div className={status.type === 'success' ? styles.bannerSuccess : styles.bannerError}>
          <span className={styles.bannerDot} />
          {status.message}
        </div>
      )}

      <Card title="1. Homepage Hero">
        <Field label="Eyebrow (Teks Kecil di Atas)" section="hero" field="eyebrow" />
        <Field label="Headline" section="hero" field="headline" />
        <Field label="Description" section="hero" field="description" textarea />
        <div className={styles.row}>
          <Field label="CTA Text" section="hero" field="ctaText" />
          <Field label="CTA URL" section="hero" field="ctaUrl" />
        </div>
      </Card>

      <Card title="2. Experience Section">
        <Field label="Title" section="experience" field="title" />
        <Field label="Description" section="experience" field="description" textarea />
      </Card>

      <Card title="3. Technology Section">
        <Field label="Title" section="technology" field="title" />
        <Field label="Description" section="technology" field="description" textarea />
      </Card>

      <Card title="4. About Section">
        <Field label="Title" section="about" field="title" />
        <Field label="Description" section="about" field="description" textarea />
      </Card>

      <Card title="5. Promo Section">
        <Field label="Title" section="promo" field="title" />
        <Field label="Description" section="promo" field="description" textarea />
        <div className={styles.row}>
          <Field label="CTA Text" section="promo" field="ctaText" />
          <Field label="CTA URL" section="promo" field="ctaUrl" />
        </div>
      </Card>

      <Card title="6. Journal Section">
        <Field label="Title" section="journal" field="title" />
        <Field label="Description" section="journal" field="description" textarea />
      </Card>

      <Card title="7. Dealer Location">
        <Field label="Title" section="dealer_location" field="title" />
        <Field label="Description" section="dealer_location" field="description" textarea />
        <Field label="Address" section="dealer_location" field="address" textarea />
      </Card>

      <Card title="8. Final CTA">
        <Field label="Title" section="final_cta" field="title" />
        <Field label="Description" section="final_cta" field="description" textarea />
        <div className={styles.row}>
          <Field label="CTA Text" section="final_cta" field="ctaText" />
          <Field label="CTA URL" section="final_cta" field="ctaUrl" />
        </div>
      </Card>

      <Card title="9. SEO Metadata">
        <Field label="Meta Title" section="seo" field="metaTitle" />
        <Field label="Meta Description" section="seo" field="metaDescription" textarea />
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
