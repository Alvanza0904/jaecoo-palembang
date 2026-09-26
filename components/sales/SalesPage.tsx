import { Button } from "@/components/ui/Button";
import type { ResponsiveImage } from "@/lib/types/media";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
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
          Foto diatur dari Admin → Sales
        </div>
      )}
    </div>
  );
}

export function SalesPageView({ images }: { images: SalesImages }) {
  const whatsapp = buildWhatsAppUrl({ source: "sales_page", source_cta: "sales_page_cta" });

  return (
    <article>
      <section className={styles.hero}>
        <Photo image={images.hero} alt="Alvan, Sales Consultant JAECOO Palembang" shade="hero" className={styles.heroMedia} />
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Sales Consultant</p>
          <h1>Hai, saya Alvan.</h1>
          <p className={styles.role}>Sales Consultant JAECOO Palembang</p>
          <p className={styles.lead}>
            Saya siap membantu Pak, Bu, dan keluarga mengenal JAECOO lebih dekat dan menemukan pilihan yang sesuai dengan kebutuhan.
          </p>
        </div>
      </section>

      <section className={styles.about}>
        <Photo image={images.about} alt="Alvan di JAECOO Palembang" shade="edge" className={styles.aboutPhoto} />
        <div>
          <p className={styles.kickerDark}>Tentang saya</p>
          <h2>Kenal lebih dekat dengan saya.</h2>
          <p>
            Saya Alvan, Sales Consultant di JAECOO Palembang. Sehari-hari saya menemani orang yang baru ingin mengenal JAECOO, maupun yang sudah punya gambaran mobil yang dicari.
          </p>
          <p>
            Saya lebih nyaman menjelaskan pelan-pelan. Kebutuhan sehari-hari, siapa yang akan memakai mobilnya, dan apa yang penting buat keluarga. Dari situ baru kita lihat model yang masuk akal.
          </p>
        </div>
      </section>

      <section className={styles.help}>
        <div className={styles.helpIntro}>
          <p className={styles.kickerDark}>Cara saya membantu</p>
          <h2>Bukan sekadar memilih mobil.</h2>
        </div>
        <ol>
          {HELP.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.statement}>
        <Photo image={images.statement} alt="Alvan mendampingi customer JAECOO" shade="bottom" className={styles.statementMedia} />
        <div className={styles.statementCopy}>
          <h2>Setiap perjalanan dimulai dari pilihan yang tepat.</h2>
          <p>
            Saya ingin setiap orang yang datang pulang dengan keputusan yang tenang. Bukan karena didesak, tapi karena sudah paham pilihannya.
          </p>
        </div>
      </section>

      <section className={styles.order}>
        <Photo image={images.placeOrder} alt="Alvan mendampingi proses pemesanan kendaraan" shade="edge" className={styles.orderPhoto} />
        <div className={styles.orderCaption}>
          <p className={styles.kickerDark}>Place Order</p>
          <p>Mendampingi setiap proses, sampai kendaraan siap menjadi bagian dari perjalanan Anda.</p>
        </div>
      </section>

      <section className={styles.whatsapp}>
        <p className={styles.kickerDark}>Konsultasi</p>
        <h2>Punya pertanyaan tentang JAECOO?</h2>
        <p>
          Saya siap membantu, baik untuk sekadar mengenal produk maupun berdiskusi mengenai pilihan kendaraan yang sesuai.
        </p>
        <Button as="a" href={whatsapp} variant="darkPrimary" size="lg" target="_blank" rel="noopener noreferrer">
          Hubungi Alvan
        </Button>
      </section>

      <section className={styles.finale}>
        <Photo image={images.finalCta} alt="JAECOO" shade="bottom" className={styles.finaleMedia} />
        <div className={styles.finaleCopy}>
          <h2>Temukan JAECOO Anda.</h2>
          <p>Kenali lebih dekat berbagai model JAECOO dan temukan kendaraan yang sesuai dengan kebutuhan Anda.</p>
          <Button as="link" href="/model" variant="primary" size="lg">
            Jelajahi Model JAECOO
          </Button>
        </div>
      </section>
    </article>
  );
}
