'use client'

import { useState, useTransition } from 'react';
import { HomepageContent } from '@/types/homepage-content';
import { updateHomepageContent } from './actions';

// Type helper: extract only the object-valued sections (exclude id, updated_at)
type ContentSection = Omit<HomepageContent, 'id' | 'updated_at'>;
type SectionKey = keyof ContentSection;
type SectionValue = ContentSection[SectionKey];

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
        ...(prev[section] as SectionValue),
        [field]: value,
      },
    }));
  };

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

  const getFieldValue = (section: SectionKey, field: string): string => {
    const sec = formData[section] as Record<string, string>;
    return sec[field] || '';
  };

  const InputField = ({
    label,
    section,
    field,
    isTextArea = false,
  }: {
    label: string;
    section: SectionKey;
    field: string;
    isTextArea?: boolean;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {isTextArea ? (
        <textarea
          rows={3}
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition"
          value={getFieldValue(section, field)}
          onChange={(e) => handleChange(section, field, e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition"
          value={getFieldValue(section, field)}
          onChange={(e) => handleChange(section, field, e.target.value)}
        />
      )}
    </div>
  );

  const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {status.message && (
        <div
          className={`p-4 rounded-md ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      <SectionCard title="1. Homepage Hero">
        <InputField label="Eyebrow (Teks Kecil di Atas)" section="hero" field="eyebrow" />
        <InputField label="Headline" section="hero" field="headline" />
        <InputField label="Description" section="hero" field="description" isTextArea />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="CTA Text" section="hero" field="ctaText" />
          <InputField label="CTA URL" section="hero" field="ctaUrl" />
        </div>
      </SectionCard>

      <SectionCard title="2. Experience Section">
        <InputField label="Title" section="experience" field="title" />
        <InputField label="Description" section="experience" field="description" isTextArea />
      </SectionCard>

      <SectionCard title="3. Technology Section">
        <InputField label="Title" section="technology" field="title" />
        <InputField label="Description" section="technology" field="description" isTextArea />
      </SectionCard>

      <SectionCard title="4. About Section">
        <InputField label="Title" section="about" field="title" />
        <InputField label="Description" section="about" field="description" isTextArea />
      </SectionCard>

      <SectionCard title="5. Promo Section">
        <InputField label="Title" section="promo" field="title" />
        <InputField label="Description" section="promo" field="description" isTextArea />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="CTA Text" section="promo" field="ctaText" />
          <InputField label="CTA URL" section="promo" field="ctaUrl" />
        </div>
      </SectionCard>

      <SectionCard title="6. Journal Section">
        <InputField label="Title" section="journal" field="title" />
        <InputField label="Description" section="journal" field="description" isTextArea />
      </SectionCard>

      <SectionCard title="7. Dealer Location">
        <InputField label="Title" section="dealer_location" field="title" />
        <InputField label="Description" section="dealer_location" field="description" isTextArea />
        <InputField label="Address / Text" section="dealer_location" field="address" isTextArea />
      </SectionCard>

      <SectionCard title="8. Final CTA">
        <InputField label="Title" section="final_cta" field="title" />
        <InputField label="Description" section="final_cta" field="description" isTextArea />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="CTA Text" section="final_cta" field="ctaText" />
          <InputField label="CTA URL" section="final_cta" field="ctaUrl" />
        </div>
      </SectionCard>

      <SectionCard title="9. SEO Metadata">
        <InputField label="Meta Title" section="seo" field="metaTitle" />
        <InputField label="Meta Description" section="seo" field="metaDescription" isTextArea />
      </SectionCard>

      {/* Floating Save Bar (Mobile Friendly) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="text-sm text-gray-500 hidden sm:block">
          Pastikan Anda mengecek ulang teks sebelum menyimpan.
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-8 py-2.5 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Menyimpan...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
