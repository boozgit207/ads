import type { Category, Laboratory } from '@/app/actions/catalog';

/** URL catalogue lisible pour le SEO : /products/bioline/biochimie */
export function catalogPath(
  lab?: Pick<Laboratory, 'slug'> | null,
  category?: Pick<Category, 'slug'> | null
): string {
  if (lab?.slug && category?.slug) {
    return `/products/${lab.slug}/${category.slug}`;
  }
  if (lab?.slug) {
    return `/products/${lab.slug}`;
  }
  return '/products';
}

export function resolveLaboratory(
  param: string | undefined,
  laboratories: Laboratory[]
): Laboratory | undefined {
  if (!param || param === 'Tous') return undefined;
  return laboratories.find((l) => l.slug === param || l.id === param || l.nom === param);
}

export function resolveCategory(
  param: string | undefined,
  categories: Category[]
): Category | undefined {
  if (!param || param === 'Tous') return undefined;
  return categories.find((c) => c.slug === param || c.id === param || c.nom === param);
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
