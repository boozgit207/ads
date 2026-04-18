'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { showToast } from '../../components/Toast';
import { listProduits, ajusterStock } from '../actions/catalogue-simple';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download,
  X,
  Package,
  AlertTriangle,
  ArrowUpDown,
  Image as ImageIcon,
  Boxes,
  Bell,
  Tag,
  CheckCircle2
} from 'lucide-react';

export default function StocksPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
  }, []);

  const [sortBy, setSortBy] = useState<'name' | 'stock-asc' | 'stock-desc' | 'alert'>('alert');

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await listProduits();
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply sorting
  const sortedStocks = (products: any[]) => {
    switch (sortBy) {
      case 'name':
        return [...products].sort((a, b) => a.nom.localeCompare(b.nom));
      case 'stock-asc':
        return [...products].sort((a, b) => (a.quantite_stock || 0) - (b.quantite_stock || 0));
      case 'stock-desc':
        return [...products].sort((a, b) => (b.quantite_stock || 0) - (a.quantite_stock || 0));
      case 'alert':
      default:
        // Alert first, then by stock ascending
        return [...products].sort((a, b) => {
          const aAlert = (a.quantite_stock || 0) <= (a.seuil_alerte || 0);
          const bAlert = (b.quantite_stock || 0) <= (b.seuil_alerte || 0);
          if (aAlert && !bAlert) return -1;
          if (!aAlert && bAlert) return 1;
          return (a.quantite_stock || 0) - (b.quantite_stock || 0);
        });
    }
  };

  const filteredStocks = sortedStocks(
    products.filter((s: any) =>
      (s.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const lowStockItems = filteredStocks.filter((s: any) => s.quantite_stock <= s.seuil_alerte);

  const handleAdd = () => {
    setEditingStock(null);
    setShowModal(true);
  };

  const handleEdit = (stock: any) => {
    setEditingStock(stock);
    setShowModal(true);
  };

  const handleAjusterStock = async (produitId: string, quantite: number, type: 'entree' | 'sortie' | 'inventaire', note?: string, seuilAlerte?: number) => {
    try {
      await ajusterStock(produitId, quantite, type as any, note, seuilAlerte);
      await loadStocks();
      setShowModal(false);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      showToast('Erreur lors de l\'ajustement du stock', 'error');
    }
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Gestion des stocks
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-4 mb-8">
              {[
                { label: 'Total produits', value: filteredStocks.length, Icon: Package, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'En stock', value: filteredStocks.filter((s: any) => s.quantite_stock > s.seuil_alerte).length, Icon: CheckCircle2, gradient: 'from-green-500 to-emerald-500' },
                { label: 'Stock faible', value: filteredStocks.filter((s: any) => s.quantite_stock <= s.seuil_alerte && s.quantite_stock > 0).length, Icon: AlertTriangle, gradient: 'from-orange-500 to-amber-500' },
                { label: 'Épuisé', value: filteredStocks.filter((s: any) => s.quantite_stock <= 0).length, Icon: X, gradient: 'from-red-500 to-rose-500' },
              ].map(({ label, value, Icon, gradient }) => (
                <div 
                  key={label}
                  className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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
                </div>
              ))}
            </div>

            {/* Alert for low stock */}
            {lowStockItems.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-200">Alerte stock faible</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{lowStockItems.length} produit(s) en dessous du stock minimum</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-6 mb-8">
              <div className="flex gap-4 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 bg-white dark:bg-zinc-800">
                  <ArrowUpDown className="w-4 h-4 text-zinc-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-sm focus:outline-none dark:text-white min-w-[140px]"
                  >
                    <option value="alert">Alertes d'abord</option>
                    <option value="name">Nom A-Z</option>
                    <option value="stock-asc">Stock croissant</option>
                    <option value="stock-desc">Stock décroissant</option>
                  </select>
                </div>
                {(searchTerm || sortBy !== 'alert') && (
                  <button
                    onClick={() => { setSearchTerm(''); setSortBy('alert'); }}
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm px-3 py-2"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Stocks table */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Produit</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Boxes className="w-4 h-4" /> Qté</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Bell className="w-4 h-4" /> Alerte</div>
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">
                        <div className="flex items-center gap-2"><Tag className="w-4 h-4" /> Statut</div>
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-zinc-500 dark:text-zinc-400">Chargement...</p>
                        </td>
                      </tr>
                    ) : filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <Boxes className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-500 dark:text-zinc-400">Aucun stock trouvé</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStocks.map((stock: any) => (
                        <tr key={stock.id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${stock.quantite_stock <= stock.seuil_alerte ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {stock.image_principale_url ? (
                                <img 
                                  src={stock.image_principale_url} 
                                  alt={stock.nom}
                                  className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30 ${stock.image_principale_url ? 'hidden' : ''}`}>
                                {stock.nom?.[0] || 'P'}
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{stock.nom}</span>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{stock.categories?.nom || '-'} • {stock.categories?.laboratoires?.nom || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-lg font-bold ${stock.quantite_stock <= stock.seuil_alerte ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>
                              {stock.quantite_stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{stock.seuil_alerte}</td>
                          <td className="px-6 py-4">
                            {(() => {
                              const qte = stock.quantite_stock || 0;
                              const seuil = stock.seuil_alerte || 0;
                              if (qte <= 0) {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                    <X className="w-3 h-3" /> Épuisé
                                  </span>
                                );
                              } else if (qte <= seuil) {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                    <AlertTriangle className="w-3 h-3" /> Critique
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    <CheckCircle2 className="w-3 h-3" /> OK
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(stock)}
                                className="p-2.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                title="Ajuster le stock"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Ajuster Stock */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-blue-600" />
                      Modifier le stock - {editingStock?.nom}
                    </h2>
                    <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    handleAjusterStock(
                      editingStock.id,
                      parseInt(fd.get('quantite_stock') as string),
                      'inventaire',
                      fd.get('note') as string,
                      parseInt(fd.get('seuil_alerte') as string)
                    );
                  }} className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Quantité en stock</label>
                      <input 
                        name="quantite_stock" 
                        type="number" 
                        min="0"
                        defaultValue={editingStock?.quantite_stock || 0}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Seuil d'alerte</label>
                      <input 
                        name="seuil_alerte" 
                        type="number" 
                        min="0"
                        defaultValue={editingStock?.seuil_alerte || 0}
                        className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Note (optionnel)</label>
                      <textarea name="note" rows={2} className="w-full border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all resize-none" placeholder="Raison de la modification..." />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Annuler</button>
                      <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">Enregistrer</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
