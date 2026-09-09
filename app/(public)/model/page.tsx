import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/queries";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./model-index.module.css";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "Model JAECOO Palembang — J5 EV, J7 SHS, J8 Ardis SHS",
  description: "Jelajahi lineup JAECOO di Palembang: J5 EV, J7 SHS, dan J8 Ardis SHS.",
  alternates: { canonical: "/model" },
};

export default async function ModelIndexPage() {
  const models = await getModels();
  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="JAECOO RANGE"
        heading={<>Find your<br /><strong>JAECOO.</strong></>}
        subheading="Three distinct SUV experiences. One uncompromising philosophy."
        size="medium"
        accent="default"
      />
      <section className={styles.section}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>THE RANGE</p>
          <h2>Choose your<br /><em>next chapter.</em></h2>
        </div>
        <div className={styles.list}>
          {models.map((model, i) => (
            <article className={styles.model} key={model.slug}>
              <div className={styles.index}>0{i + 1}</div>
              <div className={styles.visual}>
                {model.hero_media.image.desktop?.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={model.hero_media.image.desktop} alt={model.name} loading="lazy" />
                ) : null}
                <span>{model.short_name}</span>
              </div>
              <div className={styles.copy}>
                <p className={styles.tagline}>{model.tagline}</p>
                <h3>{model.name}</h3>
                <p className={styles.description}>{model.description}</p>
                <div className={styles.meta}>
                  <PriceDisplay
                    price_status={model.default_variant.price_status}
                    price_idr={model.default_variant.price_idr}
                    price_display={model.default_variant.price_display}
                    price_display_override={model.default_variant.price_display_override}
                    price_region={model.default_variant.price_region}
                  />
                  <div className={styles.actions}>
                    <Button as="link" href={`/model/${model.slug}`} variant="primary" size="sm">Explore</Button>
                    <Button as="link" href={`/model/${model.slug}/specifications`} variant="ghost" size="sm">Specs →</Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.bottomCta}>
        <p className={styles.eyebrow}>MAKE IT YOURS</p>
        <h2>Which JAECOO<br /><em>is yours?</em></h2>
        <a href={buildWhatsAppUrl({ source: "model_index", source_cta: "model_index_cta" })}>Talk to Alvan →</a>
      </section>
    </>
  );
}
