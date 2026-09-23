'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'
import styles from './homepage.module.css'

interface Props {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile'
  /** Saat true: user di area Edit Text — iframe menampilkan ContextualTextPanel */
  textEditMode?: boolean
  /** Field mana yang sedang aktif: 'title'|'headline'|'description'|'ctaText'|'address'|null */
  focusedFieldId?: string | null
}

/**
 * Real browser viewport preview menggunakan iframe.
 *
 * KENAPA IFRAME?
 * CSS media queries dievaluasi terhadap lebar iframe (390px / full),
 * bukan lebar browser admin. Mobile toggle benar-benar 390px viewport.
 * Tidak ada transform/scale yang mengacaukan font-size atau layout.
 *
 * ARSITEKTUR:
 * 1. iframe load /admin-preview/homepage (page.tsx → HomepagePreviewClient)
 * 2. iframe kirim JAECOO_HOMEPAGE_PREVIEW_READY setelah mount
 * 3. Frame menerima READY → kirim payload section data
 * 4. Setiap kali data, textEditMode, focusedFieldId berubah → re-send payload
 * 5. Preview = komponen live yang sama persis (LayeredHero + presentation_settings)
 *
 * STATE BRIDGE FIX:
 * - textEditMode + focusedFieldId ikut dalam payload postMessage
 * - Dependency array useEffect mencakup semua state yang membentuk payload
 * - iframe (preview-client) menerima dan menyimpan UI state ini
 * - ContextualTextPanel di iframe muncul/hilang berdasarkan textEditMode dari Parent
 */
export function HomepagePreviewFrame({
  sectionId,
  data,
  device,
  textEditMode = false,
  focusedFieldId = null,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [iframeKey, setIframeKey] = useState(0) // force remount on retry
  const [iframeReady, setIframeReady] = useState(false)

  // Serialize payload — semua state yang mempengaruhi preview ikut
  const payload = JSON.stringify({
    sectionId,
    data,
    device,
    textEditMode,
    focusedFieldId,
  })

  const send = useCallback((p: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'JAECOO_HOMEPAGE_PREVIEW', payload: JSON.parse(p) },
      window.location.origin,
    )
  }, [])

  // Listen READY dari iframe — kirim payload segera setelah iframe siap
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'JAECOO_HOMEPAGE_PREVIEW_READY') {
        setIframeReady(true)
        // Kirim payload terkini saat ini juga
        send(payload)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send]) // payload sengaja tidak di-dep sini — handler hanya setup sekali

  // Re-send setiap kali payload berubah (teks / gambar / textEditMode / focusedFieldId)
  // Dependency array eksplisit mencakup SEMUA state yang membentuk payload
  useEffect(() => {
    if (!iframeReady) return
    send(payload)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, iframeReady, send])

  const handleLoad = useCallback(() => {
    setLoadError(false)
    // Jangan kirim di sini — tunggu READY message dari iframe
    // (menghindari race condition antara onLoad dan useEffect mount di iframe)
  }, [])

  const handleError = useCallback(() => {
    setLoadError(true)
    setIframeReady(false)
  }, [])

  if (loadError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: '#111',
          color: '#6b7280',
          fontSize: '0.75rem',
          gap: '0.75rem',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <span>Preview tidak bisa dimuat.<br />Route /admin-preview/homepage belum tersedia.</span>
        <button
          onClick={() => { setLoadError(false); setIframeReady(false); setIframeKey((k) => k + 1) }}
          style={{
            padding: '0.4rem 0.875rem',
            borderRadius: '6px',
            border: '1px solid #374151',
            background: '#1f2937',
            color: '#d1d5db',
            cursor: 'pointer',
            fontSize: '0.75rem',
          }}
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <iframe
      key={iframeKey}
      ref={iframeRef}
      title="Homepage visual preview"
      src="/admin-preview/homepage"
      className={`${styles.previewFrame} ${device === 'mobile' ? styles.previewFrameMobile : styles.previewFrameDesktop}`}
      onLoad={handleLoad}
      onError={handleError}
      scrolling="yes"
    />
  )
}
