import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/queries";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery JAECOO Palembang — Foto & Video",
  description: "Eksplorasi desain, interior, eksterior dan detail JAECOO di Palembang.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const models = await getModels();
  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="VISUAL GALLERY"
        heading={<>Every angle.<br /><strong>Every detail.</strong></>}
        subheading="Eksplorasi visual JAECOO dari setiap sudut."
        size="medium"
        accent="cool"
      />
      <section className={styles.section}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>THE COLLECTION</p>
          <h2>See it.<br /><em>Feel it.</em></h2>
        </div>
        <div className={styles.grid}>
          {models.map((model, i) => (
            <article className={`${styles.card} ${i === 0 ? styles.featured : ""}`} key={model.slug}>
              <div className={styles.media}>
                {model.hero_media.image.desktop?.startsWith("http") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={model.hero_media.image.desktop} alt={model.name} loading="lazy" />
                )}
                <span>{model.short_name}</span>
              </div>
              <div className={styles.copy}>
                <p>{String(i + 1).padStart(2,"0")} · {model.short_name}</p>
                <h3>{model.name}</h3>
                <a href={`/model/${model.slug}`}>Explore model ↗</a>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.bottom}>
          <p className={styles.eyebrow}>WANT TO SEE IT IN PERSON?</p>
          <h3>Book a private<br />JAECOO experience.</h3>
          <a href={buildWhatsAppUrl({source:"gallery_page",source_cta:"gallery_test_drive"})}>Talk to Alvan →</a>
        </div>
      </section>
    </>
  );
}
