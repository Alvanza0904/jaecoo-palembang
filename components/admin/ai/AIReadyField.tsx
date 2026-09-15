'use client';

/**
 * AIReadyField — Integration hook wrapper untuk semua text field di Promo CMS.
 * Manual-First: field bekerja 100% tanpa AI.
 * AI-Ready: tombol AI muncul otomatis jika AIContentEngine aktif.
 */

import React from 'react';
import AIAssistant from './AIAssistant';
import { AIContext } from '@/lib/ai/types';

interface AIReadyFieldProps {
  label: string;
  field: string;
  value: string;
  onChange: (val: string) => void;
  isTextArea?: boolean;
  rows?: number;
  placeholder?: string;
  context: Omit<AIContext, 'field'>;
}

export default function AIReadyField({
  label,
  field,
  value,
  onChange,
  isTextArea = false,
  rows = 3,
  placeholder,
  context,
}: AIReadyFieldProps) {
  const fullContext: AIContext = { ...context, field };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.375rem',
        }}
      >
        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</label>

        {/* AI Action Hook — siap terhubung ke AIContentEngine (Step 8.9) */}
        <AIAssistant
          context={fullContext}
          currentContent={value}
          onApply={(newText) => onChange(newText)}
        />
      </div>

      {isTextArea ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border, #d1d5db)',
            background: 'var(--color-surface, #ffffff)',
            color: 'var(--color-ink, #111827)',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--color-border, #d1d5db)',
            background: 'var(--color-surface, #ffffff)',
            color: 'var(--color-ink, #111827)',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}
