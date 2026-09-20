/**
 * JAECOO Palembang — Gallery
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getModels } from "@/lib/supabase/queries";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery JAECOO Palembang — Foto & Detail",
  description: "Eksplorasi desain, interior, dan detail JAECOO J5 EV, J7 SHS, dan J8 ARDIS SHS di Palembang.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const models = await getModels();
  const wa = buildWhatsAppUrl({ source: "gallery_page", source_cta: "gallery_cta" });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="VISUAL GALLERY"
        heading="Every angle. Every detail."
        subheading="Eksplorasi visual JAECOO dari setiap sudut."
        size="medium"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>Lineup JAECOO</span>
            <h1 className={styles.heading}>
              See it.<br />
              <em>Rasakan Sendiri.</em>
            </h1>
          </div>

          <div className={styles.grid}>
            {models.map((model, i) => {
              const src = model.hero_media?.image?.desktop;
              const isValid = src && src.startsWith("http");
              return (
                <Link
                  key={model.slug}
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
              );
            })}
          </div>

          <div className={styles.bottom}>
            <h2 className={styles.bottomHeading}>Ingin melihat langsung?</h2>
            <Button as="a" href={wa} variant="darkPrimary" size="lg" target="_blank" rel="noopener noreferrer">
              Jadwalkan Test Drive →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
