'use client'

import { useEffect, useState } from 'react'
import { LayeredHero } from '@/components/hero/LayeredHero'
import { resolveSubpageHero } from '@/lib/models/hero'
import type { MediaWithArtDirection, ResponsiveImage } from '@/lib/types/media'
import type { ModelFeature, ModelHighlight, ModelPageCopy, ModelSectionCopy } from '@/lib/types/model'
import overview from '@/app/(public)/model/[slug]/page.module.css'
import technologyStyles from '@/app/(public)/model/[slug]/technology/technology.module.css'

type Assignment = {
  slot_key: string
  breakpoint: string | null
  media_assets?: {
    public_url?: string | null
    alt_text?: string | null
    variants?: Record<string, string> | null
    presentation_settings?: ResponsiveImage['presentation_settings']
    focal_x?: number | null
    focal_y?: number | null
    cutout_url?: string | null
  } | null
}

function lines(value?: string) {
  return (value || '').split('\n').filter((line) => line.length > 0)
}

function imageFromAssignments(rows: Assignment[], slot: string): ResponsiveImage | undefined {
  const matching = rows.filter((row) => row.slot_key === slot && row.media_assets?.public_url)
  if (!matching.length) return undefined
  const pick = (breakpoint: string) => matching.find((row) => row.breakpoint === breakpoint)?.media_assets
  const desktop = pick('desktop') ?? matching.find((row) => !row.breakpoint)?.media_assets ?? matching[0].media_assets
  const mobile = pick('mobile') ?? desktop
  if (!desktop?.public_url) return undefined
  const variants = desktop.variants ?? {}
  return {
    desktop: variants['1920'] ?? variants['1440'] ?? desktop.public_url,
    tablet: variants['1024'] ?? variants['768'] ?? desktop.public_url,
    mobile: mobile?.variants?.['768'] ?? mobile?.variants?.['480'] ?? mobile?.public_url ?? desktop.public_url,
    alt: desktop.alt_text || slot,
    presentation_settings: desktop.presentation_settings,
    presentation_settings_mobile: mobile?.presentation_settings,
    focal_x: desktop.focal_x ?? undefined,
    focal_y: desktop.focal_y ?? undefined,
    cutout: desktop.cutout_url ?? undefined,
  }
}

function TextBlock({
  label,
  heading,
  body,
  headingClass,
  bodyClass,
}: {
  label?: string
  heading?: string
  body?: string
  headingClass: string
  bodyClass: string
}) {
  return (
    <>
      {label && <p className={overview.editorialLabel}><span className={overview.editorialCat}>{label}</span></p>}
      {heading && (
        <h2 className={headingClass}>
          {lines(heading).map((line) => (
            <span key={line}>{line}<br /></span>
          ))}
        </h2>
      )}
      {body && <p className={bodyClass}>{body}</p>}
    </>
  )
}

export function ModelStickyPreview({
  slug,
  modelName,
  tagline,
  modelHero,
  section,
  pageCopy,
  highlights,
  technology,
  features,
}: {
  slug: string
  modelName: string
  tagline: string
  modelHero: MediaWithArtDirection
  section: string
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

  const slotFor: Record<string, string> = {
    exterior: 'exterior',
    design: 'design_detail_main',
    profile: 'profile',
    interior: 'interior',
    cockpit: 'cockpit_main',
    performance: 'performance',
    adas: 'adas',
    cta: 'final_cta',
    tech_intelligence: 'tech_intelligence',
    tech_close: 'tech_cta',
    technology_hero: 'technology_hero',
    specifications_hero: 'specifications_hero',
    technology: 'technology',
  }
  const image = imageFromAssignments(assignments, slotFor[section] || '')
  const copy = (pageCopy[section as keyof ModelPageCopy] as ModelSectionCopy | undefined) ?? {}

  let visual = null
  if (section === 'technology_hero' || section === 'specifications_hero' || section === 'hero') {
    const media = section === 'hero'
      ? modelHero
      : resolveSubpageHero(image, modelHero)
    const heading = section === 'hero'
      ? tagline
      : (copy.heading || (section === 'technology_hero' ? technology.headline : modelName))
    const subheading = section === 'hero'
      ? modelName
      : (copy.body || technology.subheadline || modelName)
    const eyebrow = section === 'hero' ? 'OVERVIEW' : (copy.label || (section === 'technology_hero' ? 'TECHNOLOGY' : 'SPESIFIKASI'))
    visual = (
      <LayeredHero
        media={media}
        heading={heading}
        subheading={subheading}
        tagline={eyebrow}
        size="large"
      />
    )
  } else if (section === 'performance') {
    visual = (
      <section className={overview.performanceSection}>
        <div className={overview.performanceBg}>
          {image?.desktop && <img src={image.desktop} alt="" className={overview.performanceBgImg} />}
        </div>
        <div className={overview.performanceContent}>
          <TextBlock label={copy.label} heading={copy.heading} body={copy.body} headingClass={overview.performanceHeading} bodyClass={overview.cinematicBody} />
          <div className={overview.performanceStats}>
            {highlights.map((item) => (
              <div key={`${item.value}-${item.label}`} className={overview.performanceStat}>
                <span className={overview.performanceStatTag}>{item.value}</span>
                <span className={overview.performanceStatLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  } else if (section === 'technology') {
    visual = (
      <section className={overview.techSection}>
        <div className={overview.techLayout}>
          {image?.desktop && <img src={image.desktop} alt="" className={overview.techMainImg} />}
          <div>
            <h2 className={overview.techHeading}>{technology.headline}</h2>
            {technology.subheadline && <p className={overview.techSubheadline}>{technology.subheadline}</p>}
            {features.slice(0, 4).map((feature) => (
              <p key={feature.id} className={overview.techFeatureTitle}>{feature.title}</p>
            ))}
          </div>
        </div>
      </section>
    )
  } else if (section === 'tech_intelligence' || section === 'tech_close') {
    visual = (
      <section className={technologyStyles.cinematicScene}>
        <div className={technologyStyles.sceneBg}>
          {image?.desktop && <img src={image.desktop} alt="" className={technologyStyles.sceneBgImg} />}
        </div>
        <div className={technologyStyles.sceneContent}>
          <p className={technologyStyles.sceneEyebrow}>{copy.label}</p>
          <h2 className={technologyStyles.cinematicHeading}>{copy.heading}</h2>
          {copy.body && <p className={technologyStyles.sceneSupportText}>{copy.body}</p>}
        </div>
      </section>
    )
  } else {
    const headingClass = section === 'cockpit' ? overview.cockpitHeading : section === 'profile' ? overview.presenceHeading : overview.cinematicHeading
    const bodyClass = section === 'cockpit' ? overview.cockpitBody : overview.cinematicBody
    visual = (
      <section className={overview.cinematicSection}>
        <div className={overview.cinematicBg}>
          {image?.desktop && <img src={image.desktop} alt="" className={overview.cinematicBgImg} />}
          <div className={overview.cinematicOverlay} />
        </div>
        <div className={overview.cinematicContent}>
          <TextBlock label={copy.label} heading={copy.heading} body={copy.body} headingClass={headingClass} bodyClass={bodyClass} />
        </div>
      </section>
    )
  }

  return (
    <aside className="model-sticky-preview" aria-label="Preview section">
      <p className={overview.editorialLabel}>Preview · {section}</p>
      <div style={{ position: 'relative', minHeight: 280, overflow: 'hidden', borderRadius: 8, background: '#111' }}>
        {visual}
      </div>
    </aside>
  )
}
