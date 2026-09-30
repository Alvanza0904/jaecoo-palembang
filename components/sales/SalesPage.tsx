"use client";

import { Button } from "@/components/ui/Button";
import type { ResponsiveImage } from "@/lib/types/media";
import type { SalesDelivery } from "@/lib/sales/deliveries";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import type { CalculatorModel } from "@/lib/finance/catalog";
import { Reveal } from "@/components/motion/Reveal";
import { DeliverySection } from "./DeliverySection";
import styles from "./SalesPage.module.css";

export interface SalesImages {
  hero?: ResponsiveImage;
  about?: ResponsiveImage;
  statement?: ResponsiveImage;
  placeOrder?: ResponsiveImage;
  finalCta?: ResponsiveImage;
}

const HELP = [
  {
    title: "Memahami Kebutuhan",
    body: "Mendengarkan kebutuhan, preferensi, dan penggunaan kendaraan sebelum memberikan pilihan.",
  },
  {
    title: "Menjelaskan dengan Sederhana",
    body: "Membantu menjelaskan fitur, teknologi, dan karakter kendaraan dengan bahasa yang mudah dipahami.",
  },
  {
    title: "Mendampingi Prosesnya",
    body: "Mendampingi customer mulai dari konsultasi hingga proses pembelian kendaraan.",
  },
];

function srcOf(image?: ResponsiveImage) {
  return image?.desktop || image?.tablet || image?.mobile || image?.small_mobile;
}

function Photo({
  image,
  alt,
  shade,
  className,
}: {
  image?: ResponsiveImage;
  alt: string;
  shade: "hero" | "bottom" | "edge" | "none";
  className?: string;
}) {
  const src = srcOf(image);
  const position = `${image?.focal_x ?? 50}% ${image?.focal_y ?? 22}%`;
  const shadeClass = {
    hero: styles.shadeHero,
    bottom: styles.shadeBottom,
    edge: styles.shadeEdge,
    none: styles.shadeNone,
  }[shade];
  return (
    <div className={[styles.frame, shadeClass, className].filter(Boolean).join(" ")}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} style={{ objectPosition: position }} />
      ) : (
        <div className={styles.empty} role="img" aria-label={alt}>
          <span>📷</span>
          <span>Upload foto di Admin → Sales</span>
        </div>
      )}
    </div>
  );
}

const HELP_VARIANTS = ["slide-left", "fade-up", "slide-right"] as const;

export function SalesPageView({
  images,
  deliveries = [],
  catalog = [],
}: {
  images: SalesImages;
  deliveries?: SalesDelivery[];
  catalog?: CalculatorModel[];
}) {
  const whatsapp = buildWhatsAppUrl({ source: "sales_page", source_cta: "sales_page_cta" });

  return (
    <article>
      <section className={styles.hero}>
        <Photo image={images.hero} alt="Alvan, Sales Consultant JAECOO Palembang" shade="hero" className={styles.heroMedia} />
        <div className={styles.heroCopy}>
          <Reveal variant="fade-up" delay={60} threshold={0}>
            <p className={styles.kicker}>Sales Consultant</p>
          </Reveal>
          <Reveal variant="mask" delay={120} threshold={0}>
            <h1>Hai, saya Alvan.</h1>
          </Reveal>
          <Reveal variant="fade" delay={180} threshold={0}>
            <p className={styles.role}>Sales Consultant JAECOO Palembang</p>
          </Reveal>
          <Reveal variant="fade-up" delay={240} threshold={0}>
            <p className={styles.lead}>
              Saya siap membantu Pak, Bu, dan keluarga mengenal JAECOO lebih dekat dan menemukan pilihan yang sesuai dengan kebutuhan.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={styles.about}>
        <Photo image={images.about} alt="Alvan di JAECOO Palembang" shade="edge" className={styles.aboutPhoto} />
        <div>
          <Reveal variant="fade-up" delay={0}>
            <p className={styles.kickerDark}>Tentang saya</p>
          </Reveal>
          <Reveal variant="slide-left" delay={80}>
            <h2>Kenal lebih dekat dengan saya.</h2>
          </Reveal>
          <Reveal variant="fade-up" delay={140}>
            <p>
              Saya Alvan, Sales Consultant di JAECOO Palembang. Sehari-hari saya menemani orang yang baru ingin mengenal JAECOO, maupun yang sudah punya gambaran mobil yang dicari.
            </p>
          </Reveal>
          <Reveal variant="fade" delay={200}>
            <p>
              Saya lebih nyaman menjelaskan pelan-pelan. Kebutuhan sehari-hari, siapa yang akan memakai mobilnya, dan apa yang penting buat keluarga. Dari situ baru kita lihat model yang masuk akal.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={styles.help}>
        <div className={styles.helpIntro}>
          <Reveal variant="fade-up" delay={0}>
            <p className={styles.kickerDark}>Cara saya membantu</p>
          </Reveal>
          <Reveal variant="mask" delay={80}>
            <h2>Bukan sekadar memilih mobil.</h2>
          </Reveal>
        </div>
        <ol>
          {HELP.map((item, index) => (
            <Reveal key={item.title} variant={HELP_VARIANTS[index % HELP_VARIANTS.length]} delay={index * 80}>
              <li>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className={styles.statement}>
        <Photo image={images.statement} alt="Alvan mendampingi customer JAECOO" shade="bottom" className={styles.statementMedia} />
        <div className={styles.statementCopy}>
          <Reveal variant="blur" delay={60}>
            <h2>Setiap perjalanan dimulai dari pilihan yang tepat.</h2>
          </Reveal>
          <Reveal variant="fade-up" delay={140}>
            <p>
              Saya ingin setiap orang yang datang pulang dengan keputusan yang tenang. Bukan karena didesak, tapi karena sudah paham pilihannya.
            </p>
          </Reveal>
        </div>
      </section>

      <section className={styles.order}>
        <Photo image={images.placeOrder} alt="Alvan mendampingi proses pemesanan kendaraan" shade="edge" className={styles.orderPhoto} />
        <div className={styles.orderCaption}>
          <Reveal variant="fade-up" delay={60}>
            <p className={styles.kickerDark}>Place Order</p>
          </Reveal>
          <Reveal variant="slide-right" delay={120}>
            <p>Mendampingi setiap proses, sampai kendaraan siap menjadi bagian dari perjalanan Anda.</p>
          </Reveal>
        </div>
      </section>

      <DeliverySection deliveries={deliveries} />

      {catalog.length > 0 && (
        <section className={styles.calculator} aria-labelledby="sales-calculator-title">
          <Reveal variant="fade-up" delay={0}>
            <p className={styles.kickerDark}>Simulasi Kredit</p>
          </Reveal>
          <Reveal variant="mask" delay={80}>
            <h2 id="sales-calculator-title">Hitung estimasi cicilan JAECOO.</h2>
          </Reveal>
          <Reveal variant="fade-up" delay={140}>
            <p className={styles.calculatorLead}>
              Pilih model dan tipe, geser DP, lalu tanyakan hasilnya langsung ke Alvan.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={180}>
            <FinanceCalculator catalog={catalog} source="sales_page" />
          </Reveal>
        </section>
      )}

      <section className={styles.whatsapp}>
        <Reveal variant="fade-up" delay={0}>
          <p className={styles.kickerDark}>Konsultasi</p>
        </Reveal>
        <Reveal variant="mask" delay={80}>
          <h2>Punya pertanyaan tentang JAECOO?</h2>
        </Reveal>
        <Reveal variant="fade-up" delay={160}>
          <p>
            Saya siap membantu, baik untuk sekadar mengenal produk maupun berdiskusi mengenai pilihan kendaraan yang sesuai.
          </p>
        </Reveal>
        <Reveal variant="scale" delay={220}>
          <Button as="a" href={whatsapp} variant="darkPrimary" size="lg" target="_blank" rel="noopener noreferrer">
            Hubungi Alvan
          </Button>
        </Reveal>
      </section>

      <section className={styles.finale}>
        <Photo image={images.finalCta} alt="JAECOO" shade="bottom" className={styles.finaleMedia} />
        <div className={styles.finaleCopy}>
          <Reveal variant="blur" delay={80}>
            <h2>Temukan JAECOO Anda.</h2>
          </Reveal>
          <Reveal variant="fade-up" delay={160}>
            <p>Kenali lebih dekat berbagai model JAECOO dan temukan kendaraan yang sesuai dengan kebutuhan Anda.</p>
          </Reveal>
          <Reveal variant="scale" delay={220}>
            <Button as="link" href="/model" variant="primary" size="lg">
              Jelajahi Model JAECOO
            </Button>
          </Reveal>
        </div>
      </section>
    </article>
  );
}
