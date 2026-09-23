'use client'

import { useEffect, useRef, useState } from 'react'
import { HomepageSectionRenderer } from '@/components/sections/HomepageSectionRenderer'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'

interface PreviewPayload {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile'
  /** Saat true: user sedang di area Edit Text — aktifkan contextual text focus */
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
 * Mapping: sectionId → selector untuk menemukan text container di DOM.
 *
 * Setiap selector menargetkan elemen text utama (container heading/description)
 * dalam rendered section. Digunakan untuk scrollIntoView() dan focus ring.
 *
 * Strategi: gunakan aria-labelledby ID (heading) sebagai anchor.
 * Ini stabil, tidak bergantung pada CSS class name yang bisa berubah,
 * dan mengidentifikasi tepat elemen text yang sedang diedit user.
 *
 * Hero disengaja tidak ada di sini — hero adalah KNOWN-GOOD REFERENCE.
 */
const SECTION_TEXT_SELECTOR: Partial<Record<SectionId, string>> = {
  experience:     '[aria-labelledby="experience-title"]',
  technology:     '[aria-labelledby="technology-title"]',
  about:          '[aria-labelledby="about-title"]',
  final_cta:      '[aria-labelledby="final-cta-title"]',
  dealer_location: '[aria-labelledby="dealer-title"]',
}

/**
 * CSS focus ring menargetkan [data-text-focus] yang disuntikkan renderer
 * via prop textFocusAttr. Selector ini dipakai via injected <style> saat
 * textEditMode aktif — tidak perlu variabel JS terpisah karena targeting
 * dilakukan oleh attribute selector di CSS, bukan querySelectorAll().
 *
 * Contoh: [data-text-focus="technology"] → experienceCopy / technologyCopy
 * Catatan: CSS Modules class names berubah setiap build (hash), sehingga
 * data attribute adalah cara paling stabil untuk targeting.
 */

export function HomepagePreviewClient() {
  const [preview, setPreview] = useState(EMPTY)
  // Track versi textEditMode+sectionId untuk trigger effect
  const focusTriggerRef = useRef<string>('')
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

  // ── Contextual text focus: scroll + focus ring ────────────────
  // Trigger saat textEditMode berubah ke true, atau sectionId berubah saat textEditMode aktif.
  useEffect(() => {
    const key = `${preview.sectionId}:${preview.textEditMode ? '1' : '0'}`
    if (key === focusTriggerRef.current) return
    focusTriggerRef.current = key
    setFocusKey(key)

    if (!preview.textEditMode) return

    // Tunggu render selesai sebelum scroll (section baru baru saja di-mount)
    const timer = setTimeout(() => {
      const sectionSelector = SECTION_TEXT_SELECTOR[preview.sectionId]
      if (!sectionSelector) return

      const sectionEl = document.querySelector(sectionSelector)
      if (!sectionEl) return

      // Scroll section ke viewport — "nearest" agar tidak over-scroll
      // Block "center" memastikan teks terlihat di tengah viewport
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)

    return () => clearTimeout(timer)
  }, [preview.sectionId, preview.textEditMode])

  return (
    <main style={{ margin: 0, width: '100%', minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>

      {/* ── Contextual Text Preview indicator ──────────────────────
          Muncul hanya saat textEditMode = true.
          Bar emas di atas + badge "✏️ TEXT PREVIEW".
          pointer-events: none agar tidak menghalangi preview.      */}
      {preview.textEditMode && (
        <>
          <style>{`
            @keyframes jaecoo-text-preview-pulse {
              0%, 100% { opacity: 0.65; }
              50%       { opacity: 1; }
            }
          `}</style>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              pointerEvents: 'none',
            }}
          >
            {/* Garis emas tipis di paling atas */}
            <div
              style={{
                height: '3px',
                background: 'linear-gradient(90deg, transparent 0%, #C9A84C 25%, #C9A84C 75%, transparent 100%)',
                animation: 'jaecoo-text-preview-pulse 2s ease-in-out infinite',
              }}
            />
            {/* Badge label */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(201,168,76,0.95)',
                color: '#1a1a1a',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '3px 12px',
                borderRadius: '0 0 6px 6px',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              ✏️ Text Preview
            </div>
          </div>
        </>
      )}

      {/* ── Focus ring style ────────────────────────────────────────
          Inject saat textEditMode aktif saja.
          Menargetkan [data-text-focus] yang dipasang di renderer.
          ring + subtle glow — clean, tidak terlihat seperti debug UI.  */}
      {preview.textEditMode && (
        <style>{`
          [data-text-focus] {
            outline: none !important;
            box-shadow: 0 0 0 2px rgba(201,168,76,0.6), 0 0 18px rgba(201,168,76,0.18) !important;
            border-radius: 2px !important;
            transition: box-shadow 0.25s ease !important;
          }
        `}</style>
      )}

      <HomepageSectionRenderer
        sectionId={preview.sectionId}
        data={preview.data}
        mode="preview"
        textEditMode={preview.textEditMode}
        focusKey={focusKey}
      />
    </main>
  )
}
