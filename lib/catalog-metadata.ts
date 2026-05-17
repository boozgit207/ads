import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { catalogPath } from '@/lib/catalog-urls';

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Métadonnées catalogue sans requête Supabase (compatible ISR). */
export function buildProductsMetadataFromSlugs(
  labSlug?: string,
  categorySlug?: string
): Metadata {
  if (labSlug && categorySlug) {
    const lab = titleFromSlug(labSlug);
    const cat = titleFromSlug(categorySlug);
    const title = `Réactifs ${cat} ${lab} | ADS Cameroun`;
    const description = `Réactifs ${cat} ${lab} pour laboratoires au Cameroun. Commande en ligne ADS.`;
    const path = catalogPath({ slug: labSlug }, { slug: categorySlug });
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl(path) },
      openGraph: { title, description, url: absoluteUrl(path) },
    };
  }

  if (labSlug) {
    const lab = titleFromSlug(labSlug);
    const title = `Réactifs ${lab} | ADS - Laboratoire Cameroun`;
    const description = `Catalogue réactifs ${lab} pour laboratoires au Cameroun.`;
    const path = catalogPath({ slug: labSlug });
    return {
      title,
      description,
      alternates: { canonical: absoluteUrl(path) },
      openGraph: { title, description, url: absoluteUrl(path) },
    };
  }

  return {
    title: 'Catalogue réactifs laboratoire | ADS - Cameroun',
    description:
      'Réactifs de laboratoire au Cameroun : Fortress Diagnostics, Bioline, Hightop. Latex, ELISA, biochimie, consommables.',
    alternates: { canonical: absoluteUrl('/products') },
  };
}
