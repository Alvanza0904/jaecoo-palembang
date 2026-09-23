/**
 * Full-width editorial bridge from J7 SIVP to the existing J7 SHS page.
 * Uses J7 SHS media already stored for that model. No new route.
 */
import { getModelBySlug } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/Button";
import styles from "./J7ShsExploreCta.module.css";

export async function J7ShsExploreCta() {
  const shs = await getModelBySlug("jaecoo-j7-shs");
  const image =
    shs?.image_slots?.profile ??
    shs?.image_slots?.exterior ??
    shs?.hero_media?.image ??
    shs?.image_slots?.final_cta;
  const src = image?.desktop ?? image?.tablet ?? image?.mobile;

  return (
    <section className={styles.band} data-theme="dark" aria-label="Jelajahi JAECOO J7 SHS">
      <div className={styles.media} aria-hidden="true">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className={styles.image} />
        ) : (
          <div className={styles.fallback} />
        )}
        <div className={styles.scrim} />
      </div>

      <div className={styles.copy}>
        <p className={styles.kicker}>JAECOO</p>
        <h2 className={styles.title}>JAECOO J7 SHS</h2>
        <p className={styles.line}>Explore J7 SHS</p>
        <Button as="link" href="/model/jaecoo-j7-shs" variant="primary" size="lg">
          Explore J7 SHS
        </Button>
      </div>
    </section>
  );
}
