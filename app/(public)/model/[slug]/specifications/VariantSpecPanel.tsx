"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { ModelSpecCategory, ModelVariant } from "@/lib/types/model";
import styles from "./specifications.module.css";

const ARDIS_ID = "jaecoo-j8-ardis";
const ARDIS_PREFIX = "J8 ARDIS";

export function VariantSpecPanel({
  variants,
  categories,
  defaultVariantId,
  slug,
}: {
  variants: ModelVariant[];
  categories: ModelSpecCategory[];
  defaultVariantId: string;
  slug: string;
}) {
  const [activeId, setActiveId] = useState(
    variants.some((variant) => variant.id === defaultVariantId) ? defaultVariantId : variants[0]?.id,
  );
  const ardis = activeId === ARDIS_ID;
  const visible = categories
    .filter((category) => ardis ? category.label.startsWith(ARDIS_PREFIX) : !category.label.startsWith(ARDIS_PREFIX))
    .map((category) => ({
      ...category,
      label: category.label.replace(/^J8 ARDIS — /, ""),
    }));

  return (
    <>
      <section className={styles.specsSection} data-contrast="light">
        <Container size="content">
          <div className={styles.categories}>
            {visible.map((category, index) => (
              <Reveal key={category.label} variant="fade-up" delay={index * 60}>
                <div className={styles.category}>
                  <h2 className={styles.categoryLabel}>{category.label}</h2>
                  <table className={styles.table} aria-label={`Spesifikasi ${category.label}`}>
                    <tbody>
                      {category.specs.map((spec) => (
                        <tr key={spec.label} className={styles.row}>
                          <th className={styles.rowLabel} scope="row">{spec.label}</th>
                          <td className={styles.rowValue}>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal variant="fade" delay={200}>
            <p className={styles.disclaimer}>
              Spesifikasi dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.
              Untuk informasi terkini dan resmi, hubungi Sales JAECOO Palembang.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className={styles.variantsSection} data-contrast="light">
        <Container size="content">
          <Reveal variant="fade-up">
            <SectionHeading eyebrow="Varian" heading="Pilih Varian" />
          </Reveal>
          <div className={styles.variantList}>
            {variants.map((variant) => {
              const selected = variant.id === activeId;
              return (
                <div key={variant.id} className={selected ? `${styles.variantItem} ${styles.variantItemActive}` : styles.variantItem}>
                  <div className={styles.variantTop}>
                    <div>
                      <button
                        type="button"
                        className={styles.variantPick}
                        aria-pressed={selected}
                        onClick={() => setActiveId(variant.id)}
                      >
                        <h3 className={styles.variantName}>{variant.name}</h3>
                      </button>
                      {variant.label && <span className={styles.variantBadge}>{variant.label}</span>}
                    </div>
                    <PriceDisplay
                      price_status={variant.price_status}
                      price_idr={variant.price_idr}
                      price_display={variant.price_display}
                      price_display_override={variant.price_display_override}
                      price_region={variant.price_region}
                    />
                  </div>
                  <Button
                    as="a"
                    href={buildWhatsAppUrl({
                      source: "model_specifications",
                      source_page: `/model/${slug}/specifications`,
                      model: variant.name,
                      source_cta: "variant_specs_cta",
                    })}
                    variant="primary"
                    size="sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hubungi Sales
                  </Button>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
