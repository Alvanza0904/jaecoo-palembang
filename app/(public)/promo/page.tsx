/**
 * JAECOO Palembang — Public Promo Listing Page (Step 8.10)
 * Data: Supabase promos table (status = 'published')
 */

import type { Metadata } from 'next';
import { getActivePromos } from '@/lib/data/promos';
import { Button } from '@/components/ui/Button';
import { HeroPlaceholder } from '@/components/hero/HeroPlaceholder';
import { TransparentHeader } from '@/components/layout/TransparentHeader';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import Link from 'next/link';
import styles from './promo.module.css';

export const metadata: Metadata = {
  title: 'Promo JAECOO Palembang — Penawaran Terkini',
  description:
    'Cashback, DP murah, bunga 0%, dan penawaran eksklusif untuk JAECOO J5, J7, dan J8 di Palembang.',
  alternates: { canonical: '/promo' },
};

export default async function PromoPage() {
  const promos = await getActivePromos();
  const whatsappUrl = buildWhatsAppUrl({ source: 'promo_page', source_cta: 'promo_cta' });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="CURRENT OFFERS"
        heading={
          <>
            Offers worth
            <br />
            <strong>exploring.</strong>
          </>
        }
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
        ) : (
          <div className={styles.list}>
            {promos.map((promo) => (
              <article className={styles.card} key={promo.id}>
                <div className={styles.media}>
                  {promo.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={promo.image_url} alt={promo.title} />
                  ) : (
                    <span>
                      {promo.models?.name?.replace('JAECOO ', '').toUpperCase() ?? 'JAECOO'}
                    </span>
                  )}
                </div>

                <div className={styles.copy}>
                  <p className={styles.badge}>
                    {promo.models ? promo.models.name : 'JAECOO OFFER'}
                  </p>
                  <h3>{promo.title}</h3>
                  <p>{promo.short_description}</p>

                  {promo.end_date && (
                    <small>
                      Berlaku hingga{' '}
                      {new Date(promo.end_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </small>
                  )}

                  <div className={styles.actions}>
                    <Link href={`/promo/${promo.slug}`}>View offer ↗</Link>
                    <Button
                      as="a"
                      href={
                        promo.cta_action ??
                        buildWhatsAppUrl({ source: 'promo_page', source_cta: promo.title })
                      }
                      variant="primary"
                      size="sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {promo.cta_label ?? 'Klaim Promo'}
                    </Button>
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
