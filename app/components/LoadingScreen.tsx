'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SKIP_PATHS = ['/checkout', '/cart', '/suivi'];

export default function LoadingScreen() {
  const pathname = usePathname();
  const skip = SKIP_PATHS.some((p) => pathname?.startsWith(p));
  const [isLoading, setIsLoading] = useState(!skip);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (skip) {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [skip]);

  // Ne rien afficher avant le montage pour éviter les erreurs d'hydratation
  if (!mounted) return null;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        {/* Logo avec cercle */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Cercle extérieur animé */}
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          {/* Cercle intérieur avec effet de glow */}
          <div className="absolute inset-2 bg-blue-500/20 rounded-full blur-lg animate-pulse"></div>
          {/* Conteneur du logo */}
          <div className="relative w-20 h-20 bg-white dark:bg-zinc-900 rounded-full shadow-xl flex items-center justify-center z-10">
            <img 
              src="/logo_1.svg" 
              alt="ADS Loading" 
              className="w-14 h-14"
              style={{ animation: 'pulse 2s infinite' }}
            />
          </div>
        </div>

        {/* Texte */}
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-lg font-semibold">
            Angela Diagnostics
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">
            Chargement...
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
