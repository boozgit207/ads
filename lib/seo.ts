import { COMPANY } from './config';

export const siteUrl = COMPANY.siteUrl.replace(/\/$/, '');

export const defaultOgImage = '/logo_1.svg';

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function productPath(product: { slug?: string | null; id: string }): string {
  return `/product/${product.slug || product.id}`;
}
