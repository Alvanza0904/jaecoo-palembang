/**
 * JAECOO Palembang — Sales Page (Alvan)
 * Route: /sales-jaecoo-palembang
 * Personal Automotive Consultant experience.
 */

export const revalidate = 0;

import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { priceStatusAllowsCalculator } from "@/lib/types/model";
import { buildWhatsAppUrl, SALES_NAME, WHATSAPP_NUMBER } from "@/lib/utils/whatsapp";
import { getModels } from "@/lib/supabase/queries";
import styles from "./sales.module.css";

export const metadata: Metadata = {
  title: "Sales JAECOO Palembang — Alvan",
  description:
    "Hubungi Sales resmi JAECOO Palembang, Alvan. Konsultasi gratis, test drive, dan simulasi kredit tersedia via WhatsApp.",
  alternates: { canonical: "/sales-jaecoo-palembang" },
};

const displayNumber = WHATSAPP_NUMBER.replace("62", "0").replace(
  /(\d{4})(\d{4})(\d{4})/,
  "$1-$2-$3"
);

const SERVICES = [
  { label: "Konsultasi",        description: "Tanya model, harga, dan spesifikasi — gratis, tanpa paksaan." },
  { label: "Test Drive",        description: "Jadwalkan test drive untuk merasakan langsung performa JAECOO." },
  { label: "Simulasi Kredit",   description: "Hitung cicilan sesuai kemampuan Anda bersama Alvan." },
  { label: "Promo Eksklusif",   description: "Dapatkan penawaran terbaik yang tidak ada di tempat lain." },
];

export default async function SalesPage() {
  const whatsappUrl = buildWhatsAppUrl({ source: "sales_page", source_cta: "sales_page_cta" });
  const models = await getModels();

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="Sales Resmi JAECOO Palembang"
        heading="Your Personal\nAutomotive\nConsultant."
        subheading="Satu kontak. Semua solusi."
        cta={
          <Button as="a" href={whatsappUrl} variant="primary" size="lg" target="_blank" rel="noopener noreferrer">
            Chat via WhatsApp →
          </Button>
        }
        size="large"
      />

      {/* Profile */}
      <section className={styles.profileSection}>
        <div className={styles.profileGrid}>
          <Reveal variant="fade-up">
            <div className={styles.profileInfo}>
              <hr className={styles.gold} />
              <h1 className={styles.profileName}>{SALES_NAME}</h1>
              <p className={styles.profileRole}>Sales Resmi JAECOO Palembang</p>
              <p className={styles.profileNumber}>{displayNumber}</p>
              <p className={styles.profileBio}>
                Siap membantu Anda menemukan SUV yang paling sesuai — dari konsultasi awal,
                test drive, hingga proses pembelian selesai.
              </p>
              <Button as="a" href={whatsappUrl} variant="darkPrimary" size="lg" target="_blank" rel="noopener noreferrer">
                Chat dengan {SALES_NAME} →
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesInner}>
          <span className={styles.servicesEyebrow}>Yang bisa Alvan bantu</span>
          <h2 className={styles.servicesHeading}>Layanan Konsultasi</h2>
          <div className={styles.servicesList}>
            {SERVICES.map((item, i) => (
              <Reveal key={item.label} variant="fade-up" delay={i * 80}>
                <div className={styles.serviceRow}>
                  <span className={styles.serviceIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className={styles.serviceLabel}>{item.label}</h3>
                    <p className={styles.serviceDesc}>{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className={styles.calcSection}>
        <Container size="content">
          <Reveal variant="fade-up" threshold={0}>
            <SectionHeading
              eyebrow="Simulasi Kredit"
              heading="Hitung Cicilan Anda"
              subheading="Estimasi angsuran dengan bunga flat 10%/tahun. Hubungi Alvan untuk simulasi resmi."
            />
          </Reveal>
          <div className={styles.calcGrid}>
            {models
              .filter((m) => priceStatusAllowsCalculator(m.default_variant.price_status, m.default_variant.price_idr))
              .map((model, i) => (
                <Reveal key={model.slug} variant="fade-up" delay={i * 80} threshold={0}>
                  <FinanceCalculator price={model.default_variant.price_idr!} modelName={model.name} />
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
              <h2 className={styles.ctaHeading}>Mulai perjalanan Anda bersama JAECOO.</h2>
              <Button as="a" href={whatsappUrl} variant="primary" size="lg" target="_blank" rel="noopener noreferrer">
                Chat Sekarang →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
