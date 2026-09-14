'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ai.module.css';
import { AIContext, AIOperation } from '@/lib/ai/types';

interface Props {
  context: AIContext;
  currentContent: string;
  onApply: (newContent: string) => void;
}

export default function AIAssistant({ context, currentContent, onApply }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup popover saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleGenerate = async (operation: AIOperation) => {
    setIsGenerating(true);
    setError('');
    setIsOpen(true);
    setDraft('');

    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          context,
          existingContent: currentContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghasilkan konten.');

      setDraft(data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
    setDraft('');
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        onClick={() => handleGenerate('generate')}
        disabled={isGenerating}
        className={styles.triggerBtn}
        title="Buat draft dengan AI"
      >
        {/* Spark icon */}
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
        </svg>
        AI
      </button>

      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.popoverHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className={styles.popoverTitle}>AI Draft</span>
              <span className={styles.popoverBadge}>BETA</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={styles.closeBtn}
              aria-label="Tutup"
            >
              &times;
            </button>
          </div>

          {isGenerating ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingDots}>
                <span />
                <span />
                <span />
              </div>
              Engine sedang menulis…
            </div>
          ) : draft ? (
            <>
              <div className={styles.draftContent}>{draft}</div>
              <div className={styles.actionGrid}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={isGenerating}
                  onClick={() => handleGenerate('rewrite')}
                >
                  Tulis Ulang
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  disabled={isGenerating}
                  onClick={() => handleGenerate('shorten')}
                >
                  Lebih Pendek
                </button>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={handleApply}
                >
                  Gunakan Draft Ini
                </button>
              </div>
            </>
          ) : null}

          {error && <div className={styles.errorText}>{error}</div>}
        </div>
      )}
    </div>
  );
}
