'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Home, 
  HelpCircle, 
  Mail, 
  Sun, 
  Moon, 
  User, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  LogOut,
  Settings,
  ShoppingCart,
  Grid3X3,
  ShoppingBag
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "./ThemeProvider";
import { useI18n } from "../context/I18nContext";

export default function Header() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme, mounted } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  // Load order count on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrderCount = localStorage.getItem('ads-order-count');
      if (savedOrderCount) {
        setOrderCount(parseInt(savedOrderCount));
      }
    }
  }, []);

  const toggleDarkMode = () => {
    toggleTheme();
  };

  // Prevent hydration mismatch for dark mode button
  const darkModeButton = mounted ? (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-600" />
      )}
    </button>
  ) : (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Mode"
    >
      <Moon className="w-5 h-5 text-zinc-600" />
    </button>
  );

  const toggleLang = (newLang: 'fr' | 'en') => {
    setLocale(newLang);
    setIsLangMenuOpen(false);
  };

  const getInitials = () => {
    const f = user?.first_name?.[0] || '';
    const l = user?.last_name?.[0] || '';
    return (f + l).toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  };

  // Use translations from i18n context
  const nav = t.nav;
  const common = t.common;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity group">
          <img src="/logo_1.svg" alt="Logo" className="h-16 w-16 group-hover:scale-110 transition-transform" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          >
            <Home className="w-4 h-4" />
            {nav.home}
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          >
            <Grid3X3 className="w-4 h-4" />
            {nav.catalog}
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          >
            <HelpCircle className="w-4 h-4" />
            {nav.about}
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
          >
            <Mail className="w-4 h-4" />
            {nav.contact}
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400 relative"
            aria-label={nav.cart}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-sky-500/30">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Dark Mode Toggle */}
          <div className="hidden sm:flex">
            {darkModeButton}
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="hidden sm:flex h-11 items-center gap-2 px-4 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
              aria-label="Sélectionner la langue"
            >
              <img 
                src={locale === 'fr' ? '/france-flag-icon-256.png' : '/united-kingdom-flag-icon-256.png'} 
                alt={locale} 
                className="w-5 h-5 rounded-full object-cover" 
              />
              <span className="uppercase">{locale}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 py-2">
                <button
                  onClick={() => toggleLang('fr')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    locale === 'fr'
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-label="Français"
                >
                  <img src="/france-flag-icon-256.png" alt="FR" className="w-6 h-6 rounded-full object-cover" />
                  Français
                </button>
                <button
                  onClick={() => toggleLang('en')}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    locale === 'en'
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-label="English"
                >
                  <img src="/united-kingdom-flag-icon-256.png" alt="EN" className="w-6 h-6 rounded-full object-cover" />
                  English
                </button>
              </div>
            )}
          </div>

          {/* Account */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex h-11 items-center gap-3 pl-3 pr-4 rounded-xl border border-slate-200 transition-all hover:border-sky-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-sky-600 dark:hover:bg-slate-800"
                aria-label="Menu compte"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.first_name || ''}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-100 dark:ring-slate-700">
                    {getInitials()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user.first_name || user.email.split('@')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-slate-300 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 py-2">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {nav.account}
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4" />
                      {locale === 'fr' ? 'Mes commandes' : 'My orders'}
                    </div>
                    {orderCount > 0 && (
                      <span className="bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {orderCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/account?tab=settings"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      onClick={async () => {
                        setIsAccountMenuOpen(false);
                        await signOut();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Déconnexion"
                    >
                      <LogOut className="w-4 h-4" />
                      {nav.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-sky-500/25 hover:scale-105"
            >
              <User className="w-4 h-4" />
              {locale === 'fr' ? 'Connexion' : 'Login'}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col p-4 space-y-1">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
            >
              <Home className="w-5 h-5" />
              {nav.home}
            </Link>
            <Link 
              href="/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
            >
              <Grid3X3 className="w-5 h-5" />
              {nav.catalog}
            </Link>
            <Link 
              href="/cart" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-sky-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              {nav.cart}
            </Link>
            <Link 
              href="/help" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
            >
              <HelpCircle className="w-5 h-5" />
              {nav.about}
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-400"
            >
              <Mail className="w-5 h-5" />
              {nav.contact}
            </Link>
            
            <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
              <button
                onClick={toggleDarkMode}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-sky-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Mode clair' : 'Mode sombre'}
              </button>
              
              <div className="flex items-center gap-3 px-4 py-3">
                <Globe className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLang('fr')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      locale === 'fr'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <img src="/france-flag-icon-256.png" alt="FR" className="w-5 h-5 rounded-full object-cover" />
                    FR
                  </button>
                  <button
                    onClick={() => toggleLang('en')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      locale === 'en'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <img src="/united-kingdom-flag-icon-256.png" alt="EN" className="w-5 h-5 rounded-full object-cover" />
                    EN
                  </button>
                </div>
              </div>
            </div>

            {!user && (
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:shadow-lg"
              >
                <User className="w-5 h-5" />
                {locale === 'fr' ? 'Connexion' : 'Login'}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
