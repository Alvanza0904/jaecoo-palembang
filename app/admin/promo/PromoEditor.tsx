'use client'

import { WHATSAPP_NUMBER } from '@/lib/utils/whatsapp';;

import React, { useState, useTransition } from 'react';
import { Promo, PromoFormData, PromoType, PromoStatus } from '@/lib/types/promo';
import AIReadyField from '@/components/admin/ai/AIReadyField';
import { MediaPicker } from '@/components/admin/media/MediaPicker';
import type { MediaAsset } from '@/lib/types/media-asset';
import { savePromo } from './actions';
import styles from './promo.module.css';

interface Props {
  initialData?: Promo | null;
  modelsList: { id: string; name: string }[];
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────
// FIX INTERFACE MISMATCH: MediaPicker menggunakan API modal
// (open/onClose/onSelect), BUKAN controlled value (value/onChange).
// PromoImagePicker adalah adapter yang menjembatani keduanya.
// ─────────────────────────────────────────────────────────────
interface PromoImagePickerProps {
  value: string;
  onChange: (url: string) => void;
}

function PromoImagePicker({ value, onChange }: PromoImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(asset: MediaAsset) {
    onChange(asset.public_url ?? '');
    setIsOpen(false);
  }

  return (
    <div>
      {/* Preview gambar yang sudah dipilih */}
      {value && (
        <div style={{ marginBottom: '0.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview gambar promo"
            style={{
              width: '100%',
              maxHeight: '160px',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid var(--color-border, #e5e7eb)',
            }}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border, #d1d5db)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
          }}
        >
          {value ? '🖼 Ganti Gambar' : '📁 Pilih Gambar dari Media Library'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #fca5a5',
              color: '#ef4444',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          >
            Hapus
          </button>
        )}
      </div>

      {/* Modal MediaPicker yang sesungguhnya */}
      <MediaPicker
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        defaultCategory="promos"
        title="Pilih Gambar Promo"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main PromoEditor Component
// ─────────────────────────────────────────────────────────────

export default function PromoEditor({ initialData, modelsList, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<PromoFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    short_description: initialData?.short_description ?? '',
    description: initialData?.description ?? '',
    promo_type: initialData?.promo_type ?? 'general',
    model_id: initialData?.model_id ?? null,
    image_url: initialData?.image_url ?? '',
    start_date: initialData?.start_date ?? '',
    end_date: initialData?.end_date ?? '',
    status: initialData?.status ?? 'draft',
    featured: initialData?.featured ?? false,
    sort_order: initialData?.sort_order ?? 0,
    cta_label: initialData?.cta_label ?? 'Dapatkan Promo',
    cta_action: initialData?.cta_action ?? `https://wa.me/${WHATSAPP_NUMBER}`,
  });

  const set = <K extends keyof PromoFormData>(key: K, val: PromoFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim()) {
      setError('Judul promo wajib diisi.');
      return;
    }
    startTransition(async () => {
      const res = await savePromo(initialData?.id ?? null, formData);
      if (res.success) {
        onClose();
      } else {
        setError(res.error ?? 'Terjadi kesalahan.');
      }
    });
  };

  const baseAIContext = {
    pageType: 'promo',
    sectionType: 'promo_details',
    purpose: 'Promosi Penjualan Otomotif JAECOO Palembang',
    language: 'id',
  };

  return (
    <div className={styles.editorOverlay}>
      <div className={styles.editorModal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Edit Promo' : 'Tambah Promo Baru'}</h2>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            className={styles.closeBtn}
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* SEKSI 1: KONTEN (AI-READY) */}
          <div className={styles.sectionCard}>
            <h3>Konten Promo</h3>

            <AIReadyField
              label="Judul Promo"
              field="title"
              value={formData.title}
              onChange={(val) => set('title', val)}
              placeholder="Contoh: Bunga 0% & DP Ringan JAECOO J7"
              context={baseAIContext}
            />

            <AIReadyField
              label="Deskripsi Singkat"
              field="short_description"
              value={formData.short_description ?? ''}
              onChange={(val) => set('short_description', val)}
              placeholder="Ringkasan promo untuk kartu di homepage..."
              context={baseAIContext}
            />

            <AIReadyField
              label="Deskripsi Lengkap"
              field="description"
              isTextArea
              rows={5}
              value={formData.description ?? ''}
              onChange={(val) => set('description', val)}
              placeholder="Detail syarat dan ketentuan promo..."
              context={baseAIContext}
            />
          </div>

          {/* SEKSI 2: DETAIL PROMO */}
          <div className={styles.sectionCard}>
            <h3>Detail & Periode Promo</h3>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label>Jenis Promo</label>
                <select
                  value={formData.promo_type}
                  onChange={(e) => set('promo_type', e.target.value as PromoType)}
                >
                  <option value="general">General</option>
                  <option value="cashback">Cashback</option>
                  <option value="dp">DP Ringan</option>
                  <option value="leasing">Bunga Low / Leasing</option>
                  <option value="trade_in">Trade-In</option>
                  <option value="event">Event Special</option>
                  <option value="special_offer">Special Offer</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label>Model Terkait</label>
                <select
                  value={formData.model_id ?? ''}
                  onChange={(e) => set('model_id', e.target.value || null)}
                >
                  <option value="">Semua Model JAECOO</option>
                  {modelsList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label>Tanggal Mulai</label>
                <input
                  type="date"
                  value={formData.start_date ?? ''}
                  onChange={(e) => set('start_date', e.target.value || null)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>Tanggal Selesai</label>
                <input
                  type="date"
                  value={formData.end_date ?? ''}
                  onChange={(e) => set('end_date', e.target.value || null)}
                />
              </div>
            </div>
          </div>

          {/* SEKSI 3: MEDIA & DISPLAY */}
          <div className={styles.sectionCard}>
            <h3>Gambar & Tampilan</h3>

            <div className={styles.fieldGroup}>
              <label>Gambar Promo / Banner Header</label>
              {/* FIX: Menggunakan PromoImagePicker adapter, bukan MediaPicker langsung */}
              <PromoImagePicker
                value={formData.image_url ?? ''}
                onChange={(url) => set('image_url', url)}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => set('status', e.target.value as PromoStatus)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label>Urutan Tampil (Sort Order)</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className={styles.checkboxGroup}>
              <input
                id="featured"
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              <label htmlFor="featured">Tampilkan di Banner Utama / Featured</label>
            </div>
          </div>

          {/* SEKSI 4: CALL TO ACTION */}
          <div className={styles.sectionCard}>
            <h3>Call To Action (CTA)</h3>

            <AIReadyField
              label="Teks Tombol CTA"
              field="cta_label"
              value={formData.cta_label ?? ''}
              onChange={(val) => set('cta_label', val)}
              placeholder="Contoh: Klaim Promo via WhatsApp"
              context={baseAIContext}
            />

            <div className={styles.fieldGroup}>
              <label>Link Aksi CTA (WhatsApp / Form)</label>
              <input
                type="text"
                value={formData.cta_action ?? ''}
                onChange={(e) => set('cta_action', e.target.value)}
                placeholder={`https://wa.me/${WHATSAPP_NUMBER}`}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>
              Batal
            </button>
            <button type="submit" disabled={isPending} className={styles.btnSave}>
              {isPending ? 'Menyimpan…' : 'Simpan Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
