import { Metadata } from 'next';
import ProductsPageContent, { buildProductsMetadata } from '../ProductsPageContent';
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labSlug: string }>;
}): Promise<Metadata> {
  const { labSlug } = await params;
  return buildProductsMetadata(labSlug);
}

export default async function ProductsByLabPage({
  params,
}: {
  params: Promise<{ labSlug: string }>;
}) {
  const { labSlug } = await params;
  return <ProductsPageContent labSlug={labSlug} />;
}
