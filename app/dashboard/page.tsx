import Link from 'next/link';
import { requireAuth, logout } from '../actions/auth';

export const dynamic = 'force-dynamic';
import { Home, ShoppingBag, Package, Heart, LogOut, PlusCircle, Search, User, FileText, Star, MessageSquare, Mail, Phone, Calendar } from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-lg font-bold text-zinc-900">ADS</span>
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-blue-600"><Home className="w-4 h-4" /> Accueil</Link>
              <Link href="#" className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"><ShoppingBag className="w-4 h-4" /> Produits</Link>
              <Link href="#" className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"><Package className="w-4 h-4" /> Commandes</Link>
              <Link href="#" className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"><Heart className="w-4 h-4" /> Favoris</Link>
            </nav>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">
                Bonjour, <span className="font-medium text-zinc-900">{user.first_name}</span>
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase border border-zinc-200 px-4 py-2 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Déconnexion
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-2">Bienvenue, {user.first_name} !</h1>
          <p className="text-blue-100">Découvrez les meilleures annonces sur ADS</p>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          {[
            { label: 'Mes annonces', value: '0', Icon: FileText },
            { label: 'Favoris', value: '0', Icon: Heart },
            { label: 'Messages', value: '0', Icon: MessageSquare },
            { label: 'Commandes', value: '0', Icon: Package },
          ].map(({ label, value, Icon }) => (
            <div 
              key={label}
              className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-zinc-900">{value}</span>
              </div>
              <p className="text-sm text-zinc-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Link href="#" className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <PlusCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Déposer une annonce</h3>
            <p className="text-sm text-zinc-500">Vendez vos articles en quelques clics</p>
          </Link>
          <Link href="#" className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Rechercher</h3>
            <p className="text-sm text-zinc-500">Trouvez ce que vous cherchez</p>
          </Link>
          <Link href="#" className="bg-white border border-zinc-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-1">Mon profil</h3>
            <p className="text-sm text-zinc-500">Gérez vos informations personnelles</p>
          </Link>
        </div>

        {/* Profile card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Mes informations</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Nom complet</label>
                <p className="text-zinc-900">{user.first_name} {user.last_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Email</label>
                <p className="text-zinc-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-wider block mb-1">Téléphone</label>
                <p className="text-zinc-900">{user.phone || '—'}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <p className="text-xs text-zinc-400">
              Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
