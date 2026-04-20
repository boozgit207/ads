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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo_1.svg" alt="ADS Logo" className="h-20 w-20" />
          <span className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            ADS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Home className="w-4 h-4" />
            {nav.home}
          </Link>
          <Link
            href="/products"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Grid3X3 className="w-4 h-4" />
            {nav.catalog}
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <HelpCircle className="w-4 h-4" />
            {nav.about}
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <Mail className="w-4 h-4" />
            {nav.contact}
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Cart Icon */}
          <Link
            href="/cart"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white relative"
            aria-label={nav.cart}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
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
              className="hidden sm:flex h-10 items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Sélectionner la langue"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{locale}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 py-1">
                <button
                  onClick={() => toggleLang('fr')}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    locale === 'fr'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                  aria-label="Français"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center text-[8px] text-white font-bold">FR</span>
                  Français
                </button>
                <button
                  onClick={() => toggleLang('en')}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    locale === 'en'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                  aria-label="English"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center text-[8px] text-white font-bold">EN</span>
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
                className="flex h-10 items-center gap-2 pl-2 pr-3 rounded-lg border border-zinc-200 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                aria-label="Menu compte"
              >
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.first_name || ''}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials()}
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {user.first_name || user.email.split('@')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 py-1">
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {nav.account}
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4" />
                      {locale === 'fr' ? 'Mes commandes' : 'My orders'}
                    </div>
                    {orderCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {orderCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/account?tab=settings"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </Link>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 mt-1 pt-1">
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
              className="hidden sm:flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <User className="w-4 h-4" />
              {locale === 'fr' ? 'Connexion' : 'Login'}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="flex flex-col p-4 space-y-1">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Home className="w-5 h-5" />
              {nav.home}
            </Link>
            <Link 
              href="/products" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Grid3X3 className="w-5 h-5" />
              {nav.catalog}
            </Link>
            <Link 
              href="/cart" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              {nav.cart}
            </Link>
            <Link 
              href="/help" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <HelpCircle className="w-5 h-5" />
              {nav.about}
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              <Mail className="w-5 h-5" />
              {nav.contact}
            </Link>
            
            <div className="border-t border-zinc-200 dark:border-zinc-800 my-2 pt-2">
              <button
                onClick={toggleDarkMode}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Mode clair' : 'Mode sombre'}
              </button>
              
              <div className="flex items-center gap-3 px-4 py-3">
                <Globe className="w-5 h-5 text-zinc-400" />
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleLang('fr')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      locale === 'fr'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    FR
                  </button>
                  <button
                    onClick={() => toggleLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      locale === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>

            {!user && (
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700"
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
