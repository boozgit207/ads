'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-8">
        {/* Spinning Circle with Logo */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
          <img src="/logo_1.svg" alt="Logo" className="absolute inset-0 w-16 h-16 m-auto" />
        </div>

        {/* Loading Text */}
        <p className="text-slate-600 dark:text-slate-300 text-lg font-medium animate-pulse">
          Chargement...
        </p>
      </div>
    </div>
  );
}
