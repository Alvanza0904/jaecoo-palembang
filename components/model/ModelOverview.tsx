/**
 * JAECOO Palembang — Model Overview Section
 *
 * Section tepat setelah Hero pada halaman Model.
 * Layout: vehicle image (kanan) + deskripsi & harga (kiri).
 *
 * STEP 6K: Initial implementation — frontend only, no admin editor.
 */

import Image from "next/image";
import type { ModelData } from "@/lib/types/model";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { GoldLine } from "@/components/ui/GoldLine";
import { Reveal } from "@/components/motion/Reveal";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./ModelOverview.module.css";

interface ModelOverviewProps {
  model: ModelData;
}

export function ModelOverview({ model }: ModelOverviewProps) {
  const whatsappUrl = buildWhatsAppUrl({
    source: "model_overview",
    source_page: `/model/${model.slug}`,
    model: model.short_name,
    source_cta: "overview_cta",
  });

  // Resolve vehicle image: prefer cutout, fallback to desktop hero
  const vehicleImage =
    model.hero_media?.image?.cutout ??
    model.hero_media?.image?.desktop ??
    null;

  const vehicleAlt = model.hero_media?.image?.alt ?? `${model.name} tampak samping`;

  return (
    <section className={styles.overview} aria-label={`Overview ${model.name}`}>
      <div className={styles.inner}>
        {/* ── Left: Content ─────────────────────────────────────── */}
        <div className={styles.content}>
          <Reveal variant="fade-up">
            <div className={styles.eyebrow}>
              <GoldLine width="short" />
              <span className={styles.eyebrowText}>Overview</span>
            </div>

            <h2 className={styles.name}>{model.name}</h2>
            <p className={styles.tagline}>{model.tagline}</p>
            <p className={styles.description}>{model.description}</p>
          </Reveal>

          <Reveal variant="fade-up" delay={100}>
            <div className={styles.priceRow}>
              <p className={styles.priceLabel}>Harga OTR Palembang</p>
              <PriceDisplay
                price_status={model.default_variant.price_status}
                price_idr={model.default_variant.price_idr}
                price_display={model.default_variant.price_display}
                price_display_override={
                  model.default_variant.price_display_override
                }
                price_region={model.default_variant.price_region}
                className={styles.priceDisplay}
              />
            </div>
          </Reveal>

          <Reveal variant="fade-up" delay={160}>
            <div className={styles.ctas}>
              <Button
                as="a"
                href={whatsappUrl}
                variant="primary"
                size="md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Talk to Alvan →
              </Button>
              <Button
                as="link"
                href={`/model/${model.slug}/specifications`}
                variant="secondary"
                size="md"
              >
                Spesifikasi Lengkap
              </Button>
            </div>
          </Reveal>
        </div>

        {/* ── Right: Vehicle Image ───────────────────────────────── */}
        {vehicleImage && (
          <Reveal variant="fade" delay={80} className={styles.imageWrap}>
            <div className={styles.imageInner}>
              <Image
                src={vehicleImage}
                alt={vehicleAlt}
                fill
                priority={false}
                style={{
                  objectFit: vehicleImage.endsWith(".png") ? "contain" : "cover",
                  objectPosition: "center",
                }}
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 55vw, 50vw"
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
