'use client';

import LabLogo from '@/app/components/LabLogo';

type LabCatalogBannerProps = {
  nom: string;
  slug?: string | null;
  description?: string | null;
  productCount?: number;
  productCountLabel?: string;
};

export default function LabCatalogBanner({
  nom,
  slug,
  description,
  productCount,
  productCountLabel,
}: LabCatalogBannerProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-200/40 dark:border-blue-800/60 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 shadow-lg">
      <div className="px-6 sm:px-8 py-6 sm:py-8 flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-8">
        <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-white p-3 sm:p-4 shadow-md flex items-center justify-center">
          <LabLogo slug={slug} nom={nom} size="xl" className="w-full h-full" />
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{nom}</h2>
          {description && (
            <p className="text-blue-100/95 text-sm sm:text-base mt-2 leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
          {productCount !== undefined && productCountLabel && (
            <p className="text-blue-200/90 text-sm mt-2 font-medium">
              {productCount} {productCountLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
