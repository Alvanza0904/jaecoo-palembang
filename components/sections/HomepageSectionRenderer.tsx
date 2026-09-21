/**
 * JAECOO Palembang — Shared Homepage Section Renderer
 *
 * IMPORTANT:
 * Preview and public homepage MUST use the same section components.
 * The editor may change CMS text locally, but it must never invent a
 * different visual layout. Layout, typography, spacing and responsive CSS
 * come from the exact components used by the public homepage.
 */

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { HeroPlaceholder } from '@/components/hero/HeroPlaceholder'
import {
  HomeExperienceSection,
  HomeTeknologiSection,
  HomeAboutSection,
  HomeFinalCTA,
} from '@/components/sections/HomeExperience'
import { HomeDealerLocation } from '@/components/sections/HomeDealerLocation'
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp'
import type { ResponsiveImage } from '@/lib/types/media'

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
      cta={
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
      }
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
