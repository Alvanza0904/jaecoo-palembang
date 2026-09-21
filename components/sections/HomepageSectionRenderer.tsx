/**
 * JAECOO Palembang — Shared Homepage Section Renderer
 *
 * IMPORTANT:
 * Preview and public homepage MUST use the same section components.
 * The editor may change CMS text locally, but it must never invent a
 * different visual layout. Layout, typography, spacing and responsive CSS
 * come from the exact components used by the public homepage.
 *
 * FIX PREVIEW SYNC (2026-09-21):
 * - SectionRenderData kini membawa mediaAsset (opsional) agar preview hero
 *   dapat merender presentation_settings yang sama dengan live website.
 * - HeroShared: jika ada mediaAsset, render LayeredHero (live); jika tidak,
 *   fallback ke HeroPlaceholder.
 */

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { HeroPlaceholder } from '@/components/hero/HeroPlaceholder'
import { LayeredHero } from '@/components/hero/LayeredHero'
import {
  HomeExperienceSection,
  HomeTeknologiSection,
  HomeAboutSection,
  HomeFinalCTA,
} from '@/components/sections/HomeExperience'
import { HomeDealerLocation } from '@/components/sections/HomeDealerLocation'
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp'
import type { ResponsiveImage } from '@/lib/types/media'
import type { MediaAsset } from '@/lib/types/media-asset'

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
  /**
   * Full MediaAsset untuk hero — digunakan preview agar presentation_settings
   * (object-position, cutout, typography) identik dengan live website.
   * Opsional: jika tidak ada, fallback ke HeroPlaceholder (url saja).
   */
  heroMediaAsset?: MediaAsset | null
}

interface Props {
  sectionId: SectionId
  data: SectionRenderData
  mode?: 'preview' | 'live'
}

function responsiveImage(data: SectionRenderData): ResponsiveImage | undefined {
  if (!data.desktop_image && !data.mobile_image) return undefined

  return {
    desktop: data.desktop_image,
    mobile: data.mobile_image,
    alt: '',
  }
}

function PreviewInteractionGuard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ width: '100%', pointerEvents: 'none' }}
      aria-label="Preview section"
    >
      {children}
    </div>
  )
}

function HeroShared({ data }: { data: SectionRenderData }) {
  const image = responsiveImage(data)
  const heroUrl = buildWhatsAppUrl({
    source: 'homepage_hero',
    model: 'J5 EV',
    source_cta: 'hero_cta',
  })

  const ctaNode = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
      <Button
        as="link"
        href={data.ctaUrl || '/model/jaecoo-j5-ev'}
        variant="primary"
        size="lg"
      >
        {data.ctaText || 'Jelajahi J5'}
      </Button>
      <Button
        as="a"
        href={heroUrl}
        variant="secondary"
        size="lg"
        target="_blank"
        rel="noopener noreferrer"
      >
        Chat dengan Alvan →
      </Button>
    </div>
  )

  // Jika ada MediaAsset lengkap → pakai LayeredHero (identik dengan live website).
  // presentation_settings, object-position, cutout, dan typography semuanya
  // dihitung oleh komponen dan helpers yang sama dengan live.
  if (data.heroMediaAsset) {
    const asset = data.heroMediaAsset
    const mediaWithArtDirection = {
      image: {
        desktop: asset.variants?.['1920'] ?? asset.variants?.['1440'] ?? asset.public_url ?? undefined,
        tablet:  asset.variants?.['1024'] ?? asset.variants?.['768'] ?? asset.public_url ?? undefined,
        mobile:  asset.variants?.['768']  ?? asset.variants?.['480'] ?? asset.public_url ?? undefined,
        small_mobile: asset.variants?.['480'] ?? asset.public_url ?? undefined,
        cutout:  asset.cutout_url ?? undefined,
        alt:     asset.alt_text ?? asset.filename ?? '',
      },
      presentation_settings: asset.presentation_settings,
      media_asset_id: asset.id,
      focal_x: asset.focal_x ?? 50,
      focal_y: asset.focal_y ?? 50,
    }

    return (
      <LayeredHero
        media={mediaWithArtDirection}
        heading={data.headline || 'JAECOO J5'}
        subheading={data.description || 'THIS IS THE REAL SUV.'}
        tagline={data.eyebrow || 'FORM CLASSIC BEYOND CLASSIC'}
        cta={ctaNode}
        overlayOpacity={30}
        size="full"
      />
    )
  }

  // Fallback: hanya URL tersedia (belum pilih dari MediaPicker yang full)
  return (
    <HeroPlaceholder
      tagline={data.eyebrow || 'DEALER RESMI JAECOO PALEMBANG'}
      heading={
        <span
          style={{
            display: 'block',
            fontSize: 'clamp(3.5rem, 12vw, 10rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 0.9,
            color: '#fff',
          }}
        >
          {data.headline || 'J5'}
        </span>
      }
      subheading={data.description || 'THIS IS THE REAL SUV.'}
      cta={ctaNode}
      backgroundImage={image?.desktop}
      backgroundImageMobile={image?.mobile}
    />
  )
}

export function HomepageSectionRenderer({ sectionId, data, mode = 'live' }: Props) {
  const image = responsiveImage(data)

  // Preview intentionally uses the exact public components. The only thing
  // that changes is the data object supplied by the editor while typing.
  const content = (() => {
    switch (sectionId) {
      case 'hero':
        return <HeroShared data={data} />

      case 'experience':
        return (
          <HomeExperienceSection
            image={image}
            cms={{
              title: data.title,
              description: data.description,
            }}
          />
        )

      case 'technology':
        return (
          <HomeTeknologiSection
            image={image}
            cms={{
              title: data.title,
              description: data.description,
            }}
          />
        )

      case 'about':
        return (
          <HomeAboutSection
            image={image}
            cms={{
              title: data.title,
              description: data.description,
            }}
          />
        )

      case 'final_cta':
        return (
          <HomeFinalCTA
            image={image}
            cms={{
              title: data.title,
              description: data.description,
              ctaText: data.ctaText,
              ctaUrl: data.ctaUrl,
            }}
          />
        )

      case 'dealer_location':
        return (
          <HomeDealerLocation
            backgroundImage={image}
            cms={{
              title: data.title,
              description: data.description,
              address: data.address,
            }}
          />
        )

      default:
        return null
    }
  })()

  // Prevent preview clicks from navigating away. Visual output remains the
  // exact same public component in both modes.
  return mode === 'preview'
    ? <PreviewInteractionGuard>{content}</PreviewInteractionGuard>
    : content
}
