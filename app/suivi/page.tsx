'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Package, Search, Loader2, ArrowRight } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { getOrderStatusLabel, getOrderStatusColor } from '@/lib/order-utils';

export default function SuiviCommandePage() {
  const { locale } = useI18n();
  const [numero, setNumero] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);

  const t = {
    fr: {
      title: 'Suivi de commande',
      subtitle: 'Sans connexion — utilisez votre numéro de commande et téléphone',
      numero: 'N° de commande',
      phone: 'Téléphone utilisé à la commande',
      search: 'Rechercher',
      notFound: 'Commande introuvable',
      trackDetail: 'Voir le détail complet',
      loading: 'Recherche...',
    },
    en: {
      title: 'Order tracking',
      subtitle: 'No login required — use your order number and phone',
      numero: 'Order number',
      phone: 'Phone used for the order',
      search: 'Search',
      notFound: 'Order not found',
      trackDetail: 'View full details',
      loading: 'Searching...',
    },
  }[locale];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    if (!numero.trim() || !phone.trim()) {
      setError(locale === 'fr' ? 'Remplissez les deux champs' : 'Fill in both fields');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        numero: numero.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${params}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
        if (data.id) {
          localStorage.setItem(
            'ads-last-order',
            JSON.stringify({
              id: data.id,
              numero: data.numero || data.numero_commande,
              phone: phone.trim(),
            })
          );
        }
      } else {
        setError(data.error || t.notFound);
      }
    } catch {
      setError(t.notFound);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{t.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.numero}
            </label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="ADS-2026-000001"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.phone}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+237 6XX XX XX XX"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? t.loading : t.search}
          </button>
        </form>

        {order && (
          <div className="mt-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg">
            <p className="text-sm text-zinc-500 mb-1">{t.numero}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
              {order.numero || order.numero_commande}
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.statut)}`}
            >
              {getOrderStatusLabel(order.statut, locale)}
            </span>
            <p className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">
              {(order.total || order.total_commande || 0).toLocaleString()} FCFA
            </p>
            <Link
              href={`/orders/${order.id}?phone=${encodeURIComponent(phone)}`}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
            >
              {t.trackDetail}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
