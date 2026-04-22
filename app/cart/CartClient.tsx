'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  slug?: string;
  stock?: number;
  laboratory?: string;
}

export default function CartClient() {
  const { cart, removeFromCart, updateQuantity: updateQuantityContext, clearCart } = useCart();
  const { locale } = useI18n();
  const [showConfirm, setShowConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const t = {
    fr: {
      title: 'Votre Panier',
      empty: 'Votre panier est vide',
      continueShopping: 'Continuer les achats',
      product: 'Produit',
      price: 'Prix unitaire',
      quantity: 'Quantité',
      total: 'Total',
      remove: 'Supprimer',
      subtotal: 'Sous-total',
      delivery: 'Livraison',
      free: 'Gratuit',
      orderTotal: 'Total de la commande',
      checkout: 'Valider la commande',
      stock: 'Stock disponible',
      minOrder: 'Minimum',
      update: 'Mettre à jour',
      paymentMethods: 'Paiement par Orange Money ou MTN Mobile Money',
      confirmRemove: 'Êtes-vous sûr de vouloir supprimer cet article du panier ?',
      cancel: 'Annuler',
      confirm: 'Supprimer'
    },
    en: {
      title: 'Your Cart',
      empty: 'Your cart is empty',
      continueShopping: 'Continue shopping',
      product: 'Product',
      price: 'Unit price',
      quantity: 'Quantity',
      total: 'Total',
      remove: 'Remove',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      free: 'Free',
      orderTotal: 'Order total',
      checkout: 'Proceed to checkout',
      stock: 'Stock available',
      minOrder: 'Minimum',
      update: 'Update',
      paymentMethods: 'Payment by Orange Money or MTN Mobile Money',
      confirmRemove: 'Are you sure you want to remove this item from cart?',
      cancel: 'Cancel',
      confirm: 'Remove'
    }
  }[locale];

  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price || 0) * item.quantity, 0);
  const deliveryFee = subtotal > 500000 ? 0 : 1500;
  const total = subtotal + deliveryFee;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              {t.title}
            </h1>
            <p className="text-blue-100 text-lg">
              {cart.length} {cart.length === 1 ? (locale === 'fr' ? 'article' : 'item') : (locale === 'fr' ? 'articles' : 'items')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {cart.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-4">{t.empty}</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.continueShopping}
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-5">
                {cart.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 lg:gap-5">
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-md">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        {item.laboratory && (
                          <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 sm:mb-2">{item.laboratory}</p>
                        )}
                        <h3 className="font-bold text-base sm:text-xl text-zinc-900 dark:text-white mb-1 sm:mb-2 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-sm sm:text-base font-medium text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4">
                          {item.price ? `${item.price.toLocaleString()} FCFA / unité` : 'Prix non disponible'}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex items-center border-2 border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                            <button
                              onClick={() => updateQuantityContext(item.id, item.quantity - 1)}
                              className="px-3 sm:px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-base sm:text-lg transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantityContext(item.id, parseInt(e.target.value) || 1)}
                              className="w-14 sm:w-20 text-center py-2 bg-transparent border-x border-zinc-200 dark:border-zinc-700 font-bold text-base sm:text-lg"
                            />
                            <button
                              onClick={() => updateQuantityContext(item.id, item.quantity + 1)}
                              className="px-3 sm:px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-base sm:text-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setItemToRemove(item.id);
                              setShowConfirm(true);
                            }}
                            className="p-2 sm:p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl lg:rounded-2xl border-2 border-transparent hover:border-red-300 dark:hover:border-red-400 transition-all"
                            title={t.remove}
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>

                          {/* Total - Show below controls on mobile, right on larger screens */}
                          <div className="ml-auto text-right sm:hidden">
                            <p className="font-bold text-lg text-zinc-900 dark:text-white">
                              {item.price ? `${(item.price * item.quantity).toLocaleString()} FCFA` : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {item.stock && item.quantity >= item.stock && (
                          <p className="text-xs sm:text-sm font-semibold text-amber-600 mt-2 sm:mt-3 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            {t.stock}: {item.stock}
                          </p>
                        )}
                      </div>

                      {/* Total - Show on right for larger screens */}
                      <div className="hidden sm:block text-right">
                        <p className="font-bold text-xl sm:text-2xl text-zinc-900 dark:text-white">
                          {item.price ? `${(item.price * item.quantity).toLocaleString()} FCFA` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400 font-semibold hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {t.continueShopping}
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 order-first lg:order-last">
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl lg:rounded-3xl p-5 lg:p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl sticky top-20 lg:top-24">
                  <h2 className="text-xl lg:text-2xl font-bold text-zinc-900 dark:text-white mb-5 lg:mb-8">
                    {t.orderTotal}
                  </h2>

                  <div className="space-y-4 lg:space-y-5 mb-6 lg:mb-8">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 text-sm lg:text-base">
                      <span className="font-medium">{t.subtotal}</span>
                      <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400 text-sm lg:text-base">
                      <span className="font-medium">{t.delivery}</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                        {deliveryFee === 0 ? t.free : `${deliveryFee.toLocaleString()} FCFA`}
                      </span>
                    </div>
                    <div className="border-t-2 border-zinc-200 dark:border-zinc-800 pt-4 lg:pt-5">
                      <div className="flex justify-between">
                        <span className="font-bold text-lg lg:text-xl text-zinc-900 dark:text-white">{t.orderTotal}</span>
                        <span className="font-bold text-2xl lg:text-3xl text-zinc-900 dark:text-white">
                          {total.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                      {t.paymentMethods}
                    </p>
                    <button
                      onClick={() => {
                        if (window.confirm(locale === 'fr' ? 'Voulez-vous vraiment vider le panier ?' : 'Do you really want to clear the cart?')) {
                          clearCart();
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-red-300 dark:border-red-400 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      {locale === 'fr' ? 'Vider le panier' : 'Clear cart'}
                    </button>
                    <Link
                      href="/checkout"
                      className="w-full flex items-center justify-center gap-3 py-3 lg:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all text-sm lg:text-base"
                    >
                      {t.checkout}
                      <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
              {locale === 'fr' ? 'Confirmation' : 'Confirmation'}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t.confirmRemove}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setItemToRemove(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  if (itemToRemove) {
                    removeFromCart(itemToRemove);
                  }
                  setShowConfirm(false);
                  setItemToRemove(null);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
