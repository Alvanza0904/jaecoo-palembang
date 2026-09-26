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
 * The iframe is laid out at the real browser viewport (or 390×844 on mobile).
 * Only the outer stage is scaled to fit the admin panel, so section
 * width, height, and media queries stay identical to the live site.
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
  const stageRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  const [viewport, setViewport] = useState({ w: 1440, h: 900 })

  useEffect(() => {
    const measure = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight })
      const stage = stageRef.current
      if (stage) setStageSize({ w: stage.clientWidth, h: stage.clientHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    const observer = new ResizeObserver(measure)
    if (stageRef.current) observer.observe(stageRef.current)
    return () => {
      window.removeEventListener('resize', measure)
      observer.disconnect()
    }
  }, [])

  const logicalW = device === 'mobile' ? 390 : viewport.w
  const logicalH = device === 'mobile' ? 844 : viewport.h
  const scale = stageSize.w > 0 ? Math.min(1, stageSize.w / logicalW) : 1
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
    <div ref={stageRef} className={styles.previewStage}>
      <div style={{ width: logicalW * scale, height: logicalH * scale }}>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          title="Homepage visual preview"
          src="/admin-preview/homepage"
          className={styles.previewFrame}
          scrolling="yes"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: logicalW,
            height: logicalH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>
    </div>
  )
}
