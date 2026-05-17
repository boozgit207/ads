import { Metadata } from 'next';
import ProductsPageContent, { buildProductsMetadata } from '../../ProductsPageContent';
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ labSlug: string; catSlug: string }>;
}): Promise<Metadata> {
  const { labSlug, catSlug } = await params;
  return buildProductsMetadata(labSlug, catSlug);
}

export default async function ProductsByLabAndCategoryPage({
  params,
}: {
  params: Promise<{ labSlug: string; catSlug: string }>;
}) {
  const { labSlug, catSlug } = await params;
  return <ProductsPageContent labSlug={labSlug} categorySlug={catSlug} />;
}
