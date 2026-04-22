'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Beaker, FlaskConical, TestTube, Droplets } from 'lucide-react';

interface GlasswareItem {
  id: string;
  name: string;
  capacity: string;
  price: number;
  image: string;
  position: { x: number; y: number };
}

interface TriggerPopupEffectProps {
  glasswareImage: string;
  items: GlasswareItem[];
  className?: string;
}

export default function TriggerPopupEffect({ 
  glasswareImage, 
  items,
  className = ''
}: TriggerPopupEffectProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleItemClick = (itemId: string) => {
    if (activeItem === itemId) {
      setActiveItem(null);
    } else {
      setIsAnimating(true);
      setActiveItem(itemId);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const activeProduct = items.find(item => item.id === activeItem);

  return (
    <div className={`relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Main Glassware Image */}
      <div className="relative w-full h-96">
        <Image
          src={glasswareImage}
          alt="Collection de verrerie"
          fill
          className="object-contain p-8"
          priority
        />

        {/* Trigger Points */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`absolute w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-all hover:scale-125 shadow-lg shadow-sky-500/30 ${
              activeItem === item.id ? 'ring-4 ring-sky-300 dark:ring-sky-700' : ''
            }`}
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-label={`Voir détails de ${item.name}`}
          >
            <Beaker className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Popup Overlay */}
      {activeProduct && (
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 transition-opacity duration-300 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={() => setActiveItem(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeProduct.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Éprouvette de laboratoire
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                    <TestTube className="w-4 h-4" />
                    Capacité
                  </div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {activeProduct.capacity}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                    <Droplets className="w-4 h-4" />
                    Prix
                  </div>
                  <div className="text-lg font-semibold text-sky-600 dark:text-sky-400">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(activeProduct.price)}
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-sky-500/30">
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Cliquez sur les points pour voir les détails
        </p>
      </div>
    </div>
  );
}
