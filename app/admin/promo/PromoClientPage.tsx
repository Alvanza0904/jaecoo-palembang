'use client';

import React, { useState } from 'react';
import { Promo } from '@/lib/types/promo';
import PromoEditor from './PromoEditor';
import { deletePromo } from './actions';
import styles from './promo.module.css';

interface Props {
  initialPromos: Promo[];
  modelsList: { id: string; name: string }[];
}

export default function PromoClientPage({ initialPromos, modelsList }: Props) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

  const handleCreate = () => {
    setEditingPromo(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return;
    await deletePromo(id);
  };

  const badgeClass = (status: Promo['status']) => {
    if (status === 'published') return styles.badgePublished;
    if (status === 'expired') return styles.badgeExpired;
    return styles.badgeDraft;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerBar}>
        <div className={styles.titleGroup}>
          <h1>Kelola Promo</h1>
          <p>Daftar promo penjualan &amp; penawaran spesial JAECOO Palembang</p>
        </div>
        <button type="button" onClick={handleCreate} className={styles.btnAdd}>
          + Tambah Promo
        </button>
      </div>

      {/* List */}
      <div className={styles.promoGrid}>
        {initialPromos.length === 0 ? (
          <p style={{ color: '#6b7280', gridColumn: '1/-1' }}>
            Belum ada promo. Klik tombol di atas untuk menambah.
          </p>
        ) : (
          initialPromos.map((promo) => (
            <div key={promo.id} className={styles.promoCard}>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span className={`${styles.badge} ${badgeClass(promo.status)}`}>
                    {promo.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {promo.models ? promo.models.name : 'Semua Model'}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 600 }}>
                  {promo.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, lineClamp: 2 }}>
                  {promo.short_description ?? 'Tidak ada deskripsi singkat'}
                </p>
              </div>

              <div className={styles.cardActions}>
                <button type="button" onClick={() => handleEdit(promo)} className={styles.btnEdit}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(promo.id)}
                  className={styles.btnDelete}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Editor */}
      {isEditorOpen && (
        <PromoEditor
          initialData={editingPromo}
          modelsList={modelsList}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
}
