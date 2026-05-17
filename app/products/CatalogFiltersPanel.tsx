'use client';

import Image from 'next/image';
import { Search, ArrowUpDown, X } from 'lucide-react';
import type { Category, Laboratory } from '../actions/catalog';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary-image';

export const OPEN_CATALOG_FILTERS_EVENT = 'ads-open-catalog-filters';

export interface CatalogFiltersLabels {
  search: string;
  all: string;
  labs: string;
  categories: string;
  nameAsc: string;
  nameDesc: string;
  priceAsc: string;
  priceDesc: string;
  filtersTitle: string;
  apply: string;
}

interface CatalogFiltersPanelProps {
  labels: CatalogFiltersLabels;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedLabId: string;
  selectedCategoryId: string;
  laboratories: Laboratory[];
  visibleCategories: Category[];
  onSelectLab: (labId: string) => void;
  onSelectCategory: (labId: string, categoryId: string) => void;
  onClose?: () => void;
  showClose?: boolean;
}

export default function CatalogFiltersPanel({
  labels,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedLabId,
  selectedCategoryId,
  laboratories,
  visibleCategories,
  onSelectLab,
  onSelectCategory,
  onClose,
  showClose,
}: CatalogFiltersPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">
          {labels.filtersTitle}
        </h2>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={labels.apply}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-5 overflow-y-auto flex-1 pr-1 -mr-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={labels.search}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-9 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="name-asc">{labels.nameAsc}</option>
            <option value="name-desc">{labels.nameDesc}</option>
            <option value="price-asc">{labels.priceAsc}</option>
            <option value="price-desc">{labels.priceDesc}</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>

        <div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
            {labels.labs}
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => onSelectLab('Tous')}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedLabId === 'Tous'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {labels.all}
            </button>
            {laboratories.map((lab) => (
              <button
                key={lab.id}
                type="button"
                onClick={() => onSelectLab(lab.id)}
                className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedLabId === lab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {lab.image_url ? (
                  <span className="relative w-6 h-6 rounded-full overflow-hidden bg-white shrink-0">
                    <Image
                      src={optimizeCloudinaryUrl(lab.image_url, 64)}
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain p-0.5"
                      unoptimized={lab.image_url.includes('cloudinary.com')}
                    />
                  </span>
                ) : null}
                <span className="truncate">{lab.nom}</span>
              </button>
            ))}
          </div>
        </div>

        {visibleCategories.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              {labels.categories}
            </p>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => onSelectCategory(selectedLabId, 'Tous')}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategoryId === 'Tous'
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {labels.all}
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onSelectCategory(
                      selectedLabId === 'Tous' ? cat.laboratoire_id : selectedLabId,
                      cat.id
                    )
                  }
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategoryId === cat.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat.nom}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shrink-0 lg:hidden"
        >
          {labels.apply}
        </button>
      )}
    </div>
  );
}
