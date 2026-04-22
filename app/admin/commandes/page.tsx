'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  X,
  Calendar,
  User,
  MapPin,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  XCircle as XCircleIcon,
  Truck,
  Loader2,
  CreditCard
} from 'lucide-react';
import { getAllOrders, updateOrderStatus, getOrderStats } from '../../actions/orders';

interface Order {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_prenom: string;
  client_email: string;
  client_phone: string;
  adresse_livraison: string;
  ville_livraison: string;
  created_at: string;
  total_commande: number;
  statut: string;
  commande_items?: any[];
  methode_paiement?: string;
  paiements?: any[];
}

const statusConfig: Record<string, { label: string; color: string; gradient: string; Icon: any }> = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', gradient: 'from-yellow-500 to-amber-500', Icon: Clock },
  paiement_recu: { label: 'Payé', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', gradient: 'from-blue-500 to-cyan-500', Icon: CheckCircle2 },
  en_cours: { label: 'En cours', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', gradient: 'from-indigo-500 to-purple-500', Icon: Truck },
  livree: { label: 'Livrée', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', gradient: 'from-green-500 to-emerald-500', Icon: CheckCircle },
  annulee: { label: 'Annulée', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', gradient: 'from-red-500 to-rose-500', Icon: XCircleIcon },
  valide: { label: 'Validée', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300', gradient: 'from-teal-500 to-cyan-500', Icon: CheckCircle },
  // Anciens statuts pour compatibilité
  payee: { label: 'Payé', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', gradient: 'from-blue-500 to-cyan-500', Icon: CheckCircle2 },
  annule: { label: 'Annulé', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', gradient: 'from-red-500 to-rose-500', Icon: XCircleIcon },
};

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    paiement_recu: 0,
    en_cours: 0,
    livree: 0,
    annulee: 0,
    valide: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 10 seconds without loading indicator
    const interval = setInterval(() => {
      loadOrdersSilent();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [ordersResult, statsResult] = await Promise.all([
        getAllOrders(),
        getOrderStats(),
      ]);

      console.log('Résultat commandes:', ordersResult);
      console.log('Résultat stats:', statsResult);

      if (ordersResult.success && ordersResult.orders) {
        setOrders(ordersResult.orders);
      } else {
        setError(ordersResult.error || 'Erreur lors du chargement des commandes');
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (err: any) {
      console.error('Erreur loadOrders:', err);
      setError(err.message || 'Erreur inattendue');
    }

    setLoading(false);
  };

  const loadOrdersSilent = async () => {
    try {
      const [ordersResult, statsResult] = await Promise.all([
        getAllOrders(),
        getOrderStats(),
      ]);

      if (ordersResult.success && ordersResult.orders) {
        setOrders(ordersResult.orders);
      }

      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (err: any) {
      console.error('Erreur loadOrdersSilent:', err);
    }
  };

  const filteredOrders = orders.filter((o: Order) => {
    const customerName = `${o.client_prenom || ''} ${o.client_nom || ''}`.toLowerCase();
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) || 
                         o.numero_commande?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || o.statut === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleValidate = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir valider cette commande ?')) {
      const result = await updateOrderStatus(id, 'valide');
      if (result.success) {
        await loadOrders();
      } else {
        alert('Erreur lors de la validation: ' + result.error);
      }
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      const result = await updateOrderStatus(id, 'annulee');
      if (result.success) {
        await loadOrders();
      } else {
        alert('Erreur lors de l\'annulation: ' + result.error);
      }
    }
  };

  const handleExport = () => {
    // Export CSV
    const csvContent = [
      ['ID', 'Numéro', 'Client', 'Email', 'Téléphone', 'Adresse', 'Total', 'Statut', 'Date'].join(','),
      ...orders.map(o => [
        o.id,
        o.numero_commande,
        `${o.client_prenom || ''} ${o.client_nom || ''}`,
        o.client_email || '',
        o.client_phone || '',
        `${o.adresse_livraison || ''}, ${o.ville_livraison || ''}`,
        o.total_commande || 0,
        o.statut,
        new Date(o.created_at).toLocaleDateString('fr-FR'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <Package className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Gestion des commandes
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Stats summary */}
            <div className="grid gap-6 sm:grid-cols-4 mb-8">
              {[
                { label: 'En attente', value: stats.en_attente, Icon: Clock, gradient: 'from-yellow-500 to-amber-500', statusFilter: 'en_attente' },
                { label: 'Payées', value: stats.paiement_recu || 0, Icon: CheckCircle2, gradient: 'from-blue-500 to-cyan-500', statusFilter: 'paiement_recu' },
                { label: 'Validées', value: (stats.valide || 0) + (stats.livree || 0), Icon: CheckCircle, gradient: 'from-green-500 to-emerald-500', statusFilter: 'valide' },
                { label: 'Annulées', value: stats.annulee || 0, Icon: XCircleIcon, gradient: 'from-red-500 to-rose-500', statusFilter: 'annulee' },
              ].map(({ label, value, Icon, gradient, statusFilter }) => (
                <button
                  key={label}
                  onClick={() => setSelectedStatus(selectedStatus === statusFilter ? '' : statusFilter)}
                  className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left ${
                    selectedStatus === statusFilter 
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' 
                      : 'border-zinc-200/50 dark:border-zinc-800/50'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                  <div className="relative z-10">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">{value}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-6 mb-8">
              <div className="flex gap-4 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une commande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 bg-white dark:bg-zinc-800">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none dark:text-white min-w-[140px]"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="paiement_recu">Payée</option>
                    <option value="en_cours">En cours</option>
                    <option value="valide">Validée</option>
                    <option value="livree">Livrée</option>
                    <option value="annulee">Annulée</option>
                  </select>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                {(searchTerm || selectedStatus) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedStatus('');
                    }}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm px-3 py-2"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 dark:text-red-200 font-medium">Erreur de chargement</p>
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                    <button
                      onClick={() => loadOrders()}
                      className="mt-3 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders table */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Commande
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Client
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Date
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Total
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Paiement
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Statut
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                          <p className="text-zinc-500 dark:text-zinc-400">Chargement des commandes...</p>
                        </td>
                      </tr>
                    ) : filteredOrders.map((order: Order) => (
                      <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">{order.numero_commande || order.id.slice(0, 8)}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{order.commande_items?.length || 0} article(s)</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-zinc-900 dark:text-white">{order.client_prenom} {order.client_nom}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">{order.client_email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">
                          {(order.total_commande || 0).toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4">
                          {order.paiements && order.paiements.length > 0 ? (
                            <div className="space-y-1">
                              {order.paiements.map((payment: any) => (
                                <div key={payment.id} className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                    payment.statut === 'confirme' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                    payment.statut === 'en_attente' || payment.statut === 'en_cours' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  }">
                                    {payment.statut === 'confirme' ? '✓' : payment.statut === 'en_attente' || payment.statut === 'en_cours' ? '⏳' : '✗'}
                                  </span>
                                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                    {payment.methode === 'orange_money' ? 'Orange Money' :
                                     payment.methode === 'mtn_mobile_money' ? 'MTN Mobile Money' :
                                     payment.methode === 'virement_bancaire' ? 'Virement' :
                                     payment.methode}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 dark:text-zinc-500">Non payé</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig[order.statut as keyof typeof statusConfig]?.color}`}>
                            {(() => {
                              const Icon = statusConfig[order.statut as keyof typeof statusConfig]?.Icon;
                              return Icon ? <Icon className="w-3 h-3" /> : null;
                            })()}
                            {statusConfig[order.statut as keyof typeof statusConfig]?.label || order.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(order)}
                              className="p-2.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                              title="Voir détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {(order.statut === 'paiement_recu' || order.statut === 'en_attente') && (
                              <button
                                onClick={() => handleValidate(order.id)}
                                className="p-2.5 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
                                title="Valider"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            {(order.statut === 'en_attente' || order.statut === 'paiement_recu') && (
                              <button
                                onClick={() => handleCancel(order.id)}
                                className="p-2.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                title="Annuler"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <Package className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">Aucune commande trouvée</p>
                          {orders.length > 0 ? (
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-4">
                              {orders.length} commande(s) existent mais ne correspondent pas aux filtres actuels.
                            </p>
                          ) : (
                            <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-4">
                              La base de données ne contient aucune commande.
                            </p>
                          )}
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedStatus('');
                              loadOrders();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Réinitialiser et recharger
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {filteredOrders.length > 0 ? (
                  <>Affichage de 1 à {filteredOrders.length} sur {orders.length} commande{orders.length > 1 ? 's' : ''}</>
                ) : (
                  <>Aucune commande à afficher (sur {orders.length} total)</>
                )}
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>
                  Précédent
                </button>
                <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50" disabled>
                  Suivant
                </button>
              </div>
            </div>
          </main>

          {/* Modal Order Details */}
          {showModal && selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Détails de la commande {selectedOrder.numero_commande || selectedOrder.id.slice(0, 8)}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {/* Customer info */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Informations client
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        {selectedOrder.client_prenom} {selectedOrder.client_nom}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.client_phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <MapPin className="w-4 h-4" />
                        {selectedOrder.adresse_livraison}, {selectedOrder.ville_livraison}
                      </div>
                    </div>
                  </div>

                  {/* Order info */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Informations commande
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        Date: {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        Statut:
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig[selectedOrder.statut as keyof typeof statusConfig]?.color}`}>
                          {(() => {
                            const Icon = statusConfig[selectedOrder.statut as keyof typeof statusConfig]?.Icon;
                            return Icon ? <Icon className="w-3 h-3" /> : null;
                          })()}
                          {statusConfig[selectedOrder.statut as keyof typeof statusConfig]?.label || selectedOrder.statut}
                        </span>
                      </div>
                      <div className="text-zinc-600 dark:text-zinc-400">
                        Total: <span className="font-bold text-zinc-900 dark:text-white">{(selectedOrder.total_commande || 0).toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment info */}
                  {selectedOrder.paiements && selectedOrder.paiements.length > 0 && (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Informations paiement
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.paiements.map((payment: any) => (
                          <div key={payment.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                {payment.methode === 'orange_money' ? 'Orange Money' :
                                 payment.methode === 'mtn_mobile_money' ? 'MTN Mobile Money' :
                                 payment.methode === 'virement_bancaire' ? 'Virement bancaire' :
                                 payment.methode}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                payment.statut === 'confirme' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                payment.statut === 'en_attente' || payment.statut === 'en_cours' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                {payment.statut === 'confirme' ? '✓ Confirmé' :
                                 payment.statut === 'en_attente' ? '⏳ En attente' :
                                 payment.statut === 'en_cours' ? '⏳ En cours' :
                                 payment.statut === 'echoue' ? '✗ Échoué' :
                                 payment.statut === 'annule' ? '✗ Annulé' : payment.statut}
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                              <div className="flex justify-between">
                                <span>Montant:</span>
                                <span className="font-medium">{payment.montant?.toLocaleString()} XAF</span>
                              </div>
                              {payment.montant_recu && (
                                <div className="flex justify-between">
                                  <span>Montant reçu:</span>
                                  <span className="font-medium">{payment.montant_recu.toLocaleString()} XAF</span>
                                </div>
                              )}
                              {payment.numero_payeur && (
                                <div className="flex justify-between">
                                  <span>Téléphone:</span>
                                  <span className="font-medium">{payment.numero_payeur}</span>
                                </div>
                              )}
                              {payment.reference_operateur && (
                                <div className="flex justify-between">
                                  <span>Référence opérateur:</span>
                                  <span className="font-mono">{payment.reference_operateur}</span>
                                </div>
                              )}
                              {payment.transaction_id && (
                                <div className="flex justify-between">
                                  <span>Transaction ID:</span>
                                  <span className="font-mono text-xs">{payment.transaction_id}</span>
                                </div>
                              )}
                              {payment.initie_le && (
                                <div className="flex justify-between">
                                  <span>Date initiation:</span>
                                  <span>{new Date(payment.initie_le).toLocaleDateString('fr-FR')}</span>
                                </div>
                              )}
                              {payment.confirme_le && (
                                <div className="flex justify-between">
                                  <span>Date confirmation:</span>
                                  <span>{new Date(payment.confirme_le).toLocaleDateString('fr-FR')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    {(selectedOrder.statut === 'paiement_recu' || selectedOrder.statut === 'en_attente') && (
                      <button
                        onClick={() => {
                          handleValidate(selectedOrder.id);
                          setShowModal(false);
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl text-sm font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Valider la commande
                      </button>
                    )}
                    {(selectedOrder.statut === 'en_attente' || selectedOrder.statut === 'paiement_recu') && (
                      <button
                        onClick={() => {
                          handleCancel(selectedOrder.id);
                          setShowModal(false);
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl text-sm font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all"
                      >
                        <XCircle className="w-4 h-4 inline mr-2" />
                        Annuler la commande
                      </button>
                    )}
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
