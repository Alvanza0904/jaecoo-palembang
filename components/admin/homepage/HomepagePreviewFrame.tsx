'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { SectionId, SectionRenderData } from '@/components/sections/HomepageSectionRenderer'
import styles from './homepage.module.css'

interface Props {
  sectionId: SectionId
  data: SectionRenderData
  device: 'desktop' | 'mobile'
}

/**
 * Real browser viewport preview.
 *
 * The iframe is intentional: CSS media queries inside it are evaluated against
 * the simulated canvas width, not the admin browser width. This makes the
 * Mobile toggle genuinely mobile and prevents the classic "390px canvas but
 * 1440px media-query" mismatch.
 */
export function HomepagePreviewFrame({ sectionId, data, device }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
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

  return (
    <iframe
      ref={iframeRef}
      title="Homepage visual preview"
      src="/admin-preview/homepage"
      className={`${styles.previewFrame} ${device === 'mobile' ? styles.previewFrameMobile : styles.previewFrameDesktop}`}
      onLoad={send}
      scrolling="yes"
    />
  )
}
