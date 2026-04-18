'use client';

import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { logout } from '../../actions/auth';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Sparkles } from 'lucide-react';

// Données de démonstration (à remplacer par les vraies données depuis Supabase)
const salesData = [
  { name: 'Jan', ventes: 4000, commandes: 240 },
  { name: 'Fév', ventes: 3000, commandes: 139 },
  { name: 'Mar', ventes: 2000, commandes: 180 },
  { name: 'Avr', ventes: 2780, commandes: 208 },
  { name: 'Mai', ventes: 1890, commandes: 140 },
  { name: 'Jun', ventes: 2390, commandes: 170 },
];

const productData = [
  { name: 'Catégorie A', value: 400 },
  { name: 'Catégorie B', value: 300 },
  { name: 'Catégorie C', value: 300 },
  { name: 'Catégorie D', value: 200 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const stats = [
  { label: 'Produits', value: '0', change: '+12%', positive: true, icon: Package },
  { label: 'Stocks', value: '0', change: '-5%', positive: false, icon: Package },
  { label: 'Commandes', value: '0', change: '+8%', positive: true, icon: ShoppingCart },
  { label: 'Clients', value: '0', change: '+15%', positive: true, icon: Users },
  { label: 'Total vendu', value: '0 FCFA', change: '+20%', positive: true, icon: DollarSign },
];

export default function StatistiquesPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64 transition-all duration-300">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Statistiques
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <LanguageSwitcher />
                  <form action={logout}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase border border-zinc-200 dark:border-zinc-700 px-4 py-2 rounded-xl hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-lg"
                    >
                      Déconnexion
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Stats cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.label}
                    className="group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.positive ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'} opacity-10 group-hover:opacity-20 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.positive ? 'from-blue-500 to-cyan-500' : 'from-orange-500 to-red-500'} text-white shadow-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          stat.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {stat.change}
                        </div>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">{stat.value}</p>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Sales chart */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Évolution des ventes
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="ventes" stroke="#3b82f6" strokeWidth={3} name="Ventes (FCFA)" dot={{ fill: '#3b82f6', r: 4 }} />
                    <Line type="monotone" dataKey="commandes" stroke="#10b981" strokeWidth={3} name="Commandes" dot={{ fill: '#10b981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Products by category */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Produits par catégorie
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Orders chart */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Commandes par mois
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="commandes" fill="#3b82f6" name="Commandes" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Filtres de période
              </h2>
              <div className="flex gap-4 flex-wrap">
                <select className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:text-white transition-all">
                  <option>Derniers 7 jours</option>
                  <option>Derniers 30 jours</option>
                  <option>Derniers 3 mois</option>
                  <option>Dernière année</option>
                  <option>Personnalisé</option>
                </select>
                <input 
                  type="date" 
                  className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:text-white transition-all"
                />
                <input 
                  type="date" 
                  className="border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-zinc-800 dark:text-white transition-all"
                />
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200">
                  Appliquer
                </button>
                <button className="border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                  Réinitialiser
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
