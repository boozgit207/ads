import { Product } from '@/app/actions/catalog';
import { absoluteUrl, productPath, siteUrl } from '@/lib/seo';

interface ProductStructuredDataProps {
  product: Product;
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const url = absoluteUrl(productPath(product));
  const image = product.image_principale_url || `${siteUrl}/logo_1.svg`;
  const price = product.prix_promo ?? product.prix;
  const inStock = product.quantite_stock > 0 && product.statut === 'disponible';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nom,
    description: product.description || product.nom,
    image,
    sku: product.reference || product.id,
    brand: product.laboratoire?.nom || product.fabricant
      ? { '@type': 'Brand', name: product.laboratoire?.nom || product.fabricant }
      : undefined,
    category: product.categorie?.nom,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'XAF',
      price: price.toString(),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ADS - Angela Diagnostics et Services',
      },
    },
    ...(product.reviewCount && product.reviewCount > 0 && product.averageRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.averageRating.toFixed(1),
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
