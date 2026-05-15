import { Suspense } from 'react';
import { Metadata } from 'next';
import { getProductBySlug, getSimilarProducts } from '../../actions/catalog';
import { getProductReviews } from '../../actions/reviews';
import ProductDetailClient from './ProductDetailClient';
import ProductStructuredData from '../../components/ProductStructuredData';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { notFound } from 'next/navigation';
import { absoluteUrl, productPath } from '@/lib/seo';

// Générer les métadonnées dynamiques pour chaque produit
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const productResult = await getProductBySlug(slug);
  
  if (!productResult.success || !productResult.product) {
    return {
      title: 'Produit non trouvé | ADS',
      description: 'Le produit que vous recherchez n\'existe pas ou a été supprimé.',
    };
  }
  
  const product = productResult.product;
  const canonicalPath = productPath(product);
  const title = product.meta_title || `${product.nom} | ADS - Angela Diagnostics et Services`;
  const description =
    product.meta_description?.substring(0, 160) ||
    product.description?.substring(0, 160) ||
    `Achetez ${product.nom} chez ADS. ${product.categorie?.nom || 'Réactif de laboratoire'} de qualité professionnelle.`;
  const keywords = [
    product.nom,
    product.nom_en,
    product.categorie?.nom,
    product.categorie?.nom_en,
    product.laboratoire?.nom,
    'réactif laboratoire',
    'test diagnostic',
    'Cameroun',
    'Afrique'
  ].filter(Boolean).join(', ');
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: absoluteUrl(canonicalPath),
      images: product.image_principale_url ? [
        {
          url: product.image_principale_url,
          width: 800,
          height: 600,
          alt: product.nom,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image_principale_url ? [product.image_principale_url] : undefined,
    },
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
  };
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await params (Next.js 16 requirement)
  const { slug } = await params;
  
  // Récupérer le produit
  const productResult = await getProductBySlug(slug);
  
  if (!productResult.success || !productResult.product) {
    notFound();
  }
  
  const product = productResult.product;
  
  // Récupérer les avis et produits similaires en parallèle
  const [reviewsResult, similarResult] = await Promise.all([
    getProductReviews(product.id),
    getSimilarProducts(product.id, product.categorie_id, 4)
  ]);

  const reviews = reviewsResult.success ? reviewsResult.reviews || [] : [];
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + r.note, 0) / reviewCount
      : undefined;
  const productForSeo = {
    ...product,
    reviewCount,
    averageRating,
  };

  return (
    <>
      <ProductStructuredData product={productForSeo} />
      <Suspense fallback={<ProductLoading />}>
        <ProductDetailClient 
          product={product}
          reviews={reviews}
          similarProducts={similarResult.success ? similarResult.products || [] : []}
        />
      </Suspense>
    </>
  );
}

function ProductLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <Footer />
    </div>
  );
}
