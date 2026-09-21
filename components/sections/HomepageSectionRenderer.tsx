/**
 * JAECOO Palembang — Shared Homepage Section Renderer
 *
 * SINGLE SOURCE OF TRUTH ARCHITECTURE:
 *
 *   Visual Editor (editor state)
 *         │
 *         ▼ save
 *   Supabase (homepage_content + content_media + media_assets.presentation_settings)
 *         │
 *         ▼ query
 *   SectionRenderData (carries full ResponsiveImage WITH presentation_settings)
 *         │
 *         ├──── Section Preview (editor iframe)
 *         └──── Live Website (app/(public)/page.tsx)
 *
 * KRITIS: `image` field di SectionRenderData adalah ResponsiveImage lengkap
 * yang sudah membawa presentation_settings, focal_x, focal_y, cutout, dll.
 * Live page.tsx WAJIB mengisi field ini dari homeMedia[...] (bukan hanya URL string).
 *
 * ROOT CAUSE yang diperbaiki (2026-09-21):
 * - responsiveImage() sebelumnya hanya membuat { desktop, mobile, alt }
 *   → membuang presentation_settings dari Supabase
 * - Live page hanya pass .desktop dan .mobile URL strings
 *   → heroMediaAsset tidak pernah diisi → HeroPlaceholder, bukan LayeredHero
 * - Semua section (experience, technology, about, dll) juga kehilangan
 *   presentation_settings → object-position, scale, typography diabaikan
 *
 * SOLUSI:
 * - Tambah field `image?: ResponsiveImage` ke SectionRenderData
 * - responsiveImage() prioritaskan `data.image` (full) sebelum fallback ke URL
 * - HeroShared: gunakan `data.image` (sudah ada presentation_settings) sebagai
 *   sumber utama, lalu heroMediaAsset (dari editor picker), lalu HeroPlaceholder
 * - Live page.tsx pass homeMedia[slot] langsung sebagai `image`
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
  /**
   * UTAMA: Full ResponsiveImage dari Supabase — sudah membawa
   * presentation_settings, focal_x, focal_y, cutout, dll.
   *
   * Live page.tsx mengisi ini dari homeMedia[contentMediaKey(...)].
   * Editor mengisi ini setelah media dipilih dari MediaPicker.
   *
   * Jika tersedia, digunakan langsung tanpa membangun ulang dari URL.
   */
  image?: ResponsiveImage

  /**
   * Legacy / editor-only fields — URL saja (tanpa presentation_settings).
   * Digunakan sebagai fallback jika `image` tidak tersedia.
   * HomepageEditor mengisi ini untuk preview instan sebelum asset selesai diproses.
   */
  desktop_image?: string
  mobile_image?: string

  // Content fields
  eyebrow?: string
  headline?: string
  title?: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  address?: string

  /**
   * Full MediaAsset untuk hero — HANYA digunakan oleh editor picker.
   * Live website menggunakan `image` (sudah datang dari Supabase via getHomeMedia).
   * Editor mengisi ini ketika user memilih asset baru dari MediaPicker.
   */
  heroMediaAsset?: MediaAsset | null
}

interface Props {
  sectionId: SectionId
  data: SectionRenderData
  mode?: 'preview' | 'live'
}

/**
 * Resolve ResponsiveImage dari SectionRenderData.
 *
 * Priority:
 * 1. data.image — full ResponsiveImage dengan presentation_settings (live + editor post-pick)
 * 2. { desktop, mobile } built dari URL strings — fallback tanpa presentation_settings
 */
function resolveImage(data: SectionRenderData): ResponsiveImage | undefined {
  // Priority 1: full ResponsiveImage sudah ada (dari live page atau editor post-pick)
  if (data.image) {
    // Pastikan alt selalu ada
    return { ...data.image, alt: data.image.alt || '' }
  }

  // Priority 2: fallback ke URL strings (tanpa presentation_settings)
  if (data.desktop_image || data.mobile_image) {
    return {
      desktop: data.desktop_image,
      mobile: data.mobile_image,
      alt: '',
    }
  }

  return undefined
}

/**
 * Resolve MediaWithArtDirection untuk LayeredHero dari berbagai sumber data.
 *
 * Priority:
 * 1. data.heroMediaAsset (editor picker — penuh dengan variants/cutout/presentation_settings)
 * 2. data.image (live page — ResponsiveImage dari Supabase dengan presentation_settings)
 */
function resolveHeroMedia(data: SectionRenderData) {
  // Priority 1: editor MediaAsset (sudah ada variants object)
  if (data.heroMediaAsset) {
    const asset = data.heroMediaAsset
    return {
      image: {
        desktop: asset.variants?.['1920'] ?? asset.variants?.['1440'] ?? asset.public_url ?? undefined,
        tablet:  asset.variants?.['1024'] ?? asset.variants?.['768']  ?? asset.public_url ?? undefined,
        mobile:  asset.variants?.['768']  ?? asset.variants?.['480']  ?? asset.public_url ?? undefined,
        small_mobile: asset.variants?.['480'] ?? asset.public_url ?? undefined,
        cutout: asset.cutout_url ?? undefined,
        alt: asset.alt_text ?? asset.filename ?? '',
      },
      presentation_settings: asset.presentation_settings,
      media_asset_id: asset.id,
      focal_x: asset.focal_x ?? 50,
      focal_y: asset.focal_y ?? 50,
    }
  }

  // Priority 2: full ResponsiveImage dari live page (sudah ada presentation_settings)
  if (data.image && (data.image.desktop || data.image.mobile)) {
    const img = data.image
    return {
      image: {
        desktop:      img.desktop,
        tablet:       img.tablet ?? img.desktop,
        mobile:       img.mobile ?? img.desktop,
        small_mobile: img.small_mobile ?? img.mobile ?? img.desktop,
        cutout:       img.cutout,
        alt:          img.alt || '',
      },
      presentation_settings: img.presentation_settings,
      cutout_presentation_settings: img.cutout_presentation_settings,
      focal_x: img.focal_x ?? 50,
      focal_y: img.focal_y ?? 50,
      cutout_focal_x: img.cutout_focal_x,
      cutout_focal_y: img.cutout_focal_y,
    }
  }

  return null
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

  // Resolve media dengan prioritas: editor asset → live ResponsiveImage → placeholder
  const heroMedia = resolveHeroMedia(data)

  if (heroMedia) {
    return (
      <LayeredHero
        media={heroMedia}
        heading={data.headline || 'JAECOO J5'}
        subheading={data.description || 'THIS IS THE REAL SUV.'}
        tagline={data.eyebrow || 'FORM CLASSIC BEYOND CLASSIC'}
        cta={ctaNode}
        overlayOpacity={30}
        size="full"
      />
    )
  }

  // Fallback placeholder (belum ada media sama sekali)
  const fallbackImage = resolveImage(data)
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
      backgroundImage={fallbackImage?.desktop}
      backgroundImageMobile={fallbackImage?.mobile}
    />
  )
}

export function HomepageSectionRenderer({ sectionId, data, mode = 'live' }: Props) {
  // resolveImage sekarang membawa presentation_settings untuk semua section
  const image = resolveImage(data)

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

  return mode === 'preview'
    ? <PreviewInteractionGuard>{content}</PreviewInteractionGuard>
    : content
}
