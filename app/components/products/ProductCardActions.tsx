'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, ShoppingCart, Tag } from 'lucide-react';

type ProductCardActionsProps = {
  href: string;
  price: number;
  promoPrice?: number | null;
  inStock: boolean;
  onAddToCart: () => void;
  locale: 'fr' | 'en';
  priceOnRequest?: string;
};

export default function ProductCardActions({
  href,
  price,
  promoPrice,
  inStock,
  onAddToCart,
  locale,
  priceOnRequest,
}: ProductCardActionsProps) {
  const [showPrice, setShowPrice] = useState(false);

  const labels = {
    showPrice: locale === 'fr' ? 'Voir le prix' : 'Show price',
    hidePrice: locale === 'fr' ? 'Masquer le prix' : 'Hide price',
    onRequest: priceOnRequest || (locale === 'fr' ? 'Prix sur demande' : 'Price on request'),
    details: locale === 'fr' ? 'Voir la fiche produit' : 'View product details',
    add: locale === 'fr' ? 'Ajouter au panier' : 'Add to cart',
  };

  const displayPrice = promoPrice && promoPrice < price ? promoPrice : price;
  const hasPrice = displayPrice > 0;

  return (
    <div className="space-y-3">
      {showPrice && (
        <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-4 py-3">
          <p className="text-lg font-bold text-zinc-900 dark:text-white tabular-nums">
            {hasPrice ? `${displayPrice.toLocaleString('fr-FR')} FCFA` : labels.onRequest}
          </p>
          {promoPrice && promoPrice < price && price > 0 && (
            <p className="text-sm text-zinc-400 line-through mt-0.5">
              {price.toLocaleString('fr-FR')} FCFA
            </p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {showPrice ? (
          <button
            type="button"
            onClick={() => setShowPrice(false)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
          >
            <Tag className="w-4 h-4 shrink-0" />
            {labels.hidePrice}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowPrice(true)}
            className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold text-sky-700 dark:text-sky-300 border-2 border-sky-200 dark:border-sky-700 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
          >
            {labels.showPrice}
          </button>
        )}

        <Link
          href={href}
          className="flex items-center justify-center w-12 h-11 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
          aria-label={labels.details}
          title={labels.details}
        >
          <Eye className="w-5 h-5" />
        </Link>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={!inStock}
          className="flex items-center justify-center w-12 h-11 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md shadow-blue-500/25 disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none transition-all"
          aria-label={labels.add}
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
