'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from './ThemeProvider';
import LanguageSwitcher, { useLanguage } from './LanguageSwitcher';
import { logout } from '../../actions/auth';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  titleEn?: string;
}

export default function AdminLayout({ children, title, titleEn }: AdminLayoutProps) {
  const { language } = useLanguage();
  const displayTitle = language === 'fr' ? title : (titleEn || title);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {displayTitle}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-lg"
                    >
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
