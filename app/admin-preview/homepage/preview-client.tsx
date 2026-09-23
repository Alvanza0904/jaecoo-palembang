'use client'

import { useEffect, useRef, useState } from 'react'
import { HomepageSectionRenderer } from '@/components/sections/HomepageSectionRenderer'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'

interface PreviewPayload {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile'
  /** Saat true: user sedang fokus di field teks — aktifkan contextual text preview */
  textEditMode?: boolean
  /** Field mana yang sedang aktif di Parent editor */
  focusedFieldId?: string | null
}

interface PreviewMessage {
  type: 'JAECOO_HOMEPAGE_PREVIEW'
  payload: PreviewPayload
}

const EMPTY: PreviewPayload = {
  sectionId: 'hero',
  data: {},
  device: 'desktop',
  textEditMode: false,
  focusedFieldId: null,
}

/**
 * Label display per sectionId — untuk header Contextual Text Panel.
 * Hero tidak ada di sini (hero = KNOWN-GOOD REFERENCE, tidak menerima textEditMode).
 */
const SECTION_LABEL: Partial<Record<SectionId, string>> = {
  experience:      'Experience',
  technology:      'Teknologi',
  about:           'About',
  final_cta:       'Final CTA',
  dealer_location: 'Dealer Location',
}

/**
 * Warna aksen per section — membedakan contextual panel secara visual
 * agar user langsung tahu section mana yang sedang diedit.
 */
const SECTION_ACCENT: Partial<Record<SectionId, string>> = {
  experience:      '#4A9ECC',
  technology:      '#5B8AD4',
  about:           '#7C6FC4',
  final_cta:       '#C9A84C',
  dealer_location: '#4CAF7C',
}

/**
 * Contextual Text Panel — isi slot preview yang sama dengan live section.
 *
 * Bukan overlay, bukan sticky sendiri, bukan preview kedua.
 * Parent (previewCanvas di Homepage Editor) tetap mengontrol posisi iframe.
 * Saat textEditMode, panel ini MENGGANTIKAN HomepageSectionRenderer
 * di dalam iframe yang sama.
 */
function ContextualTextPanel({
  sectionId,
  data,
  focusedFieldId,
}: {
  sectionId: SectionId
  data: SectionRenderData
  focusedFieldId?: string | null
}) {
  const label = SECTION_LABEL[sectionId] || sectionId
  const accent = SECTION_ACCENT[sectionId] || '#C9A84C'

  const title = data.headline || data.title || ''
  const description = data.description || ''
  const ctaText = data.ctaText || ''
  const address = data.address || ''

  const hasContent = title || description || ctaText || address

  // Highlight field yang sedang aktif di Parent
  const isFieldActive = (fieldName: string) =>
    focusedFieldId === fieldName

  const activeFieldStyle = (fieldName: string): React.CSSProperties =>
    isFieldActive(fieldName)
      ? { borderLeft: `2px solid ${accent}`, paddingLeft: '8px', marginLeft: '-10px' }
      : {}

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: '#0a0a0c',
        borderTop: `3px solid ${accent}`,
        padding: '28px 22px 32px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'auto',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: accent,
            flexShrink: 0,
            boxShadow: `0 0 6px ${accent}`,
          }}
        />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          ✏️ Text Preview — {label}
        </span>
      </div>

      {/* Content */}
      {hasContent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {title && (
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
                transition: 'border-color 0.15s ease, padding-left 0.15s ease',
                ...activeFieldStyle('title'),
                ...activeFieldStyle('headline'),
              }}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'border-color 0.15s ease, padding-left 0.15s ease',
                ...activeFieldStyle('description'),
              }}
            >
              {description}
            </div>
          )}
          {address && (
            <div
              style={{
                fontSize: '11px',
                color: '#9ca3af',
                lineHeight: 1.5,
                fontStyle: 'italic',
                transition: 'border-color 0.15s ease, padding-left 0.15s ease',
                ...activeFieldStyle('address'),
              }}
            >
              {address}
            </div>
          )}
          {ctaText && (
            <div
              style={{
                marginTop: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '4px',
                background: accent,
                color: '#0a0a0c',
                fontSize: '11px',
                fontWeight: 700,
                alignSelf: 'flex-start',
                letterSpacing: '0.02em',
                outline: isFieldActive('ctaText') ? `2px solid white` : undefined,
                outlineOffset: '2px',
              }}
            >
              {ctaText}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            fontSize: '11px',
            color: '#4b5563',
            fontStyle: 'italic',
          }}
        >
          Belum ada teks — ketik di editor untuk melihat perubahan langsung
        </div>
      )}
    </div>
  )
}

export function HomepagePreviewClient() {
  const [preview, setPreview] = useState(EMPTY)
  const focusKeyRef = useRef<string>('')
  const [focusKey, setFocusKey] = useState('')

  useEffect(() => {
    const handler = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || event.data.type !== 'JAECOO_HOMEPAGE_PREVIEW') return

      const p = event.data.payload
      setPreview({
        sectionId:     p.sectionId,
        data:          p.data,
        device:        p.device,
        textEditMode:  p.textEditMode  ?? false,
        focusedFieldId: p.focusedFieldId ?? null,
      })
    }

    window.addEventListener('message', handler)
    window.parent.postMessage(
      { type: 'JAECOO_HOMEPAGE_PREVIEW_READY' },
      window.location.origin,
    )

    return () => window.removeEventListener('message', handler)
  }, [])

  // Track focusKey untuk trigger re-render saat section/mode berubah
  useEffect(() => {
    const key = `${preview.sectionId}:${preview.textEditMode ? '1' : '0'}`
    if (key === focusKeyRef.current) return
    focusKeyRef.current = key
    setFocusKey(key)
  }, [preview.sectionId, preview.textEditMode])

  // Saat textEditMode aktif, scroll ke atas agar section terlihat
  useEffect(() => {
    if (!preview.textEditMode) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [preview.sectionId, preview.textEditMode])

  const showContextualPreview = preview.textEditMode && preview.sectionId !== 'hero'

  return (
    <main
      style={{
        margin: 0,
        width: '100%',
        height: '100%',
        minHeight: '100%',
        overflowX: 'hidden',
        background: '#0a0a0c',
      }}
    >
      {/* Satu slot. textEditMode mengganti preview normal, tidak menumpuknya. */}
      {showContextualPreview ? (
        <ContextualTextPanel
          sectionId={preview.sectionId}
          data={preview.data}
          focusedFieldId={preview.focusedFieldId}
        />
      ) : (
        <HomepageSectionRenderer
          sectionId={preview.sectionId}
          data={preview.data}
          mode="preview"
          textEditMode={preview.textEditMode}
          focusedFieldId={preview.focusedFieldId}
          focusKey={focusKey}
        />
      )}

      {preview.textEditMode && !showContextualPreview && (
        <style>{`
          [data-text-focus] {
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(201,168,76,0.55), 0 0 20px rgba(201,168,76,0.12) !important;
            border-radius: 3px !important;
            transition: box-shadow 0.2s ease !important;
          }
        `}</style>
      )}
    </main>
  )
}
