/**
 * JAECOO Palembang — Promo Detail Page (Step 8.10)
 * Data: Supabase promos table via getPromoBySlug
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPromoBySlug, getAllPromoSlugs } from '@/lib/data/promos';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { GoldLine } from '@/components/ui/GoldLine';
import { Reveal } from '@/components/motion/Reveal';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import styles from './promo-detail.module.css';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getAllPromoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const promo = await getPromoBySlug(slug);
  if (!promo) return {};
  return {
    title: promo.title,
    description: promo.short_description ?? promo.description ?? '',
    alternates: { canonical: `/promo/${slug}` },
  };
}

export default async function PromoDetailPage({ params }: Props) {
  const { slug } = await params;
  const promo = await getPromoBySlug(slug);
  if (!promo) notFound();

  const whatsappUrl =
    promo.cta_action ??
    buildWhatsAppUrl({
      source: 'promo_detail',
      source_cta: promo.title,
      model: promo.models?.slug ?? undefined,
    });

  return (
    <section className={styles.section}>
      <Container size="narrow">
        <Reveal variant="fade-up">
          <div className={styles.content}>
            <div className={styles.meta}>
              {promo.models && (
                <span className={styles.badge}>{promo.models.name}</span>
              )}
              {promo.end_date && (
                <span className={styles.validity}>
                  Berlaku hingga{' '}
                  {new Date(promo.end_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            <GoldLine width="short" className={styles.gold} />
            <h1 className={styles.title}>{promo.title}</h1>
            <p className={styles.description}>
              {promo.description ?? promo.short_description}
            </p>

            <Button
              as="a"
              href={whatsappUrl}
              variant="primary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {promo.cta_label ?? 'Klaim Promo'} →
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
