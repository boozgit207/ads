'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  mounted: false
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('ads-dark-mode');
      // Mode clair par défaut (ignore prefers-color-scheme)
      const isDarkMode = savedDarkMode === 'true';

      setIsDark(isDarkMode);
      // Force the dark class on html element
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      setMounted(true);
    } catch (e) {
      console.warn('ThemeProvider initialization error:', e);
      setMounted(true);
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    console.log('toggleTheme called:', { current: isDark, new: newIsDark });
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      console.log('Added dark class');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      console.log('Removed dark class');
    }
    try {
      localStorage.setItem('ads-dark-mode', newIsDark.toString());
      console.log('Saved to localStorage:', newIsDark);
    } catch (e) {
      console.warn('Failed to save dark mode preference:', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
