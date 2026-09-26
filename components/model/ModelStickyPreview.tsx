'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { ModelFeature, ModelHighlight, ModelPageCopy } from '@/lib/types/model'
import { stickyRenderMode, textPreviewDraft } from '@/lib/models/text-preview'
import { pickOwnedUrl } from '@/lib/types/media-asset'
import overview from '@/app/(public)/model/[slug]/page.module.css'

type Assignment = {
  slot_key: string
  breakpoint: string | null
  media_assets?: {
    public_url?: string | null
    variants?: Record<string, string> | null
  } | null
}

const SLOT: Record<string, string> = {
  exterior: 'exterior',
  design: 'design_detail_main',
  profile: 'profile',
  interior: 'interior',
  cockpit: 'cockpit_main',
  performance: 'performance',
  adas: 'adas',
  cta: 'final_cta',
  hero_cta: 'final_cta',
  specs_cta: 'specs_visual',
  tech_intelligence: 'tech_intelligence',
  tech_close: 'tech_cta',
  technology: 'technology',
}

function desktopUrl(rows: Assignment[], slot: string): string {
  const matching = rows.filter((row) => row.slot_key === slot && row.media_assets?.public_url)
  const desktop = matching.find((row) => row.breakpoint === 'desktop')
    ?? matching.find((row) => !row.breakpoint)
    ?? matching[0]
  const asset = desktop?.media_assets
  if (!asset?.public_url) return ''
  return pickOwnedUrl(asset.public_url, asset.variants, ['1920', '1440']) ?? ''
}

function HeadingLines({ text, className, active }: { text: string; className: string; active?: boolean }) {
  if (!text) return null
  const style: CSSProperties | undefined = active ? { outline: '2px solid #C9A84C', outlineOffset: 4 } : undefined
  return (
    <h2 className={className} style={style}>
      {text.split('\n').map((line, index) => (
        <span key={index}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </h2>
  )
}

function LiveScale({ watch, children }: { watch: string; children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [liveW, setLiveW] = useState(1280)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const host = hostRef.current
    const inner = innerRef.current
    if (!host || !inner) return
    const measure = () => {
      const width = window.innerWidth
      const nextScale = host.clientWidth > 0 ? host.clientWidth / width : 1
      setLiveW(width)
      setScale(nextScale)
      setHeight(inner.offsetHeight * nextScale)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    observer.observe(inner)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [watch])

  return (
    <div ref={hostRef} style={{ width: '100%', height, overflow: 'hidden' }}>
      <div ref={innerRef} style={{ width: liveW, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

function Bg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return <img src={src} alt="" className={className} />
}

export function ModelStickyPreview({
  slug,
  modelName,
  tagline,
  heroImage,
  section,
  textEditMode,
  focusedField,
  pageCopy,
  highlights,
  technology,
  features,
  heroHeading,
}: {
  slug: string
  modelName: string
  tagline: string
  heroImage?: string
  section: string
  textEditMode: boolean
  focusedField: string | null
  pageCopy: ModelPageCopy
  highlights: ModelHighlight[]
  technology: { headline: string; subheadline: string }
  features: ModelFeature[]
  heroHeading: string
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/content-media?content_type=model&content_key=${encodeURIComponent(slug)}`)
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled) setAssignments(json.assignments ?? [])
      })
      .catch(() => {
        if (!cancelled) setAssignments([])
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  const mode = stickyRenderMode(textEditMode)
  if (mode === 'text' && section === 'hero') {
    return (
      <aside aria-label="Hero heading preview" data-preview-mode="text" data-preview-section-active="hero">
        <p style={{ margin: 0, padding: '28px 18px', background: '#fff', color: '#111', fontSize: 40, fontWeight: 700, lineHeight: 1.15 }}>
          {heroHeading}
        </p>
      </aside>
    )
  }
  const draft = textPreviewDraft(section, pageCopy, technology, highlights)
  const image = desktopUrl(assignments, SLOT[section] || '')
  const headingOn = focusedField === 'heading'

  let visual = (
    <section className={overview.cinematicSection}>
      <div className={overview.cinematicBg}>
        <Bg src={heroImage || ''} className={overview.cinematicBgImg} />
        <div className={overview.cinematicOverlay} />
      </div>
      <div className={overview.cinematicContent}>
        <p className={overview.editorialLabel}><span className={overview.editorialCat}>{modelName}</span></p>
        {tagline ? <h2 className={overview.cinematicHeading}>{tagline}</h2> : null}
      </div>
    </section>
  )

  if (mode === 'text' && section === 'performance') {
    visual = (
      <section className={overview.performanceSection} data-live-section="performance">
        <div className={overview.performanceBg}>
          <Bg src={image} className={overview.performanceBgImg} />
          <div className={overview.cinematicOverlay} style={{ opacity: 0.6 }} />
        </div>
        <Container size="wide">
          <div className={overview.performanceContent}>
            <div>
              <p className={overview.editorialLabel}>
                <span className={overview.editorialNum}>06</span>
                <span className={overview.editorialCat}>{draft.label}</span>
              </p>
              <HeadingLines text={draft.heading} className={overview.performanceHeading} active={headingOn} />
              {draft.body ? <p className={overview.cinematicBody}>{draft.body}</p> : null}
            </div>
            <div className={overview.performanceStats}>
              {highlights.map((item) => (
                <div key={`${item.value}-${item.label}`} className={overview.performanceStat}>
                  <span className={overview.performanceStatTag}>{item.value}</span>
                  <span className={overview.performanceStatLabel}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    )
  } else if (mode === 'text' && section === 'technology') {
    visual = (
      <section className={overview.techSection} data-live-section="technology">
        <div className={overview.techLayout}>
          <div className={overview.techImageWrap}>
            <Bg src={image} className={overview.techMainImg} />
          </div>
          <div className={overview.techContent}>
            <p className={overview.editorialLabel}>
              <span className={overview.editorialNum}>07</span>
              <span className={overview.editorialCat}>Teknologi</span>
            </p>
            <HeadingLines text={draft.heading} className={overview.techHeading} active={headingOn} />
            {draft.body ? <p className={overview.techSubheadline}>{draft.body}</p> : null}
            {features.slice(0, 4).map((feature, index) => (
              <div key={feature.id || index} className={overview.techFeature}>
                <span className={overview.techFeatureNum}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  {feature.tag ? <p className={overview.techFeatureTag}>{feature.tag}</p> : null}
                  <p className={overview.techFeatureTitle}>{feature.title}</p>
                </div>
              </div>
            ))}
            <Button as="button" type="button" variant="secondary" size="md" className={overview.techCta}>
              Jelajahi Teknologi →
            </Button>
          </div>
        </div>
      </section>
    )
  } else if (mode === 'text' && section === 'adas') {
    visual = (
      <section className={overview.cinematicSection} data-live-section="adas">
        <div className={overview.cinematicBg}>
          <Bg src={image} className={overview.cinematicBgImg} />
          <div className={overview.cinematicOverlay} style={{ opacity: 0.55 }} />
        </div>
        <Container size="wide">
          <div className={overview.adasContent}>
            <p className={overview.editorialLabel}>
              <span className={overview.editorialNum}>08</span>
              <span className={overview.editorialCat}>{draft.label}</span>
            </p>
            {(draft.stat || draft.unit) && (
              <div className={overview.adasStat}>
                <span className={overview.adasStatNumber}>{draft.stat}</span>
                <span className={overview.adasStatUnit}>{draft.unit}</span>
              </div>
            )}
            <HeadingLines text={draft.heading} className={overview.adasHeading} active={headingOn} />
            {draft.body ? <p className={overview.cinematicBody}>{draft.body}</p> : null}
          </div>
        </Container>
      </section>
    )
  } else if (mode === 'text' && (section === 'cta' || section === 'hero_cta' || section === 'specs_cta' || section === 'tech_close')) {
    visual = (
      <section className={overview.ctaSection} data-live-section="cta">
        <div className={overview.ctaBg}>
          <Bg src={image} className={overview.ctaBgImg} />
          <div className={overview.cinematicOverlay} style={{ opacity: 0.65 }} />
        </div>
        <Container size="narrow">
          <div className={overview.ctaContent}>
            {draft.label ? <p className={overview.ctaEyebrow}>{draft.label}</p> : null}
            <HeadingLines text={draft.heading} className={overview.ctaHeading} active={headingOn} />
            {draft.body ? <p className={overview.ctaBody}>{draft.body}</p> : null}
            <div className={overview.ctaActions}>
              {draft.primary ? (
                <Button as="button" type="button" variant="primary" size="lg">{draft.primary}</Button>
              ) : null}
              {draft.secondary ? (
                <Button as="button" type="button" variant="ghost" size="lg">{draft.secondary}</Button>
              ) : null}
            </div>
          </div>
        </Container>
      </section>
    )
  } else if (mode === 'text') {
    const number = section === 'interior' ? '04' : section === 'cockpit' ? '05' : section === 'profile' ? '03' : section === 'design' ? '02' : '01'
    const headingClass = section === 'cockpit' ? overview.cockpitHeading : section === 'profile' ? overview.presenceHeading : section === 'design' ? overview.detailHeading : overview.cinematicHeading
    visual = (
      <section className={overview.cinematicSection} data-live-section={section}>
        <div className={overview.cinematicBg}>
          <Bg src={image} className={overview.cinematicBgImg} />
          <div className={overview.cinematicOverlay} />
        </div>
        <div className={overview.cinematicContent} data-position={section === 'interior' ? 'bottom-right' : 'bottom-left'}>
          <p className={overview.editorialLabel}>
            <span className={overview.editorialNum}>{number}</span>
            <span className={overview.editorialCat}>{draft.label}</span>
          </p>
          <HeadingLines text={draft.heading} className={headingClass} active={headingOn} />
          {draft.body ? <p className={section === 'cockpit' ? overview.cockpitBody : overview.cinematicBody}>{draft.body}</p> : null}
        </div>
      </section>
    )
  }

  return (
    <aside aria-label={mode === 'text' ? `Section ${section}` : modelName} data-preview-mode={mode} data-preview-section-active={mode === 'text' ? section : 'model'}>
      <LiveScale watch={`${mode}:${section}:${heroImage ?? ''}:${image}`}>
        {visual}
      </LiveScale>
    </aside>
  )
}
