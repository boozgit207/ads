'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';

type Locale = 'fr' | 'en';
type Translations = typeof fr;

interface I18nContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  translations: Record<Locale, Translations>;
}

const translations: Record<Locale, Translations> = { fr, en };

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('ads-language') as Locale;
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLocaleState(savedLang);
    }
    // Set default HTML lang attribute to French
    document.documentElement.lang = 'fr';
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('ads-language', newLocale);
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  };

  const value = {
    locale,
    t: translations[locale],
    setLocale,
    translations
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={value}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
