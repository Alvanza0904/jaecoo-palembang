/**
 * JAECOO Palembang — Gallery
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getModels } from "@/lib/supabase/queries";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import type { RevealVariant } from "@/components/motion/Reveal";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./gallery.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Galeri JAECOO Palembang | Foto Model" },
  description: "Foto desain, interior, dan detail JAECOO J5 EV, J7 SHS, J7 SIVP, dan J8 di Palembang.",
  alternates: { canonical: "/gallery" },
};

const CARD_VARIANTS: RevealVariant[] = ["fade-up", "fade", "slide-left", "slide-right", "scale", "fade-down"];

function cardVariant(i: number): RevealVariant {
  return CARD_VARIANTS[i % CARD_VARIANTS.length];
}

export default async function GalleryPage() {
  const models = await getModels();
  const wa = buildWhatsAppUrl({ source: "gallery_page", source_cta: "gallery_cta" });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="GALERI"
        heading="Setiap sudut. Setiap detail."
        subheading="Lihat JAECOO dari dekat, dari eksterior sampai kabin."
        size="medium"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <Reveal variant="fade-up" delay={0}>
              <span className={styles.eyebrow}>Lineup JAECOO</span>
            </Reveal>
            <Reveal variant="mask" delay={80}>
              <h1 className={styles.heading}>
                See it.<br />
                <em>Rasakan Sendiri.</em>
              </h1>
            </Reveal>
          </div>

          <div className={styles.grid}>
            {models.map((model, i) => {
              const src = model.hero_media?.image?.desktop;
              const isValid = src && src.startsWith("http");
              return (
                <Reveal key={model.slug} variant={cardVariant(i)} delay={(i % 3) * 70}>
                  <Link
                    href={`/model/${model.slug}`}
                    className={[styles.card, i === 0 ? styles.cardFeatured : ""].filter(Boolean).join(" ")}
                    aria-label={`Lihat ${model.name}`}
                  >
                    {isValid ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={model.name}
                        className={styles.cardImg}
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div
                        className={styles.cardImg}
                        style={{ background: "linear-gradient(135deg, #1a1a1a, #282828)" }}
                        aria-hidden="true"
                      />
                    )}
                    <div className={styles.cardOverlay} aria-hidden="true" />
                    <span className={styles.cardLabel} aria-hidden="true">
                      {model.short_name}
                    </span>
                    <div className={styles.cardInfo}>
                      <p className={styles.cardName}>JAECOO</p>
                      <p className={styles.cardTitle}>{model.short_name}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className={styles.bottom}>
            <Reveal variant="blur" delay={0}>
              <h2 className={styles.bottomHeading}>Ingin melihat langsung?</h2>
            </Reveal>
            <Reveal variant="scale" delay={100}>
              <Button as="a" href={wa} variant="darkPrimary" size="lg" target="_blank" rel="noopener noreferrer">
                Jadwalkan Test Drive →
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
