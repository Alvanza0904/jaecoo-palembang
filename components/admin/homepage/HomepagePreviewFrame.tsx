'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'
import styles from './homepage.module.css'

interface Props {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile'
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
 * 1. iframe load /admin-preview/homepage (page.tsx minimal)
 * 2. Setelah load, kirim postMessage dengan payload section data
 * 3. page.tsx menerima message dan render HomepageSectionRenderer
 * 4. Preview = komponen live yang sama persis
 *
 * FIX v2: Tambah error state + retry jika iframe gagal load.
 */
export function HomepagePreviewFrame({ sectionId, data, device }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [iframeKey, setIframeKey] = useState(0) // force remount on retry
  const payload = JSON.stringify({ sectionId, data, device })

  const send = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'JAECOO_HOMEPAGE_PREVIEW', payload: JSON.parse(payload) },
      window.location.origin,
    )
  }, [payload])

  useEffect(() => {
    send()
  }, [send])

  const handleLoad = useCallback(() => {
    setLoadError(false)
    send()
  }, [send])

  const handleError = useCallback(() => {
    setLoadError(true)
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
          onClick={() => { setLoadError(false); setIframeKey((k) => k + 1) }}
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
