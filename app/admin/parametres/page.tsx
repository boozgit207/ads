'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { 
  Save, 
  Truck, 
  BarChart3, 
  Globe, 
  Shield,
  Bell,
  CreditCard,
  Settings
} from 'lucide-react';

export default function ParametresPage() {
  const [deliveryPrice, setDeliveryPrice] = useState('2000');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Save settings:', { deliveryPrice, googleAnalyticsId, notificationsEnabled, maintenanceMode });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex">
        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <Sidebar />
        
        <div className="flex-1 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center text-white shadow-lg shadow-slate-500/30">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Paramètres
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            <div className="max-w-3xl space-y-6">
              {/* Delivery settings */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Livraison</h2>
                </div>
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Prix de livraison (FCFA)
                    </label>
                    <input
                      type="number"
                      value={deliveryPrice}
                      onChange={(e) => setDeliveryPrice(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                      placeholder="2000"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      Ce prix s'affichera sur la plateforme pour tous les clients
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </form>
              </div>

              {/* Google Analytics */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Google Analytics</h2>
                </div>
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Google Analytics ID
                    </label>
                    <input
                      type="text"
                      value={googleAnalyticsId}
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      Format: G-XXXXXXXXXX (ex: G-XXXXXXXXXX)
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-300 font-semibold">
                      Comment trouver votre ID Google Analytics :
                    </p>
                    <ol className="text-sm text-blue-800 dark:text-blue-400 mt-2 list-decimal list-inside space-y-1">
                      <li>Connectez-vous à Google Analytics</li>
                      <li>Sélectionnez votre propriété</li>
                      <li>Allez dans Admin &gt; Paramètres de la propriété</li>
                      <li>Le tracking ID est affiché dans la section "Tracking"</li>
                    </ol>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </form>
              </div>

              {/* Notifications */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Notifications</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">Notifications par email</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Recevoir les notifications de nouvelles commandes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Site settings */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Site</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">Mode maintenance</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Désactiver temporairement le site pour les utilisateurs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Payment settings */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Paiement</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <p className="font-semibold text-zinc-900 dark:text-white">Moyens de paiement acceptés</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Mobile Money (Orange Money, MTN MoMo), Carte bancaire</p>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Sécurité</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <p className="font-semibold text-zinc-900 dark:text-white">Authentification à deux facteurs</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Non configuré</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
