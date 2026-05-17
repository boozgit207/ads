/** URL d'affichage : colonne principale ou première image produit_images */
export function resolveProductImageUrl(product: {
  image_principale_url?: string | null;
  images?: Array<{ url: string; is_primary?: boolean; ordre?: number }> | null;
}): string | null {
  if (product.image_principale_url?.trim()) {
    return product.image_principale_url.trim();
  }
  const imgs = product.images;
  if (!imgs?.length) return null;
  const sorted = [...imgs].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  const primary = sorted.find((i) => i.is_primary) ?? sorted[0];
  return primary?.url?.trim() || null;
}
