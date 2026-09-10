/**
 * JAECOO Palembang — Model Layout
 *
 * Shared layout for /model/[slug]/* routes.
 * Includes sticky mini navigation: OVERVIEW | TECHNOLOGY | SPECIFICATIONS
 *
 * STEP 7C: Added SectionObserver for section entrance transitions.
 */

import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { ModelNavigation } from "@/components/model/ModelNavigation";
import { SectionObserver } from "@/components/motion/SectionObserver";

interface ModelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getModelSlugs().map((slug) => ({ slug }));
}

export default async function ModelLayout({ children, params }: ModelLayoutProps) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) notFound();

  return (
    <>
      {/* Sticky mini navigation */}
      <ModelNavigation slug={slug} modelName={model.short_name} />
      {/* Section entrance transition observer (client, no render output) */}
      <SectionObserver />
      {children}
    </>
  );
}
