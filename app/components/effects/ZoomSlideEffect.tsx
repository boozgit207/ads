'use client';

import { useState } from 'react';
import { 
  Package, 
  Shield, 
  Activity, 
  Heart, 
  Truck, 
  Headphones,
  ArrowLeft,
  Search
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  itemCount: number;
}

interface ZoomSlideEffectProps {
  categories: CategoryItem[];
  className?: string;
}

export default function ZoomSlideEffect({ 
  categories,
  className = ''
}: ZoomSlideEffectProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setIsZooming(true);
      setActiveCategory(categoryId);
      setTimeout(() => setIsZooming(false), 500);
    }
  };

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <div className={`relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden min-h-[400px] ${className}`}>
      {/* Dashboard View */}
      {!activeCategory && (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Catalogue Dashboard
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all hover:scale-105"
                >
                  <div className={`w-16 h-16 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center gap-2 text-sky-500">
                    <span className="text-sm font-medium">{category.itemCount} produits</span>
                    <Search className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoomed View */}
      {activeCategory && activeCategoryData && (
        <div 
          className={`absolute inset-0 bg-white dark:bg-slate-900 transition-all duration-500 ${
            isZooming ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className="p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Retour
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${activeCategoryData.color} flex items-center justify-center`}>
                  <activeCategoryData.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {activeCategoryData.name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {activeCategoryData.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(activeCategoryData.itemCount)].map((_, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg mb-3 flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Produit {index + 1}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Description courte
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
