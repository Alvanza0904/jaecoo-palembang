/**
 * JAECOO Palembang — Model Index
 * Route: /model
 * Phase 2: Redirect atau daftar semua model.
 */

import type { Metadata } from "next";
import { getModels } from "@/lib/data/models";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import styles from "./model-index.module.css";

export const metadata: Metadata = {
  title: "Model JAECOO Palembang — J5 EV, J7 SHS, J8 Ardis SHS",
  description:
    "Jelajahi lineup JAECOO di Palembang: J5 EV, J7 SHS, dan J8 Ardis SHS. Temukan SUV premium yang sesuai untuk Anda.",
};

export default function ModelIndexPage() {
  const models = getModels();

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="The Range"
        heading="Three models. One philosophy."
        subheading="Performance, technology, and design — without compromise."
        size="medium"
        accent="default"
      />

      <section className={styles.section}>
        <Container>
          <Reveal variant="fade-up">
            <div className={styles.header}>
              <GoldLine width="short" />
              <SectionHeading
                eyebrow="Lineup"
                heading="Pilih Model Anda"
                subheading="Setiap JAECOO dirancang untuk memberikan pengalaman berkendara yang berbeda — temukan yang paling sesuai."
              />
            </div>
          </Reveal>

          <div className={styles.modelList}>
            {models.map((model, i) => (
              <Reveal key={model.slug} variant="fade-up" delay={i * 80}>
                <article className={styles.modelRow}>
                  <div className={styles.modelMeta}>
                    <span className={styles.modelIndex} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.modelShort}>{model.short_name}</span>
                  </div>

                  <div className={styles.modelInfo}>
                    <h2 className={styles.modelName}>{model.name}</h2>
                    <p className={styles.modelTagline}>{model.tagline}</p>

                    <div className={styles.modelPricing}>
                      <div>
                        <PriceDisplay
                          price_status={model.default_variant.price_status}
                          price_idr={model.default_variant.price_idr}
                          price_display={model.default_variant.price_display}
                          price_display_override={model.default_variant.price_display_override}
                          price_region={model.default_variant.price_region}
                        />
                        <p className={styles.modelRegion}>
                          {model.default_variant.price_region}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.modelActions}>
                    <Button
                      as="link"
                      href={`/model/${model.slug}`}
                      variant="primary"
                      size="md"
                    >
                      Jelajahi {model.short_name}
                    </Button>
                    <Button
                      as="link"
                      href={`/model/${model.slug}/specifications`}
                      variant="ghost"
                      size="sm"
                    >
                      Spesifikasi →
                    </Button>
                  </div>

                  <div className={styles.modelSep} aria-hidden="true" />
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
