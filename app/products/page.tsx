import { Suspense } from 'react';
import { Metadata } from 'next';
import { getProducts, getLaboratories, getCategories } from '../actions/catalog';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Nos Produits | ADS - Réactifs de Laboratoire & Tests Diagnostiques',
  description: 'Découvrez notre catalogue complet de réactifs de laboratoire, tests diagnostiques rapides, tests COVID-19, HIV, Malaria, biochimie et plus. Livraison au Cameroun et en Afrique.',
  keywords: 'produits, réactifs laboratoire, tests diagnostiques, COVID-19, HIV, malaria, biochimie, Fortress Diagnostics, Bioline, Cameroun, Afrique, Elisa, test rapide, chlamydia',
  openGraph: {
    title: 'Nos Produits | ADS - Réactifs de Laboratoire',
    description: 'Catalogue complet de réactifs de laboratoire et tests diagnostiques - Livraison au Cameroun',
    type: 'website',
    url: 'https://ads-diagnostics.com/products',
    images: [
      {
        url: '/images/og-products.jpg',
        width: 1200,
        height: 630,
        alt: 'Catalogue de produits ADS',
      },
    ],
  },
  alternates: {
    canonical: 'https://ads-diagnostics.com/products',
  },
};

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ lab?: string; category?: string }> 
}) {
  // Await searchParams (Next.js 16 requirement)
  const params = await searchParams;
  
  // Récupérer les données depuis Supabase en parallèle
  const [productsResult, labsResult, catsResult] = await Promise.all([
    getProducts(),
    getLaboratories(),
    getCategories()
  ]);

  const products = productsResult.success ? productsResult.products || [] : [];
  const laboratories = labsResult.success ? labsResult.laboratories || [] : [];
  const categories = catsResult.success ? catsResult.categories || [] : [];

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient 
        products={products}
        laboratories={laboratories}
        categories={categories}
        initialLab={params.lab}
        initialCategory={params.category}
      />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}
