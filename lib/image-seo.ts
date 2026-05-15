/**
 * Noms de fichiers recommandés + textes alt pour le SEO et l'accessibilité.
 * Chemins actuels conservés pour compatibilité ; renommez les fichiers dans public/images/ si besoin.
 */
export type Locale = 'fr' | 'en';

export const SITE_IMAGES = {
  logo: {
    path: '/logo_1.svg',
    fileName: 'logo-ads-angela-diagnostics.svg',
    alt: {
      fr: 'Logo ADS - Angela Diagnostics et Services',
      en: 'ADS logo - Angela Diagnostics and Services',
    },
  },
  heroLab: {
    path: '/images/hero/lab-1.jpg',
    fileName: 'hero-reactifs-laboratoire-cameroun.jpg',
    alt: {
      fr: 'Réactifs de laboratoire et solutions diagnostiques ADS au Cameroun',
      en: 'ADS laboratory reagents and diagnostic solutions in Cameroon',
    },
  },
  heroQuality: {
    path: '/images/hero/lab-2.jpg',
    fileName: 'hero-qualite-tests-diagnostiques.jpg',
    alt: {
      fr: 'Tests diagnostiques de qualité - Fortress, Bioline, Hightop',
      en: 'Quality diagnostic tests - Fortress, Bioline, Hightop',
    },
  },
  heroDelivery: {
    path: '/images/hero/delivery.jpg',
    fileName: 'hero-livraison-reactifs-afrique.jpg',
    alt: {
      fr: 'Livraison rapide de réactifs de laboratoire en Afrique centrale',
      en: 'Fast delivery of laboratory reagents in Central Africa',
    },
  },
  aboutTeam: {
    path: '/images/img1.png',
    fileName: 'ads-equipe-experts-laboratoire.png',
    alt: {
      fr: 'Équipe ADS - experts en réactifs de laboratoire et diagnostics au Cameroun',
      en: 'ADS team - laboratory reagents and diagnostics experts in Cameroon',
    },
  },
  aboutMission: {
    path: '/images/img2.png',
    fileName: 'ads-mission-reactifs-qualite.png',
    alt: {
      fr: 'Mission ADS - fournir des réactifs de laboratoire certifiés au Cameroun',
      en: 'ADS mission - certified laboratory reagents in Cameroon',
    },
  },
  aboutSolutions: {
    path: '/images/img3.jpg',
    fileName: 'ads-stock-local-livraison-reactifs.jpg',
    alt: {
      fr: 'Stock local ADS - réactifs de laboratoire avec livraison rapide',
      en: 'ADS local stock - laboratory reagents with fast delivery',
    },
  },
} as const;

export function imageAlt(
  key: keyof typeof SITE_IMAGES,
  locale: Locale = 'fr'
): string {
  return SITE_IMAGES[key].alt[locale];
}

export function getProductDisplayName(
  product: {
    nom?: string | null;
    nom_en?: string | null;
    name?: string | null;
  },
  locale: Locale = 'fr'
): string {
  if (locale === 'en') {
    return product.nom_en || product.nom || product.name || 'Product';
  }
  return product.nom || product.name || 'Produit';
}

/** Alt descriptif pour images produit (SEO + accessibilité). */
export function getProductImageAlt(
  product: {
    nom?: string | null;
    nom_en?: string | null;
    name?: string | null;
    category?: string | null;
    categorie?: { nom?: string | null } | null;
    laboratory?: string | null;
    laboratoire?: { nom?: string | null } | string | null;
    reference?: string | null;
  },
  locale: Locale = 'fr',
  variant: 'card' | 'detail' | 'thumbnail' = 'card'
): string {
  const name = getProductDisplayName(product, locale);
  const lab =
    product.laboratory ||
    (typeof product.laboratoire === 'string'
      ? product.laboratoire
      : product.laboratoire?.nom) ||
    '';
  const cat = product.category || product.categorie?.nom || '';
  const ref = product.reference ? ` (${product.reference})` : '';

  if (variant === 'thumbnail') {
    return locale === 'fr'
      ? `${name}${ref} - vue ${cat || 'produit'}`
      : `${name}${ref} - ${cat || 'product'} view`;
  }

  if (locale === 'fr') {
    const parts = [name, lab, cat, 'réactif laboratoire ADS'].filter(Boolean);
    return parts.join(' - ') + ref;
  }
  const parts = [name, lab, cat, 'ADS laboratory reagent'].filter(Boolean);
  return parts.join(' - ') + ref;
}
