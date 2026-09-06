/**
 * JAECOO Palembang — Promo Detail Page
 * Route: /promo/[slug]
 * Phase 2: Visual foundation.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromoBySlug, getActivePromos } from "@/lib/data/promos";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GoldLine } from "@/components/ui/GoldLine";
import { Reveal } from "@/components/motion/Reveal";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./promo-detail.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getActivePromos().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const promo = getPromoBySlug(slug);
  if (!promo) return {};
  return {
    title: promo.title,
    description: promo.description,
  };
}

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params;
  const promo = getPromoBySlug(slug);
  if (!promo) notFound();

  const whatsappUrl = buildWhatsAppUrl({
    source: "promo_detail",
    source_cta: promo.cta_whatsapp_context ?? "promo_detail_cta",
    model: promo.model_slug ?? undefined,
  });

  return (
    <section className={styles.section}>
      <Container size="narrow">
        <Reveal variant="fade-up">
          <div className={styles.content}>
            <div className={styles.meta}>
              {promo.badge && (
                <span className={styles.badge}>{promo.badge}</span>
              )}
              {promo.valid_until && (
                <span className={styles.validity}>
                  Berlaku hingga{" "}
                  {new Date(promo.valid_until).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            <GoldLine width="short" className={styles.gold} />
            <h1 className={styles.title}>{promo.title}</h1>
            <p className={styles.description}>{promo.description}</p>

            <Button
              as="a"
              href={whatsappUrl}
              variant="primary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {promo.cta_label} →
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
