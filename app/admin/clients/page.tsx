'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { 
  listClients, 
  getClientsStats,
  type Client 
} from '../actions/clients';
import { 
  Search, 
  Download,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Users,
  Crown,
  UserPlus,
  Eye,
  CreditCard,
  VenetianMask
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0, thisMonth: 0 });
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const [clientsData, statsData] = await Promise.all([
        listClients(searchTerm || undefined),
        getClientsStats()
      ]);
      setClients(clientsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Email', 'Prénom', 'Nom', 'Téléphone', 'Rôle', 'Date inscription'].join(','),
      ...clients.map(c => [
        c.id,
        c.email,
        c.first_name || '',
        c.last_name || '',
        c.phone || '',
        c.role,
        new Date(c.created_at).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const getFullName = (client: Client) => {
    const parts = [];
    if (client.first_name) parts.push(client.first_name);
    if (client.last_name) parts.push(client.last_name);
    return parts.join(' ') || 'Sans nom';
  };

  const getGenderLabel = (gender?: string | null) => {
    switch (gender) {
      case 'male': return 'Homme';
      case 'female': return 'Femme';
      case 'other': return 'Autre';
      default: return 'Non précisé';
    }
  };

  const getGenderIcon = (gender?: string | null) => {
    switch (gender) {
      case 'male': return '♂';
      case 'female': return '♀';
      default: return '○';
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                      <Users className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                      Gestion des clients
                    </h1>
                  </div>
                </div>
              </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
              {/* Stats - Admins séparés des clients */}
              <div className="grid gap-6 sm:grid-cols-4 mb-8">
                {[
                  { 
                    label: 'Total inscrits', 
                    value: stats.total, 
                    Icon: Users,
                    gradient: 'from-blue-500 to-cyan-500' 
                  },
                  { 
                    label: 'Clients', 
                    value: stats.users, 
                    Icon: User,
                    gradient: 'from-green-500 to-emerald-500' 
                  },
                  { 
                    label: 'Admins', 
                    value: stats.admins, 
                    Icon: Crown,
                    gradient: 'from-purple-500 to-pink-500' 
                  },
                  { 
                    label: 'Nouveaux ce mois', 
                    value: stats.thisMonth, 
                    Icon: UserPlus,
                    gradient: 'from-orange-500 to-amber-500' 
                  },
                ].map((stat) => (
                  <div key={stat.label} className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity rounded-full -translate-y-1/2 translate-x-1/2`}></div>
                    <div className="relative z-10">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg mb-4`}>
                        <stat.Icon className="w-6 h-6" />
                      </div>
                      <div className="mb-1">
                        <span className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">{stat.value}</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-6 mb-8">
                <div className="flex gap-4 flex-wrap items-center">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white transition-all"
                    />
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </button>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="flex items-center gap-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-sm px-3 py-2"
                    >
                      <X className="w-4 h-4" />
                      Réinitialiser
                    </button>
                  )}
                </div>
              </div>

              {/* Clients table */}
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Avatar</th>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Prénom</th>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Nom</th>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Sexe</th>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Contact</th>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Rôle</th>
                        <th className="text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Inscription</th>
                        <th className="text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-zinc-500 dark:text-zinc-400">Chargement...</p>
                          </td>
                        </tr>
                      ) : clients.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center">
                            <Users className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                            <p className="text-zinc-500 dark:text-zinc-400">{searchTerm ? 'Aucun client trouvé' : 'Aucun client inscrit'}</p>
                          </td>
                        </tr>
                      ) : (
                        clients.map((client) => (
                          <tr key={client.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-4">
                              {client.avatar ? (
                                <img 
                                  src={client.avatar} 
                                  alt={getFullName(client)}
                                  className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-lg"
                                />
                              ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                                  client.role === 'admin' 
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30' 
                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                                }`}>
                                  {getInitials(client.first_name, client.last_name)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {client.first_name || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {client.last_name || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xl" title={getGenderLabel(client.gender)}>
                                {getGenderIcon(client.gender)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                  <Mail className="w-4 h-4 text-zinc-400" />
                                  <span className="truncate max-w-[150px]">{client.email}</span>
                                </div>
                                {client.phone && (
                                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                    <Phone className="w-4 h-4 text-zinc-400" />
                                    {client.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                client.role === 'admin' 
                                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}>
                                {client.role === 'admin' ? (
                                  <><Shield className="w-3 h-3" /> Admin</>
                                ) : (
                                  <><User className="w-3 h-3" /> Client</>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-400" />
                                {new Date(client.created_at).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short'
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleViewDetails(client)}
                                className="p-2.5 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                title="Voir détails"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {!loading && clients.length > 0 && (
                  <div className="px-6 py-4 border-t border-zinc-200/50 dark:border-zinc-800/50 text-sm text-zinc-500 dark:text-zinc-400">
                    Affichage de {clients.length} utilisateur{clients.length > 1 ? 's' : ''} 
                    ({clients.filter(c => c.role === 'user').length} clients, {clients.filter(c => c.role === 'admin').length} admins)
                  </div>
                )}
              </div>
          </main>
        </div>

        {/* Modal Détails Client */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  {selectedClient.avatar ? (
                    <img 
                      src={selectedClient.avatar} 
                      alt={getFullName(selectedClient)}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    />
                  ) : (
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white/30 shadow-2xl ${
                      selectedClient.role === 'admin' 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                        : 'bg-white/20'
                    }`}>
                      {getInitials(selectedClient.first_name, selectedClient.last_name)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-xl">{getFullName(selectedClient)}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedClient.role === 'admin' 
                        ? 'bg-purple-500/50 text-white' 
                        : 'bg-white/30 text-white'
                    }`}>
                      {selectedClient.role === 'admin' ? <><Shield className="w-3 h-3" /> Admin</> : 'Client'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  {/* Prénom */}
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Prénom</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedClient.first_name || '-'}</p>
                    </div>
                  </div>

                  {/* Nom */}
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Nom</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedClient.last_name || '-'}</p>
                    </div>
                  </div>

                  {/* Sexe */}
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <VenetianMask className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Sexe</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        <span className="mr-2 text-xl">{getGenderIcon(selectedClient.gender)}</span>
                        {getGenderLabel(selectedClient.gender)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Email</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedClient.email}</p>
                    </div>
                  </div>

                  {selectedClient.phone && (
                    <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                      <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Téléphone</p>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedClient.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Inscrit le</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {new Date(selectedClient.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                    <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">ID Client</p>
                      <p className="text-sm font-mono text-zinc-900 dark:text-white">{selectedClient.id}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
