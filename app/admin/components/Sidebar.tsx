'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useLanguage } from './LanguageSwitcher';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  Star, 
  Settings, 
  User, 
  Bell,
  FileText,
  Package,
  TrendingUp,
  ChevronRight,
  Sparkles,
  X,
  Menu,
  FolderTree
} from 'lucide-react';

const menuItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', labelEn: 'Dashboard' },
  { href: '/admin/catalogue', icon: FolderTree, label: 'Catalogue', labelEn: 'Catalog' },
  { href: '/admin/produits', icon: Box, label: 'Produits', labelEn: 'Products' },
  { href: '/admin/stocks', icon: Package, label: 'Stocks', labelEn: 'Stocks' },
  { href: '/admin/commandes', icon: ShoppingCart, label: 'Commandes', labelEn: 'Orders' },
  { href: '/admin/clients', icon: Users, label: 'Clients', labelEn: 'Clients' },
  { href: '/admin/avis', icon: Star, label: 'Avis', labelEn: 'Reviews' },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications', labelEn: 'Notifications' },
  { href: '/admin/profil', icon: User, label: 'Mon profil', labelEn: 'Profile' },
  { href: '/admin/parametres', icon: Settings, label: 'Paramètres', labelEn: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all"
      >
        <Menu className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50 transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">ADS</span>
              <div className="text-[10px] tracking-wider uppercase text-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Admin
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const label = language === 'fr' ? item.label : item.labelEn;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-gradient-to-t from-zinc-100 dark:from-zinc-800 to-transparent">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200 group"
          >
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{language === 'fr' ? 'Voir le site' : 'View Site'}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
