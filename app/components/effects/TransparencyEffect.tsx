'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Droplets, Beaker, Play, Pause, RotateCcw } from 'lucide-react';

interface TransparencyEffectProps {
  emptyImage: string;
  filledImage: string;
  productName: string;
  description: string;
  className?: string;
}

export default function TransparencyEffect({ 
  emptyImage, 
  filledImage,
  productName,
  description,
  className = ''
}: TransparencyEffectProps) {
  const [fillLevel, setFillLevel] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && fillLevel < 100) {
      interval = setInterval(() => {
        setFillLevel((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            setAnimationComplete(true);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
    }

    return () => clearInterval(interval);
  }, [isPlaying, fillLevel]);

  const handlePlay = () => {
    if (animationComplete) {
      setFillLevel(0);
      setAnimationComplete(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setFillLevel(0);
    setIsPlaying(false);
    setAnimationComplete(false);
  };

  return (
    <div className={`relative bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden ${className}`}>
      {/* Product Images with Transparency Effect */}
      <div className="relative w-full h-96">
        {/* Empty Container Image */}
        <div className="absolute inset-0">
          <Image
            src={emptyImage}
            alt={`${productName} - Vide`}
            fill
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Filled Container Image with Opacity */}
        <div 
          className="absolute inset-0"
          style={{ opacity: fillLevel / 100 }}
        >
          <Image
            src={filledImage}
            alt={`${productName} - Plein`}
            fill
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Liquid Level Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-64 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-sky-400 transition-all duration-75"
            style={{ height: `${fillLevel}%` }}
          />
        </div>

        {/* Fill Percentage */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            {Math.round(fillLevel)}%
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg flex-1 mr-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {productName}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
            aria-label="Réinitialiser"
          >
            <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={handlePlay}
            className="w-12 h-12 rounded-xl bg-sky-500 hover:bg-sky-600 flex items-center justify-center transition-colors shadow-lg shadow-sky-500/30"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700">
        <div 
          className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-75"
          style={{ width: `${fillLevel}%` }}
        />
      </div>
    </div>
  );
}
