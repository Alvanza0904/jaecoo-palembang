import type { Metadata } from "next";
import Link from "next/link";
import { getActivePromos } from "@/lib/data/promos";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./promo.module.css";

export const metadata: Metadata = {
  title: "Promo JAECOO Palembang — Penawaran Terkini",
  description: "Penawaran dan promo JAECOO di Palembang untuk J5 EV, J7 SHS, dan J8 Ardis SHS.",
  alternates: { canonical: "/promo" },
};

export default function PromoPage() {
  const promos = getActivePromos();
  const whatsappUrl = buildWhatsAppUrl({ source: "promo_page", source_cta: "promo_cta" });
  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="CURRENT OFFERS"
        heading={<>Offers worth<br /><strong>exploring.</strong></>}
        subheading="Temukan penawaran terbaru JAECOO Palembang."
        size="medium"
        accent="warm"
      />
      <section className={styles.section}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>CURRENT OFFERS</p>
          <h2>Make your move.</h2>
        </div>
        {promos.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyKicker}>NO ACTIVE PROMO</p>
            <h3>Belum ada penawaran aktif.</h3>
            <p>Hubungi Alvan untuk mendapatkan informasi harga dan program terbaru.</p>
            <Button as="a" href={whatsappUrl} variant="primary" size="lg" target="_blank" rel="noopener noreferrer">Talk to Alvan →</Button>
          </div>
        ) : (
          <div className={styles.list}>
            {promos.map((promo) => (
              <article className={styles.card} key={promo.id}>
                <div className={styles.media}>
                  {promo.image?.desktop?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={promo.image.desktop} alt={promo.image.alt ?? promo.title} />
                  ) : <span>{promo.model_slug?.replace("jaecoo-","").toUpperCase() ?? "JAECOO"}</span>}
                </div>
                <div className={styles.copy}>
                  <p className={styles.badge}>{promo.badge ?? "JAECOO OFFER"}</p>
                  <h3>{promo.title}</h3>
                  <p>{promo.description}</p>
                  {promo.valid_until && <small>Berlaku hingga {new Date(promo.valid_until).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}</small>}
                  <div className={styles.actions}>
                    <Link href={`/promo/${promo.slug}`}>View offer ↗</Link>
                    <Button as="a" href={buildWhatsAppUrl({source:"promo_page",source_cta:promo.cta_whatsapp_context,model:promo.model_slug ?? undefined})} variant="primary" size="sm" target="_blank" rel="noopener noreferrer">{promo.cta_label}</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
