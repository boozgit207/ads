'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { 
  Search, 
  Check, 
  X, 
  Trash2,
  Star,
  Filter,
  Calendar,
  User,
  TrendingUp,
  Sparkles,
  Package,
  Clock
} from 'lucide-react';

interface Review {
  id: string;
  produit_id: string;
  user_id: string;
  note: number;
  titre: string | null;
  commentaire: string | null;
  statut: 'en_attente' | 'approuve' | 'rejete';
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
  };
  produit?: {
    nom: string;
  };
}

const statusConfig = {
  en_attente: { label: 'En attente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  approuve: { label: 'Approuvé', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

export default function AvisPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'en_attente' | 'approuve' | 'rejete'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = (r.user?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.user?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.produit?.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.commentaire || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || r.statut === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = reviews.filter(r => r.statut === 'en_attente').length;
  const approvedCount = reviews.filter(r => r.statut === 'approuve').length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length).toFixed(1)
    : '0';

  const handleApprove = async (id: string) => {
    if (confirm('Approuver cet avis ? Il sera visible sur le site.')) {
      try {
        const response = await fetch('/api/admin/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, statut: 'approuve' }),
        });
        if (response.ok) {
          fetchReviews();
        }
      } catch (error) {
        console.error('Error approving review:', error);
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm('Rejeter cet avis ? Il ne sera pas visible sur le site.')) {
      try {
        const response = await fetch('/api/admin/reviews', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, statut: 'rejete' }),
        });
        if (response.ok) {
          fetchReviews();
        }
      } catch (error) {
        console.error('Error rejecting review:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cet avis définitivement ?')) {
      try {
        const response = await fetch(`/api/admin/reviews?id=${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchReviews();
        }
      } catch (error) {
        console.error('Error deleting review:', error);
      }
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                      Avis et commentaires
                    </h1>
                    {pendingCount > 0 && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        {pendingCount} avis en attente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid gap-6 sm:grid-cols-4 mb-8">
                  {[
                    { label: 'Total avis', value: reviews.length, Icon: Star, gradient: 'from-blue-500 to-cyan-500', color: 'blue' },
                    { label: 'En attente', value: pendingCount, Icon: Clock, gradient: 'from-amber-500 to-orange-500', color: 'amber' },
                    { label: 'Approuvés', value: approvedCount, Icon: Check, gradient: 'from-green-500 to-emerald-500', color: 'green' },
                    { label: 'Note moyenne', value: `${averageRating}/5`, Icon: TrendingUp, gradient: 'from-purple-500 to-pink-500', color: 'purple' },
                  ].map(({ label, value, Icon, gradient, color }) => (
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

                {/* Filters */}
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-6 mb-8">
                  <div className="flex gap-4 flex-wrap items-center">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un avis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      {(['all', 'en_attente', 'approuve'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            filter === f 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {f === 'all' ? 'Tous' : statusConfig[f as keyof typeof statusConfig].label}
                        </button>
                      ))}
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm px-4 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>

                {/* Reviews list */}
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < review.note ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-300 dark:text-zinc-600'}`}
                                />
                              ))}
                            </div>
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${(statusConfig[review.statut as keyof typeof statusConfig] || statusConfig.en_attente).color}`}>
                              {(statusConfig[review.statut as keyof typeof statusConfig] || statusConfig.en_attente).label}
                            </span>
                          </div>
                          {review.titre && (
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{review.titre}</h3>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="w-4 h-4 text-zinc-400" />
                            <p className="font-medium text-zinc-700 dark:text-zinc-300">{review.produit?.nom || 'Produit inconnu'}</p>
                          </div>
                          {review.commentaire && (
                            <p className="text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">{review.commentaire}</p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {(review.user?.first_name?.[0] || '') + (review.user?.last_name?.[0] || '')}
                              </div>
                              <span className="font-medium">{review.user?.first_name} {review.user?.last_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(review.created_at).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {review.statut === 'en_attente' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all"
                              >
                                <Check className="w-4 h-4" />
                                Approuver
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all"
                              >
                                <X className="w-4 h-4" />
                                Rejeter
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="flex items-center gap-2 px-5 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredReviews.length === 0 && (
                    <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-16 text-center">
                      <Star className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400 text-lg">Aucun avis trouvé</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
