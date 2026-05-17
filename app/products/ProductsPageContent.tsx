import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProductsClient from './ProductsClient';
import { getCatalogSnapshot, CATALOG_REVALIDATE_SECONDS } from '@/lib/catalog-cache';
import { buildProductsMetadataFromSlugs } from '@/lib/catalog-metadata';
import {
  catalogPath,
  resolveCategory,
  resolveLaboratory,
  isUuid,
} from '@/lib/catalog-urls';

interface ProductsPageContentProps {
  labSlug?: string;
  categorySlug?: string;
  legacyLab?: string;
  legacyCategory?: string;
}

export async function buildProductsMetadata(
  labSlug?: string,
  categorySlug?: string
): Promise<Metadata> {
  return buildProductsMetadataFromSlugs(labSlug, categorySlug);
}

export default async function ProductsPageContent({
  labSlug,
  categorySlug,
  legacyLab,
  legacyCategory,
}: ProductsPageContentProps) {
  const { products, laboratories, categories } = await getCatalogSnapshot();

  if (legacyLab && isUuid(legacyLab)) {
    const lab = resolveLaboratory(legacyLab, laboratories);
    const cat = legacyCategory ? resolveCategory(legacyCategory, categories) : undefined;
    if (lab) {
      redirect(catalogPath(lab, cat));
    }
  }
  if (legacyCategory && isUuid(legacyCategory) && !legacyLab) {
    const cat = resolveCategory(legacyCategory, categories);
    const lab = cat ? laboratories.find((l) => l.id === cat.laboratoire_id) : undefined;
    if (cat && lab) {
      redirect(catalogPath(lab, cat));
    }
  }

  const lab = resolveLaboratory(labSlug, laboratories);
  const category = resolveCategory(categorySlug, categories);

  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient
        products={products}
        laboratories={laboratories}
        categories={categories}
        initialLabId={lab?.id || 'Tous'}
        initialCategoryId={category?.id || 'Tous'}
        initialLabSlug={lab?.slug}
        initialCategorySlug={category?.slug}
      />
    </Suspense>
  );
}

function ProductsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    </div>
  );
}
