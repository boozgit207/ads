import Link from 'next/link';
import { requireAdmin, logout } from '../../actions/auth';
import { 
  Users, 
  FileText, 
  Package, 
  DollarSign, 
  LogOut, 
  Shield, 
  Settings, 
  ArrowRight, 
  TrendingUp, 
  Sparkles, 
  Menu,
  Activity,
  ShoppingCart,
  Clock,
  CheckCircle2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { createServerSupabaseClient } from '@/lib/supabase';

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  // Fetch real stats
  const [usersCount, productsCount, ordersCount, totalRevenue] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('produits').select('*', { count: 'exact', head: true }),
    supabase.from('commandes').select('*', { count: 'exact', head: true }),
    supabase.from('commandes').select('total').not('statut', 'eq', 'annulee')
  ]);

  const stats = {
    users: usersCount.count || 0,
    products: productsCount.count || 0,
    orders: ordersCount.count || 0,
    revenue: totalRevenue.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
  };

  // Format revenue
  const formattedRevenue = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(stats.revenue);

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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                    A
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Tableau de bord
                  </span>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-[10px] tracking-wider uppercase rounded-full font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.first_name?.[0] || 'A'}{user?.last_name?.[0] || 'D'}
                    </div>
                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hidden sm:block">
                      {user?.first_name || 'Admin'} {user?.last_name || ''}
                    </span>
                  </div>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Déconnexion</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 shadow-2xl shadow-blue-500/30">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC02LjYyNy01LjM3My0xMi0xMi0xMnMtMTIgNS4zNzMtMTIgMTJjMCA2LjYyNyA1LjM3MyAxMiAxMiAxMnMxMi01LjM3MyAxMi0xMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-7 h-7 text-yellow-300" />
                  <h1 className="text-4xl font-bold text-white">
                    Bienvenue, {user?.first_name || 'Admin'} !
                  </h1>
                </div>
                <p className="text-blue-100 text-lg mb-4">Gérez votre plateforme e-commerce ADS avec style et efficacité</p>
                <div className="flex gap-4">
                  <Link href="/admin/produits" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-all">
                    <FileText className="w-4 h-4" />
                    Produits
                  </Link>
                  <Link href="/admin/commandes" className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-all">
                    <ShoppingCart className="w-4 h-4" />
                    Commandes
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                { label: 'Utilisateurs', value: stats.users, Icon: Users, gradient: 'from-blue-500 to-cyan-500', color: 'blue', trend: '+12%' },
                { label: 'Produits', value: stats.products, Icon: FileText, gradient: 'from-purple-500 to-pink-500', color: 'purple', trend: '+5%' },
                { label: 'Commandes', value: stats.orders, Icon: Package, gradient: 'from-orange-500 to-red-500', color: 'orange', trend: '+8%' },
                { label: 'Revenus', value: formattedRevenue, Icon: DollarSign, gradient: 'from-green-500 to-emerald-500', color: 'green', trend: '+15%' },
              ].map(({ label, value, Icon, gradient, color, trend }) => (
                <div 
                  key={label}
                  className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-${color}-500/30`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                      </div>
                    </div>
                    <div className="mb-1">
                      <span className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">{value}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <Link href="/admin/produits" className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Gestion des produits</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">Ajoutez, modifiez et supprimez des produits avec catégories et laboratoires</p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      {stats.products} produits
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/commandes" className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Commandes</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">Validez ou annulez les commandes clients avec notifications en temps réel</p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {stats.orders} commandes
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/clients" className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30 group-hover:scale-110 transition-transform">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Clients</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">Gérez les comptes clients et consultez leurs informations</p>
                  <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {stats.users} utilisateurs
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/parametres" className="group relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-red-500/5 transition-colors"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl shadow-orange-500/30 group-hover:scale-110 transition-transform">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <ArrowRight className="w-6 h-6 text-zinc-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Paramètres</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">Configurez la plateforme, prix livraison et Google Analytics</p>
                </div>
              </Link>
            </div>

            {/* Recent activity */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Activité récente</h2>
                <Link href="/admin/commandes" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Voir tout
                </Link>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Package, title: 'Nouvelle commande #1234', time: 'Il y a 5 minutes', color: 'blue' },
                  { icon: Users, title: 'Nouvel utilisateur inscrit', time: 'Il y a 15 minutes', color: 'green' },
                  { icon: FileText, title: 'Produit modifié', time: 'Il y a 1 heure', color: 'purple' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <div className={`p-2 rounded-lg bg-${activity.color}-100 dark:bg-${activity.color}-900/30`}>
                      <activity.icon className={`w-5 h-5 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
