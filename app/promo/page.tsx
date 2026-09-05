/**
 * JAECOO Palembang — Promo
 * Route: /promo
 * Phase 2: Visual foundation.
 */

import type { Metadata } from "next";
import { getActivePromos } from "@/lib/data/promos";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./promo.module.css";

export const metadata: Metadata = {
  title: "Promo JAECOO Palembang — Penawaran Terkini",
  description: "Penawaran dan promo eksklusif JAECOO di Palembang. Dapatkan harga terbaik untuk J5 EV, J7 SHS, dan J8 Ardis SHS.",
};

export default function PromoPage() {
  const promos = getActivePromos();
  const whatsappUrl = buildWhatsAppUrl({
    source: "promo_page",
    source_cta: "promo_cta",
  });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="Penawaran Eksklusif"
        heading="Promo Terkini."
        subheading="Penawaran spesial dari JAECOO Palembang — terbatas untuk waktu tertentu."
        size="medium"
        accent="warm"
      />

      <section className={styles.section}>
        <Container>
          <Reveal variant="fade-up">
            <div className={styles.header}>
              <GoldLine width="short" />
              <SectionHeading
                eyebrow="Penawaran"
                heading="Promo Aktif"
              />
            </div>
          </Reveal>

          {promos.length === 0 ? (
            <Reveal variant="fade" delay={150}>
              <div className={styles.empty}>
                <p className={styles.emptyTitle}>Tidak ada promo aktif saat ini.</p>
                <p className={styles.emptyBody}>
                  Hubungi Sales untuk mendapatkan penawaran terbaik yang disesuaikan kebutuhan Anda.
                </p>
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
              </div>
            </Reveal>
          ) : (
            <div className={styles.promoList}>
              {promos.map((promo, i) => (
                <Reveal key={promo.id} variant="fade-up" delay={i * 80}>
                  <article className={styles.promoRow}>
                    <div className={styles.promoMeta}>
                      {promo.badge && (
                        <span className={styles.promoBadge}>{promo.badge}</span>
                      )}
                      {promo.valid_until && (
                        <span className={styles.promoValidity}>
                          s/d {new Date(promo.valid_until).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <h2 className={styles.promoTitle}>{promo.title}</h2>
                    <p className={styles.promoDesc}>{promo.description}</p>
                    <Button
                      as="a"
                      href={buildWhatsAppUrl({
                        source: "promo_page",
                        source_cta: promo.cta_whatsapp_context,
                        model: promo.model_slug ?? undefined,
                      })}
                      variant="primary"
                      size="sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {promo.cta_label}
                    </Button>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
