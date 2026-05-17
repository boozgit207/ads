import { unstable_cache } from 'next/cache';
import {
  getProducts,
  getLaboratories,
  getCategories,
  type Product,
  type Laboratory,
  type Category,
} from '@/app/actions/catalog';

/** Durée ISR du catalogue (1 h) */
export const CATALOG_REVALIDATE_SECONDS = 3600;

export type CatalogSnapshot = {
  products: Product[];
  laboratories: Laboratory[];
  categories: Category[];
};

async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  const [productsResult, labsResult, catsResult] = await Promise.all([
    getProducts(),
    getLaboratories(),
    getCategories(),
  ]);

  return {
    products: productsResult.success ? productsResult.products || [] : [],
    laboratories: labsResult.success ? labsResult.laboratories || [] : [],
    categories: catsResult.success ? catsResult.categories || [] : [],
  };
}

export const getCatalogSnapshot = unstable_cache(
  fetchCatalogSnapshot,
  ['ads-catalog-snapshot'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['catalog'] }
);
