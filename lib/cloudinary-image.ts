/** Réduit le poids des images Cloudinary pour le web (format auto, qualité, largeur). */
export function optimizeCloudinaryUrl(url: string | null | undefined, width = 400): string {
  if (!url || !url.includes('res.cloudinary.com')) return url || '';
  if (url.includes('/upload/f_auto') || url.includes('/upload/w_')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}
