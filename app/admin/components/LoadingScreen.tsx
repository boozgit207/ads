'use client';

import { useState, useEffect } from 'react';

export default function AdminLoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // 0.5 secondes

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="flex flex-col items-center gap-8">
        {/* Logo animé avec effet de pulsation */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative w-32 h-32 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex items-center justify-center">
            <img src="/logo_1.svg" alt="Logo ADS" className="w-20 h-20 animate-pulse" />
          </div>
        </div>

        {/* Loading Text avec animation */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">
            Angela Diagnostics & Services
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">
            Administration
          </p>
        </div>
      </div>
    </div>
  );
}
