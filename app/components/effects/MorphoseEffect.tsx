'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, Info } from 'lucide-react';

interface MorphoseEffectProps {
  productImage: string;
  productName: string;
  productSpecs: {
    capacity?: string;
    precision?: string;
    material?: string;
    certifications?: string[];
  };
  className?: string;
}

export default function MorphoseEffect({ 
  productImage, 
  productName, 
  productSpecs,
  className = '' 
}: MorphoseEffectProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-50 dark:bg-slate-800 rounded-2xl ${className}`}
      style={{ minHeight: isExpanded ? '500px' : '300px', transition: 'height 0.5s ease-in-out' }}
    >
      {/* Product Image with Morphose Effect */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
          isExpanded ? 'w-1/2 left-0' : 'w-full left-0'
        }`}
      >
        <div className="relative w-full h-full">
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-contain p-8"
            priority
          />
          {/* Overlay when expanded */}
          {isExpanded && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-50 dark:to-slate-800" />
          )}
        </div>
      </div>

      {/* Technical Specs Panel - Appears with Morphose Effect */}
      <div 
        className={`absolute top-0 right-0 h-full bg-white dark:bg-slate-900 shadow-2xl transition-all duration-500 ease-in-out ${
          isExpanded ? 'w-1/2 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full'
        }`}
      >
        <div className="p-8 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-6 h-6 text-sky-500" />
              Fiche Technique
            </h3>
            <button
              onClick={toggleExpand}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {productName}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Équipement de haute précision pour laboratoire
              </p>
            </div>

            {productSpecs.capacity && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Capacité</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {productSpecs.capacity}
                </div>
              </div>
            )}

            {productSpecs.precision && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Précision</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {productSpecs.precision}
                </div>
              </div>
            )}

            {productSpecs.material && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Matériau</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {productSpecs.material}
                </div>
              </div>
            )}

            {productSpecs.certifications && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Certifications</div>
                <div className="flex flex-wrap gap-2">
                  {productSpecs.certifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-medium rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      {!isExpanded && (
        <button
          onClick={toggleExpand}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:scale-105"
          aria-label="Voir fiche technique"
        >
          <ZoomIn className="w-5 h-5" />
          <span className="font-medium">Fiche Technique</span>
        </button>
      )}
    </div>
  );
}
