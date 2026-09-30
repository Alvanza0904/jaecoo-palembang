/**
 * JAECOO Palembang — Gallery hub
 * Visual exploration entry: pick a model, then open its gallery.
 * Not a duplicate of /model.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getModels } from "@/lib/supabase/queries";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { Button } from "@/components/ui/Button";
import styles from "./gallery.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Galeri JAECOO Palembang | Visual Showcase" },
  description:
    "Jelajahi visual JAECOO J5 EV, J7 SHS, J7 SIVP, dan J8 dari dekat — exterior, interior, detail, dan warna.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const models = await getModels();
  const wa = buildWhatsAppUrl({ source: "gallery_page", source_cta: "gallery_cta" });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="JAECOO GALLERY"
        heading="Lihat mobilnya dari dekat."
        subheading="Pilih model, lalu jelajahi exterior, interior, detail, dan warna — tanpa mengulang halaman produk."
        size="medium"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <Reveal variant="fade-up" delay={0}>
              <span className={styles.eyebrow}>Explore</span>
            </Reveal>
            <Reveal variant="mask" delay={80}>
              <h1 className={styles.heading}>
                Pilih model.
                <br />
                <em>Masuk ke gallery-nya.</em>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={120}>
              <p className={styles.lead}>
                Halaman Model untuk memahami spesifikasi. Gallery untuk melihat mobil — foto nyata dari CMS,
                tanpa harga atau kalkulator.
              </p>
            </Reveal>
          </div>

          <div className={styles.grid}>
            {models.map((model, i) => {
              const src =
                model.hero_media?.image?.desktop ??
                model.hero_media?.image?.tablet ??
                model.hero_media?.image?.mobile;
              const isValid = !!src && /^https:\/\//i.test(src);
              return (
                <Reveal key={model.slug} variant="fade-up" delay={(i % 4) * 60}>
                  <Link
                    href={`/gallery/${model.slug}`}
                    className={[styles.card, i === 0 ? styles.cardFeatured : ""].filter(Boolean).join(" ")}
                    aria-label={`Buka gallery ${model.name}`}
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
                    <div className={styles.cardInfo}>
                      <p className={styles.cardName}>Gallery</p>
                      <p className={styles.cardTitle}>{model.short_name}</p>
                      <p className={styles.cardHint}>Lihat visual →</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <div className={styles.bottom}>
            <Reveal variant="blur" delay={0}>
              <h2 className={styles.bottomHeading}>Ingin melihat unit langsung di Palembang?</h2>
            </Reveal>
            <Reveal variant="scale" delay={100}>
              <Button as="a" href={wa} variant="darkPrimary" size="lg" target="_blank" rel="noopener noreferrer">
                Chat dengan Alvan →
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
