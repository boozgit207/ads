'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Globe } from 'lucide-react';

type Language = 'fr' | 'en';

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    statistics: 'Statistiques',
    products: 'Produits',
    stocks: 'Stocks',
    orders: 'Commandes',
    clients: 'Clients',
    reviews: 'Avis',
    notifications: 'Notifications',
    profile: 'Mon profil',
    settings: 'Paramètres',
    viewSite: 'Voir le site',
  },
  en: {
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    products: 'Products',
    stocks: 'Stocks',
    orders: 'Orders',
    clients: 'Clients',
    reviews: 'Reviews',
    notifications: 'Notifications',
    profile: 'My Profile',
    settings: 'Settings',
    viewSite: 'View Site',
  },
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('fr');
  const t = translations[language];
  
  return { language, setLanguage, t };
}

export default function LanguageSwitcher() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium uppercase">{language}</span>
      </button>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}
