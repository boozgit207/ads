import { Metadata } from 'next';
import ProductsPageContent, { buildProductsMetadata } from './ProductsPageContent';
import { absoluteUrl, defaultOgImage } from '@/lib/seo';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const dynamic = await buildProductsMetadata();
  return {
    ...dynamic,
    keywords:
      'produits, réactifs laboratoire, tests diagnostiques, COVID-19, HIV, malaria, biochimie, Fortress Diagnostics, Bioline, Cameroun, Afrique, Elisa, test rapide',
    openGraph: {
      title: 'Catalogue réactifs laboratoire | ADS - Cameroun',
      description:
        'Réactifs de laboratoire au Cameroun : Fortress Diagnostics, Bioline, Hightop. Latex, ELISA, biochimie.',
      type: 'website',
      url: absoluteUrl('/products'),
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Catalogue de produits ADS' }],
      ...(typeof dynamic.openGraph === 'object' ? dynamic.openGraph : {}),
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ lab?: string; category?: string }>;
}) {
  const params = await searchParams;
  return (
    <ProductsPageContent legacyLab={params.lab} legacyCategory={params.category} />
  );
}
