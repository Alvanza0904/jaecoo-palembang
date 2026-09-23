'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import type { ModelFeature, ModelHighlight, ModelPageCopy } from '@/lib/types/model'
import { textPreviewDraft } from '@/lib/models/text-preview'
import overview from '@/app/(public)/model/[slug]/page.module.css'
import technologyStyles from '@/app/(public)/model/[slug]/technology/technology.module.css'

type Assignment = {
  slot_key: string
  breakpoint: string | null
  media_assets?: {
    public_url?: string | null
    alt_text?: string | null
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
  const variants = asset.variants ?? {}
  return variants['1920'] ?? variants['1440'] ?? asset.public_url
}

function Lines({ text, className, active }: { text: string; className: string; active?: boolean }) {
  if (!text) return null
  const style: CSSProperties | undefined = active
    ? { outline: '2px solid #C9A84C', outlineOffset: 6 }
    : undefined
  return (
    <h2 className={className} style={style}>
      {text.split('\n').map((line, index) => (
        <span key={`${index}-${line}`}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </h2>
  )
}

function stageStyle(): CSSProperties {
  return {
    position: 'relative',
    height: 460,
    overflow: 'hidden',
    borderRadius: 8,
    background: '#111',
  }
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

  const draft = textPreviewDraft(section, pageCopy, technology, highlights)
  const image = desktopUrl(assignments, SLOT[section] || '')
  const active = (field: string) => focusedField === field

  let visual = (
    <section className={overview.cinematicSection} style={{ minHeight: 460, height: 460 }}>
      <div className={overview.cinematicBg}>
        {heroImage ? <img src={heroImage} alt="" className={overview.cinematicBgImg} /> : null}
        <div className={overview.cinematicOverlay} />
      </div>
      <div className={overview.cinematicContent}>
        <p className={overview.editorialLabel}><span className={overview.editorialCat}>{modelName}</span></p>
        {tagline ? <h2 className={overview.cinematicHeading}>{tagline}</h2> : null}
      </div>
    </section>
  )

  if (textEditMode && section === 'performance') {
    visual = (
      <section className={overview.performanceSection} style={{ minHeight: 460, height: 460 }}>
        <div className={overview.performanceBg}>
          {image ? <img src={image} alt="" className={overview.performanceBgImg} /> : null}
          <div className={overview.cinematicOverlay} />
        </div>
        <div className={overview.performanceContent}>
          {draft.label ? <p className={overview.editorialLabel}><span className={overview.editorialCat}>{draft.label}</span></p> : null}
          <Lines text={draft.heading} className={overview.performanceHeading} active={active('heading')} />
          {draft.body ? <p className={overview.cinematicBody} style={active('body') ? { outline: '2px solid #C9A84C' } : undefined}>{draft.body}</p> : null}
          <div className={overview.performanceStats}>
            {draft.highlights.map((item) => (
              <div key={`${item.value}-${item.label}`} className={overview.performanceStat}>
                <span className={overview.performanceStatTag}>{item.value}</span>
                <span className={overview.performanceStatLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  } else if (textEditMode && section === 'technology') {
    visual = (
      <section className={overview.techSection} style={{ minHeight: 460 }}>
        <div className={overview.techLayout}>
          {image ? <img src={image} alt="" className={overview.techMainImg} /> : null}
          <div>
            <Lines text={draft.heading} className={overview.techHeading} active={active('heading')} />
            {draft.body ? <p className={overview.techSubheadline}>{draft.body}</p> : null}
            {features.slice(0, 4).map((feature) => (
              <p key={feature.id} className={overview.techFeatureTitle}>{feature.title}</p>
            ))}
          </div>
        </div>
      </section>
    )
  } else if (textEditMode && (section === 'tech_intelligence' || section === 'tech_close')) {
    visual = (
      <section className={technologyStyles.cinematicScene} style={{ minHeight: 460, height: 460 }}>
        <div className={technologyStyles.sceneBg}>
          {image ? <img src={image} alt="" className={technologyStyles.sceneBgImg} /> : null}
        </div>
        <div className={technologyStyles.sceneContent}>
          {draft.label ? <p className={technologyStyles.sceneEyebrow}>{draft.label}</p> : null}
          <Lines text={draft.heading} className={technologyStyles.cinematicHeading} active={active('heading')} />
          {draft.body ? <p className={technologyStyles.sceneSupportText}>{draft.body}</p> : null}
          {draft.primary ? <p className={overview.editorialCat}>{draft.primary}</p> : null}
        </div>
      </section>
    )
  } else if (textEditMode && (section === 'cta' || section === 'hero_cta' || section === 'specs_cta')) {
    visual = (
      <section className={overview.ctaSection} style={{ minHeight: 460, height: 460 }}>
        <div className={overview.ctaBg}>
          {image ? <img src={image} alt="" className={overview.ctaBgImg} /> : null}
          <div className={overview.cinematicOverlay} />
        </div>
        <div className={overview.ctaContent}>
          {draft.label ? <p className={overview.ctaEyebrow}>{draft.label}</p> : null}
          <Lines text={draft.heading} className={overview.ctaHeading} active={active('heading')} />
          {draft.body ? <p className={overview.ctaBody}>{draft.body}</p> : null}
          <div className={overview.ctaActions}>
            {draft.primary ? <span className={overview.editorialCat}>{draft.primary}</span> : null}
            {draft.secondary ? <span className={overview.editorialCat}>{draft.secondary}</span> : null}
          </div>
        </div>
      </section>
    )
  } else if (textEditMode && section === 'adas') {
    visual = (
      <section className={overview.cinematicSection} style={{ minHeight: 460, height: 460 }}>
        <div className={overview.cinematicBg}>
          {image ? <img src={image} alt="" className={overview.cinematicBgImg} /> : null}
          <div className={overview.cinematicOverlay} />
        </div>
        <div className={overview.adasContent}>
          {draft.label ? <p className={overview.editorialLabel}><span className={overview.editorialCat}>{draft.label}</span></p> : null}
          {(draft.stat || draft.unit) && (
            <p className={overview.performanceStatTag}>{[draft.stat, draft.unit].filter(Boolean).join(' ')}</p>
          )}
          <Lines text={draft.heading} className={overview.adasHeading} active={active('heading')} />
          {draft.body ? <p className={overview.cinematicBody}>{draft.body}</p> : null}
        </div>
      </section>
    )
  } else if (textEditMode) {
    const headingClass = section === 'cockpit'
      ? overview.cockpitHeading
      : section === 'profile'
        ? overview.presenceHeading
        : overview.cinematicHeading
    visual = (
      <section className={overview.cinematicSection} style={{ minHeight: 460, height: 460 }}>
        <div className={overview.cinematicBg}>
          {image ? <img src={image} alt="" className={overview.cinematicBgImg} /> : null}
          <div className={overview.cinematicOverlay} />
        </div>
        <div className={overview.cinematicContent}>
          {draft.label ? <p className={overview.editorialLabel}><span className={overview.editorialCat}>{draft.label}</span></p> : null}
          <Lines text={draft.heading} className={headingClass} active={active('heading')} />
          {draft.body ? <p className={section === 'cockpit' ? overview.cockpitBody : overview.cinematicBody}>{draft.body}</p> : null}
        </div>
      </section>
    )
  }

  return (
    <aside aria-label={textEditMode ? `Text preview ${section}` : `Preview ${modelName}`}>
      <p className={overview.editorialLabel}>
        <span className={overview.editorialCat}>
          {textEditMode ? `Text preview · ${section}` : `Preview · ${modelName}`}
        </span>
      </p>
      <div style={stageStyle()}>{visual}</div>
    </aside>
  )
}
