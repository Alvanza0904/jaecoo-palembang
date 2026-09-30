/**
 * JAECOO Palembang — Model visual gallery
 * /gallery/[slug] — look at the car, not a second product page.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModels, getModelSlugs } from "@/lib/supabase/queries";
import { getSalesDeliveries } from "@/lib/supabase/media";
import { buildModelGallery } from "@/lib/gallery/build-model-gallery";
import { ModelGallery } from "@/components/gallery/ModelGallery";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getModelSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};
  return {
    title: { absolute: `Galeri ${model.short_name} | JAECOO Palembang` },
    description: `Lihat visual ${model.name} dari dekat — exterior, interior, detail, dan warna di gallery JAECOO Palembang.`,
    alternates: { canonical: `/gallery/${slug}` },
  };
}

export default async function ModelGalleryPage({ params }: Props) {
  const { slug } = await params;
  const [model, models, deliveries] = await Promise.all([
    getModelBySlug(slug),
    getModels(),
    getSalesDeliveries(),
  ]);
  if (!model) notFound();

  const gallery = buildModelGallery(model, deliveries);
  const selector = models.map((m) => ({
    slug: m.slug,
    short_name: m.short_name,
    href: `/gallery/${m.slug}`,
  }));
  const wa = buildWhatsAppUrl({
    source: "gallery_page",
    source_cta: "gallery_model_cta",
    model: model.short_name,
  });

  return (
    <>
      <TransparentHeader />
      <ModelGallery
        gallery={gallery}
        modelHref={`/model/${model.slug}`}
        whatsappUrl={wa}
        selector={selector}
      />
    </>
  );
}
