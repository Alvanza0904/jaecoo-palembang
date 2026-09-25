/**
 * JAECOO Palembang — Promo Listing Page
 * Data: Supabase promos table
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getActivePromos } from '@/lib/data/promos';
import { Button } from '@/components/ui/Button';
import { HeroPlaceholder } from '@/components/hero/HeroPlaceholder';
import { TransparentHeader } from '@/components/layout/TransparentHeader';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatDate } from '@/lib/utils/format';
import styles from './promo.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Promo JAECOO Palembang — Penawaran Terkini',
  description: 'Cashback, DP murah, bunga 0%, dan penawaran eksklusif untuk JAECOO J5, J7, dan J8 di Palembang.',
  alternates: { canonical: '/promo' },
};

export default async function PromoPage() {
  const promos = await getActivePromos();
  const wa = buildWhatsAppUrl({ source: 'promo_page', source_cta: 'promo_cta' });

  return (
    <>
      <TransparentHeader />
      <HeroPlaceholder
        tagline="PENAWARAN EKSKLUSIF"
        heading="Offers worth exploring."
        subheading="Promo terbaru JAECOO Palembang — cashback, DP ringan, bunga spesial."
        size="medium"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <span className={styles.eyebrow}>Penawaran Terkini</span>
            <h1 className={styles.heading}>Promo Terkini</h1>
          </div>

          {!promos.length ? (
            <div className={styles.empty}>
              <h2 className={styles.emptyHeading}>Promo akan segera hadir</h2>
              <p className={styles.emptyText}>Hubungi Alvan untuk penawaran eksklusif yang belum dipublikasikan.</p>
              <Button as="a" href={wa} variant="darkPrimary" size="md" target="_blank" rel="noopener noreferrer">
                Tanya Promo ke Alvan →
              </Button>
            </div>
          ) : (
            <div className={styles.list}>
              {promos.map((promo) => (
                <Link key={promo.id} href={`/promo/${promo.slug}`} className={styles.card}>
                  <div className={styles.cardMedia}>
                    {promo.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={promo.image_url} alt={promo.title} className={styles.cardImg} loading="lazy" />
                    ) : (
                      <div className={styles.cardMediaFallback} aria-hidden="true">
                        {promo.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.cardCopy}>
                    <span className={styles.cardBadge}>
                      {promo.models?.name ?? promo.promo_type}
                    </span>
                    <h2 className={styles.cardTitle}>{promo.title}</h2>
                    <p className={styles.cardDesc}>{promo.short_description}</p>
                    {promo.end_date && (
                      <p className={styles.cardValidity}>
                        Berlaku hingga {formatDate(promo.end_date)}
                      </p>
                    )}
                    <span className={styles.cardCta}>Lihat Penawaran →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
