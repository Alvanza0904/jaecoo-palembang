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
 * Contextual Text Panel — overlay nyata yang muncul di bawah preview
 * saat user fokus ke field teks di editor.
 *
 * Panel ini menampilkan:
 * - Label section + aksen warna
 * - Title/heading yang sedang diedit (realtime)
 * - Description (realtime)
 * - CTA text (jika ada, realtime)
 * - Address (jika dealer_location, realtime)
 *
 * Panel ini adalah perubahan VISUAL NYATA — bukan sekadar badge atau border.
 * Teks berubah langsung saat user mengetik karena data di-update via postMessage.
 */
function ContextualTextPanel({
  sectionId,
  data,
}: {
  sectionId: SectionId
  data: SectionRenderData
}) {
  const label = SECTION_LABEL[sectionId] || sectionId
  const accent = SECTION_ACCENT[sectionId] || '#C9A84C'

  const title = data.headline || data.title || ''
  const description = data.description || ''
  const ctaText = data.ctaText || ''
  const address = data.address || ''

  const hasContent = title || description || ctaText || address

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(10, 10, 12, 0.97)',
        borderTop: `3px solid ${accent}`,
        padding: '14px 16px 16px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
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
                // Truncate panjang — ini preview, bukan full render
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
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
      setPreview(event.data.payload)
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

  // Saat textEditMode aktif, pastikan konten teks section terlihat
  // (scroll ke atas agar section di viewport, bukan scrollIntoView per element)
  useEffect(() => {
    if (!preview.textEditMode) return
    // Reset scroll ke atas agar section yang baru dipilih langsung terlihat
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [preview.sectionId, preview.textEditMode])

  // Padding bawah saat contextual panel muncul (agar panel tidak overlap konten section)
  const contextualPanelHeight = preview.textEditMode && preview.sectionId !== 'hero' ? 120 : 0

  return (
    <main
      style={{
        margin: 0,
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
        // Padding bawah agar section tidak tertutup panel
        paddingBottom: contextualPanelHeight > 0 ? `${contextualPanelHeight}px` : undefined,
        transition: 'padding-bottom 0.2s ease',
      }}
    >
      {/* ── Section Renderer ────────────────────────────────────────
          Selalu merender section aktif dengan data draft terkini.
          data-text-focus attribute disuntikkan saat textEditMode = true
          untuk highlight via CSS ring (secondary feedback, bukan primary). */}
      <HomepageSectionRenderer
        sectionId={preview.sectionId}
        data={preview.data}
        mode="preview"
        textEditMode={preview.textEditMode}
        focusKey={focusKey}
      />

      {/* ── Contextual Text Panel ────────────────────────────────────
          PERUBAHAN VISUAL UTAMA: panel overlay yang menampilkan teks
          draft secara realtime saat user mengetik di editor.
          Muncul hanya saat textEditMode = true DAN bukan section hero.
          Teks berubah langsung karena data di-update via postMessage
          setiap kali updateField() dipanggil di editor. */}
      {preview.textEditMode && preview.sectionId !== 'hero' && (
        <ContextualTextPanel
          sectionId={preview.sectionId}
          data={preview.data}
        />
      )}

      {/* ── Subtle focus ring via CSS ───────────────────────────────
          Secondary feedback: ring tipis pada text container yang aktif.
          Menargetkan [data-text-focus] yang disuntikkan renderer. */}
      {preview.textEditMode && (
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
