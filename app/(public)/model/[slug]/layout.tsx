/**
 * JAECOO Palembang — Model Layout
 *
 * Shared layout for /model/[slug]/* routes.
 * Includes sticky mini navigation: OVERVIEW | TECHNOLOGY | SPECIFICATIONS
 */

import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/data/models";
import { ModelNavigation } from "@/components/model/ModelNavigation";

interface ModelLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getModelSlugs().map((slug) => ({ slug }));
}

export default async function ModelLayout({ children, params }: ModelLayoutProps) {
  const { slug } = await params;
  const model = getModelBySlug(slug);

  if (!model) notFound();

  return (
    <>
      {/* Sticky mini navigation */}
      <ModelNavigation slug={slug} modelName={model.short_name} />
      {children}
    </>
  );
}
