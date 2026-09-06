/**
 * JAECOO Palembang — Sales Page (Alvan)
 * Route: /sales-jaecoo-palembang
 * Phase 2: Premium editorial layout.
 */

export const revalidate = 0; // selalu fetch fresh dari Supabase

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GoldLine } from "@/components/ui/GoldLine";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { priceStatusAllowsCalculator } from "@/lib/types/model";
import { buildWhatsAppUrl, SALES_NAME, WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";
import { getModels } from "@/lib/supabase/queries";
import styles from "./sales.module.css";

export const metadata: Metadata = {
  title: "Sales JAECOO Palembang — Alvan",
  description:
    "Hubungi Sales resmi JAECOO Palembang, Alvan. Konsultasi gratis, test drive, dan simulasi kredit tersedia via WhatsApp.",
};

const displayNumber = WHATSAPP_NUMBER.replace("62", "0").replace(
  /(\d{4})(\d{4})(\d{4})/,
  "$1-$2-$3"
);

const SERVICES = [
  {
    label: "Konsultasi",
    description: "Tanya model, harga, dan spesifikasi — gratis, tanpa paksaan.",
  },
  {
    label: "Test Drive",
    description: "Jadwalkan test drive untuk merasakan langsung performa JAECOO.",
  },
  {
    label: "Simulasi Kredit",
    description: "Hitung cicilan sesuai kemampuan Anda bersama Alvan.",
  },
  {
    label: "Promo Eksklusif",
    description: "Dapatkan penawaran terbaik dan promo yang tidak ada di website.",
  },
];

export default function SalesPage() {
  const whatsappUrl = buildWhatsAppUrl({
    source: "sales_page",
    source_cta: "sales_page_cta",
  });

  const models = getModels();

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="Sales Resmi JAECOO Palembang"
        heading={<>Talk to<br />Alvan.</>}
        subheading="Satu kontak. Semua solusi."
        cta={
          <Button
            as="a"
            href={whatsappUrl}
            variant="primary"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat via WhatsApp →
          </Button>
        }
        size="large"
        accent="default"
      />

      {/* Profile section */}
      <section className={styles.profileSection}>
        <Container size="content">
          <div className={styles.profileGrid}>
            <Reveal variant="fade-up">
              <div className={styles.profileInfo}>
                <GoldLine width="short" className={styles.gold} />
                <h2 className={styles.profileName}>{SALES_NAME}</h2>
                <p className={styles.profileRole}>Sales Resmi JAECOO Palembang</p>
                <p className={styles.profileNumber}>{displayNumber}</p>
                <p className={styles.profileBio}>
                  Siap membantu Anda menemukan SUV yang paling sesuai — dari konsultasi
                  awal, test drive, hingga proses pembelian selesai.
                </p>
                <Button
                  as="a"
                  href={whatsappUrl}
                  variant="primary"
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Talk to Alvan →
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className={styles.servicesSection}>
        <Container size="content">
          <Reveal variant="fade">
            <h2 className={styles.servicesHeading}>Yang bisa Alvan bantu</h2>
          </Reveal>

          <div className={styles.servicesList}>
            {SERVICES.map((item, i) => (
              <Reveal key={item.label} variant="fade-up" delay={i * 80}>
                <div className={styles.serviceRow}>
                  <span className={styles.serviceIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className={styles.serviceLabel}>{item.label}</h3>
                    <p className={styles.serviceDesc}>{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Finance Calculator */}
      <section className={styles.calcSection}>
        <Container size="narrow">
          <Reveal variant="fade-up" threshold={0}>
            <SectionHeading
              eyebrow="Simulasi Kredit"
              heading="Hitung Cicilan Anda"
              subheading="Estimasi angsuran dengan bunga flat 10%/tahun. Hubungi Alvan untuk simulasi resmi."
            />
          </Reveal>

          <div className={styles.calcGrid}>
            {models
              .filter((model) =>
                priceStatusAllowsCalculator(
                  model.default_variant.price_status,
                  model.default_variant.price_idr
                )
              )
              .map((model, i) => (
                <Reveal key={model.slug} variant="fade-up" delay={i * 80} threshold={0}>
                  <FinanceCalculator
                    price={model.default_variant.price_idr!}
                    modelName={model.name}
                  />
                </Reveal>
              ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <Container size="narrow">
          <Reveal variant="fade-up">
            <div className={styles.ctaBlock}>
              <h2 className={styles.ctaHeading}>
                Mulai perjalanan Anda bersama JAECOO.
              </h2>
              <Button
                as="a"
                href={whatsappUrl}
                variant="primary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat Sekarang →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
