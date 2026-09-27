/**
 * JAECOO Palembang — Promo Detail Page
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPromoBySlug, getAllPromoSlugs } from '@/lib/data/promos';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/motion/Reveal';
import { AnimatedNewsBody } from '@/components/motion/AnimatedNewsBody';
import { buildWhatsAppUrl } from '@/lib/utils/whatsapp';
import { formatDate } from '@/lib/utils/format';
import styles from './promo-detail.module.css';

export const revalidate = 60;

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
    title: `${promo.title} — Promo JAECOO Palembang`,
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
    <div className={styles.page}>
      <Container size="narrow">
        <Reveal variant="fade" threshold={0}>
          <Link href="/promo" className={styles.back}>← Semua Promo</Link>
        </Reveal>

        {promo.image_url && (
          <Reveal variant="scale" delay={60}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={promo.image_url} alt={promo.title} className={styles.hero} />
          </Reveal>
        )}

        <header className={styles.header}>
          <Reveal variant="fade-up" delay={80}>
            <div className={styles.meta}>
              {promo.models && <span className={styles.badge}>{promo.models.name}</span>}
              <span className={styles.badge}>{promo.promo_type}</span>
              {promo.end_date && (
                <span className={styles.validity}>
                  Berlaku hingga {formatDate(promo.end_date)}
                </span>
              )}
            </div>
          </Reveal>

          <Reveal variant="mask" delay={140}>
            <h1 className={styles.title}>{promo.title}</h1>
          </Reveal>

          {promo.short_description && (
            <Reveal variant="fade-up" delay={200}>
              <p className={styles.description}>{promo.short_description}</p>
            </Reveal>
          )}
        </header>

        {promo.description && (
          <>
            <Reveal variant="fade">
              <hr className={styles.separator} />
            </Reveal>
            <AnimatedNewsBody
              html={promo.description}
              className={styles.body}
            />
          </>
        )}

        <Reveal variant="fade-up" delay={0}>
          <div className={styles.cta}>
            <Button
              as="a"
              href={whatsappUrl}
              variant="darkPrimary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {promo.cta_label ?? 'Tanya Promo ke Alvan →'}
            </Button>
            <Button as="link" href="/promo" variant="outline" size="lg">
              Lihat Promo Lain
            </Button>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
