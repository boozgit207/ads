'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from './ThemeProvider';
import LanguageSwitcher, { useLanguage } from './LanguageSwitcher';
import { logout } from '../../actions/auth';
import AdminLoadingScreen from './LoadingScreen';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  titleEn?: string;
}

export default function AdminLayout({ children, title, titleEn }: AdminLayoutProps) {
  const { language } = useLanguage();
  const displayTitle = language === 'fr' ? title : (titleEn || title);

  return (
    <ThemeProvider>
      <AdminLoadingScreen />
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />

        <div className="flex-1 lg:ml-64 min-w-0">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex min-h-14 sm:h-16 items-center justify-between gap-3 py-3 sm:py-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 truncate pl-12 lg:pl-0">
                  {displayTitle}
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <LanguageSwitcher />
                  <form action={logout}>
                    <button
                      type="submit"
                      className="text-xs font-semibold uppercase tracking-wide border border-slate-200 px-3 sm:px-4 py-2 rounded-lg text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
