/**
 * JAECOO Palembang — HomepageSectionRenderer
 *
 * SINGLE SOURCE OF TRUTH untuk rendering homepage sections.
 *
 * Komponen ini digunakan oleh:
 *   1. Admin Editor Preview → mode="preview"
 *   2. Live Website         → mode="live" (default)
 *
 * Tujuan: Editor Preview = Live Website secara visual.
 *
 * Yang BERBEDA antara preview dan live:
 *   - mode: menentukan apakah link aktif atau tidak
 *   - Tidak ada perbedaan CSS, layout, typography, spacing
 *
 * Data shape:
 *   - desktopImage / mobileImage: URL string dari Supabase atau undefined
 *   - cms: object teks (title, description, dll) — sama dengan data Supabase
 */

'use client'

import React from 'react'
import styles from './HomeExperience.module.css'
import heroStyles from '../hero/HeroPlaceholder.module.css'
import dealerStyles from './HomeDealerLocation.module.css'

// ─── Types ────────────────────────────────────────────────────

export type SectionId =
  | 'hero'
  | 'experience'
  | 'technology'
  | 'about'
  | 'dealer_location'
  | 'final_cta'

export interface SectionRenderData {
  desktop_image?: string
  mobile_image?: string
  eyebrow?: string
  headline?: string
  title?: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  address?: string
}

interface Props {
  sectionId: SectionId
  data: SectionRenderData
  device?: 'desktop' | 'mobile'
  mode?: 'preview' | 'live'
}

// ─── Shared Image Renderer ─────────────────────────────────────

function SectionImage({
  desktop,
  mobile,
  device,
  className,
}: {
  desktop?: string
  mobile?: string
  device: 'desktop' | 'mobile'
  className: string
}) {
  const src = device === 'mobile' ? (mobile || desktop) : desktop
  if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) {
    return <div className={className} aria-hidden="true" style={{ background: 'linear-gradient(135deg, #1a1a1a, #232323)' }} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} loading="lazy" decoding="async" aria-hidden="true" />
  )
}

// ─── Hero Section ─────────────────────────────────────────────

function HeroRenderer({ data, device }: { data: SectionRenderData; device: 'desktop' | 'mobile' }) {
  const bgSrc = device === 'mobile'
    ? (data.mobile_image || data.desktop_image)
    : data.desktop_image

  return (
    <section className={heroStyles.hero} style={{ minHeight: '100%' }}>
      <div className={heroStyles.bg}>
        {bgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgSrc}
            alt=""
            className={heroStyles.bgImg}
            aria-hidden="true"
            fetchPriority="high"
            decoding="async"
          />
        ) : (
          <div
            className={heroStyles.bgImg}
            style={{ background: 'linear-gradient(135deg, #141414 0%, #1e1e1e 50%, #141414 100%)' }}
            aria-hidden="true"
          />
        )}
        <div className={heroStyles.overlay} aria-hidden="true" />
      </div>
      <div className={heroStyles.content}>
        {(data.eyebrow) && (
          <span className={heroStyles.tagline}>{data.eyebrow}</span>
        )}
        {(data.headline) && (
          <h1 className={heroStyles.heading} style={{ fontSize: 'clamp(2rem, 8vw, 6rem)' }}>
            {data.headline}
          </h1>
        )}
        {(data.description) && (
          <p className={heroStyles.subheading}>{data.description}</p>
        )}
        {(data.ctaText) && (
          <div className={heroStyles.cta}>
            <span style={{
              display: 'inline-block',
              background: '#111',
              color: '#fff',
              padding: '0.75rem 1.75rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderRadius: '2px',
            }}>
              {data.ctaText}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Experience Section ────────────────────────────────────────

function ExperienceRenderer({ data, device }: { data: SectionRenderData; device: 'desktop' | 'mobile' }) {
  return (
    <section className={styles.experience} aria-labelledby="preview-experience-title">
      <SectionImage desktop={data.desktop_image} mobile={data.mobile_image} device={device} className={styles.experienceMedia} />
      <div className={styles.experienceCopy}>
        <span className={styles.eyebrow}>Pengalaman Berkendara</span>
        <h2 id="preview-experience-title" className={styles.experienceTitle}>
          {data.title || 'Pengalaman\nTanpa Kompromi.'}
        </h2>
        <p className={styles.experienceDesc}>
          {data.description || 'Kenyamanan premium di setiap medan. Dirancang untuk mereka yang berani menjelajah batas.'}
        </p>
        <span className={styles.textLink} style={{ cursor: 'default' }}>Lihat Informasi →</span>
      </div>
    </section>
  )
}

// ─── Technology Section ────────────────────────────────────────

function TechnologyRenderer({ data, device }: { data: SectionRenderData; device: 'desktop' | 'mobile' }) {
  return (
    <section className={styles.technology} aria-labelledby="preview-technology-title">
      <SectionImage desktop={data.desktop_image} mobile={data.mobile_image} device={device} className={styles.technologyMedia} />
      <div className={styles.technologyCopy}>
        <span className={styles.eyebrow}>Teknologi</span>
        <h2 id="preview-technology-title" className={styles.technologyTitle}>
          {data.title || 'Teknologi\nCerdas.'}
        </h2>
        <p className={styles.technologyDesc}>
          {data.description || 'Sistem SHS dan ARDIS terdepan di kelasnya.'}
        </p>
      </div>
    </section>
  )
}

// ─── About Section ─────────────────────────────────────────────

function AboutRenderer({ data, device }: { data: SectionRenderData; device: 'desktop' | 'mobile' }) {
  const imgSrc = device === 'mobile' ? (data.mobile_image || data.desktop_image) : data.desktop_image
  return (
    <section className={styles.about} aria-labelledby="preview-about-title">
      <div className={styles.aboutInner}>
        {imgSrc ? (
          <div className={`${styles.media} ${styles.aboutMedia}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </div>
        ) : (
          <div className={styles.aboutMedia} style={{ background: 'linear-gradient(135deg, #1a1a1a, #232323)' }} />
        )}
        <div className={styles.aboutCopy}>
          <span className={styles.eyebrow}>Dealer Resmi</span>
          <h2 id="preview-about-title" className={styles.aboutTitle}>
            {data.title || 'OMODA JAECOO\nPalembang.'}
          </h2>
          <p className={styles.aboutDesc}>
            {data.description || 'Dealer resmi OMODA JAECOO Palembang.'}
          </p>
          <span className={styles.aboutLink} style={{ cursor: 'default' }}>Hubungi Alvan →</span>
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA Section ─────────────────────────────────────────

function FinalCtaRenderer({ data, device }: { data: SectionRenderData; device: 'desktop' | 'mobile' }) {
  const src = device === 'mobile' ? (data.mobile_image || data.desktop_image) : data.desktop_image
  return (
    <section className={styles.finalCta} aria-labelledby="preview-finalcta-title">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={styles.finalCtaImg} aria-hidden="true" loading="lazy" />
      )}
      <div className={styles.finalCtaOverlay} aria-hidden="true" />
      <div className={styles.finalCtaInner}>
        <span className={styles.finalCtaEyebrow}>JAECOO Palembang</span>
        <h2 id="preview-finalcta-title" className={styles.finalCtaTitle}>
          {data.title || 'Siap memulai perjalanan Anda?'}
        </h2>
        <p className={styles.finalCtaDesc}>
          {data.description || 'Hubungi Alvan sekarang untuk konsultasi gratis, test drive, dan penawaran eksklusif.'}
        </p>
        {data.ctaText && (
          <span style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            padding: '0.875rem 2rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'default',
            borderRadius: '2px',
            marginTop: '0.5rem',
          }}>
            {data.ctaText}
          </span>
        )}
      </div>
    </section>
  )
}

// ─── Dealer Location Section ───────────────────────────────────

function DealerLocationRenderer({ data, device }: { data: SectionRenderData; device: 'desktop' | 'mobile' }) {
  const src = device === 'mobile' ? (data.mobile_image || data.desktop_image) : data.desktop_image
  const address = data.address || 'JAECOO Palembang\nKomp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509\n9 Ilir, Ilir Timur II, Palembang 30113\nSales: Alvan — 085183145926'
  return (
    <section className={dealerStyles.section} aria-labelledby="preview-dealer-title">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className={dealerStyles.bgImg} aria-hidden="true" loading="lazy" />
      )}
      <div className={dealerStyles.inner}>
        <span className={dealerStyles.eyebrow}>Dealer Resmi</span>
        <h2 id="preview-dealer-title" className={dealerStyles.title}>
          {(data.title || 'OMODA JAECOO\nPalembang').split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </h2>
        <address className={dealerStyles.address} style={{ fontStyle: 'normal', whiteSpace: 'pre-line' }}>
          {address}
        </address>
        <span className={dealerStyles.cta} style={{ cursor: 'default' }}>
          Konsultasi dengan Alvan →
        </span>
      </div>
    </section>
  )
}

// ─── Main Export ──────────────────────────────────────────────

export function HomepageSectionRenderer({ sectionId, data, device = 'desktop', mode = 'live' }: Props) {
  void mode // mode reserved for future use (e.g. editing outlines)

  switch (sectionId) {
    case 'hero':
      return <HeroRenderer data={data} device={device} />
    case 'experience':
      return <ExperienceRenderer data={data} device={device} />
    case 'technology':
      return <TechnologyRenderer data={data} device={device} />
    case 'about':
      return <AboutRenderer data={data} device={device} />
    case 'final_cta':
      return <FinalCtaRenderer data={data} device={device} />
    case 'dealer_location':
      return <DealerLocationRenderer data={data} device={device} />
    default:
      return null
  }
}
