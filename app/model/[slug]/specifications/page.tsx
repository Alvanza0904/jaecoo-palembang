/**
 * JAECOO Palembang — Model Specifications Page
 * Route: /model/[slug]/specifications
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/data/models";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./specifications.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getModelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) return {};
  return {
    title: buildPageTitle(`${model.name} — Spesifikasi`),
    description: `Spesifikasi lengkap ${model.name}. ${model.default_variant.price_display} ${model.default_variant.price_region}.`,
  };
}

export default async function SpecificationsPage({ params }: Props) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  return (
    <section className={styles.section}>
      <Container size="content">
        <Reveal>
          <SectionHeading
            eyebrow="Specifications"
            heading={`${model.short_name} — Spesifikasi Lengkap`}
          />
        </Reveal>

        <div className={styles.categories}>
          <Stagger delay={150} staggerMs={100}>
            {model.specifications.map((cat) => (
              <div key={cat.label} className={styles.category}>
                <h3 className={styles.categoryLabel}>{cat.label}</h3>
                <table className={styles.table} aria-label={`Spesifikasi ${cat.label}`}>
                  <tbody>
                    {cat.specs.map((spec) => (
                      <tr key={spec.label} className={styles.row}>
                        <th className={styles.rowLabel} scope="row">{spec.label}</th>
                        <td className={styles.rowValue}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </Stagger>
        </div>

        <Reveal delay={300}>
          <p className={styles.disclaimer}>
            * Spesifikasi dapat berubah sewaktu-waktu. Untuk informasi terkini, hubungi Sales JAECOO Palembang.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
