'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MessageCircle,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { showToast } from '../../components/Toast';
import { canUserDeleteOrder, getOrderStatusColor, getOrderStatusLabel } from '@/lib/order-utils';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { locale } = useI18n();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const isGuestTracking =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('phone');

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : null;
      const phone = params?.get('phone');
      const url = phone
        ? `/api/orders/${id}?phone=${encodeURIComponent(phone)}`
        : `/api/orders/${id}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order || !canUserDeleteOrder(order.statut)) return;
    if (!confirm(locale === 'fr' ? 'Supprimer cette commande ?' : 'Delete this order?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(locale === 'fr' ? 'Commande supprimée' : 'Order deleted', 'success');
        router.push('/account?tab=orders');
      } else {
        showToast(data.error || 'Erreur', 'error');
      }
    } catch {
      showToast(locale === 'fr' ? 'Erreur' : 'Error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const t = {
    fr: {
      back: 'Retour',
      orderTracking: 'Suivi de la commande',
      orderId: 'N° de commande',
      status: 'Statut',
      journeyProgress: 'PROGRESSION DU PARCOURS',
      carrierInfo: 'INFORMATIONS DE LA COMPAGNIE',
      serviceType: 'Type de service',
      estimatedDelivery: 'Livraison estimée',
      safetyProtocol: 'PROTOCOLE DE SÉCURITÉ',
      itemsInShipment: 'ARTICLES DANS CETTE EXPÉDITION',
      total: 'Total',
      supportChat: 'Chat support',
      loading: 'Chargement...',
      statusPending: 'En attente',
      statusProcessing: 'En cours de traitement',
      statusShipped: 'Expédiée',
      statusDelivered: 'Livrée',
      statusCancelled: 'Annulée',
      orderConfirmed: 'Commande confirmée',
      departureOrigin: 'Départ du centre d\'origine',
      labClearance: 'Dégagement du laboratoire',
      inTransit: 'En transit - Centre régional',
    },
    en: {
      back: 'Back',
      orderTracking: 'Order Tracking',
      orderId: 'Order ID',
      status: 'Status',
      journeyProgress: 'JOURNEY PROGRESS',
      carrierInfo: 'CARRIER INFORMATION',
      serviceType: 'Service Type',
      estimatedDelivery: 'Est. Delivery',
      safetyProtocol: 'SAFETY PROTOCOL',
      itemsInShipment: 'ITEMS IN THIS SHIPMENT',
      total: 'Total',
      supportChat: 'Support Chat',
      loading: 'Loading...',
      statusPending: 'Pending',
      statusProcessing: 'Processing',
      statusShipped: 'Shipped',
      statusDelivered: 'Delivered',
      statusCancelled: 'Cancelled',
      orderConfirmed: 'Order Confirmed',
      departureOrigin: 'Departed Origin',
      labClearance: 'Lab Clearance',
      inTransit: 'In Transit',
    }
  }[locale];

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">{t.loading}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-20 h-20 text-zinc-300 mx-auto mb-4" />
            <p className="text-xl text-zinc-600 dark:text-zinc-400">Commande non trouvée</p>
            <Link href="/account?tab=orders" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
              {t.back}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusIcons: Record<string, typeof Clock> = {
    en_attente: Clock,
    pending: Clock,
    paiement_recu: Package,
    en_preparation: Package,
    processing: Package,
    expediee: Truck,
    shipped: Truck,
    livree: CheckCircle,
    delivered: CheckCircle,
    annulee: Clock,
    remboursee: Clock,
  };
  const StatusIcon = statusIcons[order.statut] || Package;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Back Button */}
        <Link
          href="/account?tab=orders"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>

        {/* Order Header */}
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">{t.orderTracking}</h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{t.orderId}</p>
              <p className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">#{order.numero || order.numero_commande || order.id?.substring(0, 8)}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-semibold ${getOrderStatusColor(order.statut)}`}>
              <StatusIcon className="w-5 h-5" />
              <span className="uppercase text-sm tracking-wider">{getOrderStatusLabel(order.statut, locale)}</span>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Timeline - Left Column */}
          <div className="md:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6">{t.journeyProgress}</h3>
            <div className="space-y-0 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-300 dark:before:bg-zinc-700">
              {/* Step 1: Order Confirmed */}
              <div className="relative pl-10 pb-8">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center z-10 border-4 border-white dark:border-zinc-900">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-zinc-900 dark:text-white">{t.orderConfirmed}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Paiement confirmé • {new Date(order.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
              </div>

              {/* Step 2: Processing */}
              {(['paiement_recu', 'en_preparation', 'expediee', 'livree', 'processing', 'shipped', 'delivered'].includes(order.statut)) && (
                <div className="relative pl-10 pb-8">
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-zinc-900 ${order.statut === 'processing' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-white">{t.departureOrigin}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Expédition du centre' : 'Shipped from origin'}</span>
                  </div>
                </div>
              )}

              {/* Step 3: Shipped */}
              {(['expediee', 'livree', 'shipped', 'delivered'].includes(order.statut)) && (
                <div className="relative pl-10 pb-8">
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-white dark:border-zinc-900 ${order.statut === 'shipped' ? 'bg-blue-500' : 'bg-green-500'}`}>
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-white">{t.inTransit}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'En cours de livraison' : 'In transit to you'}</span>
                  </div>
                </div>
              )}

              {/* Step 4: Delivered */}
              {(['livree', 'delivered'].includes(order.statut)) && (
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center z-10 border-4 border-white dark:border-zinc-900">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-white">{locale === 'fr' ? 'Livrée' : 'Delivered'}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Livraison complétée' : 'Order completed'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Carrier Info */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">{t.carrierInfo}</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">{locale === 'fr' ? 'Livraison Standard' : 'Standard Delivery'}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Livraison sécurisée' : 'Secure Delivery'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t.serviceType}</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{locale === 'fr' ? 'Express' : 'Express'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{t.estimatedDelivery}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US') : locale === 'fr' ? 'À déterminer' : 'TBD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">{t.itemsInShipment}</h3>
              <div className="space-y-3 mb-4">
                {order.items && Array.isArray(order.items) && order.items.slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{item.name || item.product_name}</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              {order.items && Array.isArray(order.items) && order.items.length > 2 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">+{order.items.length - 2} {locale === 'fr' ? 'autres articles' : 'more items'}</p>
              )}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Total TTC' : 'Total (Incl. Duty)'}</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{(order.total || order.total_commande || 0).toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Link
            href="/contact"
            className="flex-1 md:flex-none bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <MessageCircle className="w-5 h-5" />
            {t.supportChat}
          </Link>
          {canUserDeleteOrder(order.statut) && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 md:flex-none border-2 border-red-500 text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              {locale === 'fr' ? 'Supprimer' : 'Delete'}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
