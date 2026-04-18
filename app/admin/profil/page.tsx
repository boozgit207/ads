'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { User, Mail, Phone, Calendar, Shield, Edit, Camera, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, refreshUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth context to be ready
    if (authLoading) return;

    if (!authUser) {
      // Rediriger vers la page de connexion si non authentifié
      router.push('/auth');
      return;
    }

    // Use auth context user data
    setUser({
      first_name: authUser.first_name || '',
      last_name: authUser.last_name || '',
      email: authUser.email || '',
      phone: authUser.phone || '',
      created_at: authUser.created_at || new Date().toISOString()
    });
    setLoading(false);
  }, [authUser, authLoading, router]);

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // Si pas d'utilisateur, afficher un message ou rediriger
  if (!user) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex">
          <Sidebar />
          <div className="flex-1 lg:ml-64 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                Non connecté
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Veuillez vous connecter pour accéder à votre profil.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                    <User className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Mon profil
                  </h1>
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            <div className="max-w-2xl">
              {/* Profile card */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 mb-8 shadow-xl">
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-rose-500/30">
                      {user?.first_name?.[0] || 'A'}{user?.last_name?.[0] || 'D'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                      {user?.first_name || ''} {user?.last_name || ''}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Administrateur</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Nom complet</label>
                      <p className="text-zinc-900 dark:text-white font-medium">{user.first_name || ''} {user.last_name || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Email</label>
                      <p className="text-zinc-900 dark:text-white font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Téléphone</label>
                      <p className="text-zinc-900 dark:text-white font-medium">{user.phone || 'Non renseigné'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">Membre depuis</label>
                      <p className="text-zinc-900 dark:text-white font-medium">
                        {new Date(user.created_at).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Changer le mot de passe</h3>
                </div>
                <form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
