'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../components/Toast';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  LogOut,
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { canUserDeleteOrder, getOrderStatusColor, getOrderStatusLabel } from '@/lib/order-utils';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import Link from 'next/link';

function AccountPageContent() {
  const { user, signOut } = useAuth();
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');

  useEffect(() => {
    const tab = searchParams.get('tab') as 'profile' | 'orders' | 'settings' | null;
    if (tab && ['profile', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        email: user.email || '',
        address: user.address || '',
        city: user.city || ''
      });
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const t = {
    fr: {
      title: 'Mon Compte',
      tabs: {
        profile: 'Mon Profil',
        orders: 'Mes Commandes',
        settings: 'Paramètres'
      },
      profile: {
        title: 'Informations personnelles',
        firstName: 'Prénom',
        lastName: 'Nom',
        phone: 'Téléphone',
        email: 'Email',
        address: 'Adresse',
        city: 'Ville',
        memberSince: 'Membre depuis',
        save: 'Enregistrer',
        success: 'Profil mis à jour avec succès'
      },
      orders: {
        title: 'Historique des commandes',
        noOrders: 'Aucune commande pour le moment',
        orderId: 'N° Commande',
        date: 'Date',
        total: 'Total',
        status: 'Statut',
        pending: 'En attente',
        processing: 'En cours',
        shipped: 'Expédiée',
        delivered: 'Livrée',
        cancelled: 'Annulée',
        deleteOrder: 'Supprimer',
        deleteConfirm: 'Supprimer cette commande définitivement ?',
        deleteNotAllowed: 'Seules les commandes en attente ou annulées peuvent être supprimées',
      },
      settings: {
        title: 'Paramètres',
        language: 'Langue',
        theme: 'Thème',
        notifications: 'Notifications',
        comingSoon: 'Bientôt disponible',
        password: 'Mot de passe',
        changePassword: 'Changer le mot de passe',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        passwordSuccess: 'Mot de passe mis à jour avec succès',
        passwordError: 'Erreur lors de la mise à jour du mot de passe'
      },
      logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?'
    },
    en: {
      title: 'My Account',
      tabs: {
        profile: 'My Profile',
        orders: 'My Orders',
        settings: 'Settings'
      },
      profile: {
        title: 'Personal Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        city: 'City',
        memberSince: 'Member since',
        save: 'Save',
        success: 'Profile updated successfully'
      },
      orders: {
        title: 'Order History',
        noOrders: 'No orders yet',
        orderId: 'Order #',
        date: 'Date',
        total: 'Total',
        status: 'Status',
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        deleteOrder: 'Delete',
        deleteConfirm: 'Permanently delete this order?',
        deleteNotAllowed: 'Only pending or cancelled orders can be deleted',
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        theme: 'Theme',
        notifications: 'Notifications',
        logout: 'Logout',
        logoutConfirm: 'Are you sure you want to logout?',
        password: 'Password',
        changePassword: 'Change password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        passwordSuccess: 'Password updated successfully',
        passwordError: 'Error updating password'
      }
    }
  }[locale];

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        showToast(t.profile.success, 'success');
      } else {
        showToast('Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
    setIsLoading(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage(locale === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage(locale === 'fr' ? 'Le mot de passe doit faire au moins 6 caractères' : 'Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });
      
      if (response.ok) {
        setPasswordMessage(t.settings.passwordSuccess);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast(t.settings.passwordSuccess, 'success');
      } else {
        const data = await response.json();
        setPasswordMessage(data.error || t.settings.passwordError);
        showToast(data.error || t.settings.passwordError, 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage(t.settings.passwordError);
      showToast(t.settings.passwordError, 'error');
    }
    setIsLoading(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(locale === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cette commande ?' : 'Are you sure you want to delete this order?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
      if (response.ok) {
        showToast(locale === 'fr' ? 'Commande supprimée avec succès' : 'Order deleted successfully', 'success');
        fetchOrders(); // Rafraîchir la liste des commandes
      } else {
        const data = await response.json();
        showToast(data.error || (locale === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting order'), 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast(locale === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting order', 'error');
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    if (confirm(t.settings.logoutConfirm)) {
      try {
        await signOut();
        showToast(locale === 'fr' ? 'Déconnexion réussie' : 'Logout successful', 'success');
        router.push('/');
      } catch (error) {
        showToast(locale === 'fr' ? 'Erreur lors de la déconnexion' : 'Error during logout', 'error');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'en_attente':
        return <Clock className="w-4 h-4" />;
      case 'processing':
      case 'paiement_recu':
      case 'en_preparation':
        return <Package className="w-4 h-4" />;
      case 'shipped':
      case 'expediee':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
      case 'livree':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'annulee':
      case 'remboursee':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (!user) {
    return null;
  }

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
              {user.first_name} {user.last_name}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                {/* User Info */}
                <div className="text-center mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {user.email}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t.profile.memberSince}: {user.created_at ? new Date(user.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US') : '-'}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'profile'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    {t.tabs.profile}
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'orders'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {t.tabs.orders}
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === 'settings'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    {t.tabs.settings}
                  </button>
                </nav>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-8 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  {t.settings.logout}
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.profile.title}
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.profile.firstName}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.profile.lastName}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.profile.phone}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.profile.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.profile.address}
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.profile.city}
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      <Save className="w-5 h-5" />
                      {isLoading ? '...' : t.profile.save}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.orders.title}
                  </h2>

                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="w-20 h-20 text-zinc-300 mx-auto mb-4" />
                      <p className="text-xl text-zinc-500">{t.orders.noOrders}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                          {/* Header */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Commande' : 'Order'}</span>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">#{order.numero || order.numero_commande || order.id?.substring(0, 8)}</h3>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 items-center">
                              <div className="text-right">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Date' : 'Date'}</p>
                                <p className="font-medium text-zinc-900 dark:text-white">{new Date(order.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getOrderStatusColor(order.statut)}`}>
                                {getStatusIcon(order.statut)}
                                {getOrderStatusLabel(order.statut, locale)}
                              </div>
                            </div>
                          </div>

                          {/* Items Info */}
                          <div className="flex flex-col md:flex-row gap-6 mb-6">
                            <div className="flex-1 space-y-2">
                              {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                                order.items.slice(0, 2).map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-zinc-200 dark:border-zinc-700 pb-2">
                                    <span className="text-zinc-600 dark:text-zinc-400">{item.name || item.product_name}</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">x{item.quantity}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-zinc-600 dark:text-zinc-400">{locale === 'fr' ? 'Articles chargement...' : 'Loading items...'}</div>
                              )}
                              {order.items && Array.isArray(order.items) && order.items.length > 2 && (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">+{order.items.length - 2} {locale === 'fr' ? 'autres articles' : 'more items'}</p>
                              )}
                            </div>
                            <div className="md:w-48 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 flex flex-col justify-center items-center">
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{locale === 'fr' ? 'Total' : 'Total'} TTC</p>
                              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{(order.total || order.total_commande || 0).toLocaleString()} FCFA</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-3 flex-wrap">
                            <Link href={`/orders/${order.id}`} className="px-6 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                              {locale === 'fr' ? 'Détails' : 'Details'}
                            </Link>
                            <Link href={`/orders/${order.id}`} className="px-6 py-2 text-sm font-bold bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              {locale === 'fr' ? 'Suivre' : 'Track'}
                            </Link>
                            {canUserDeleteOrder(order.statut) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t.orders.deleteOrder}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.settings.title}
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{t.settings.language}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Français' : 'English'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newLang = locale === 'fr' ? 'en' : 'fr';
                          setLocale(newLang);
                        }}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{t.settings.theme}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{document.documentElement.classList.contains('dark') ? 'Sombre' : 'Clair'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          document.documentElement.classList.toggle('dark');
                          localStorage.setItem('ads-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
                        }}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{t.settings.notifications}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{locale === 'fr' ? 'Bientôt disponible' : 'Coming soon'}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-500" />
                    </div>

                    {/* Password Change Section */}
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-white">{t.settings.changePassword}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.settings.password}</p>
                        </div>
                      </div>

                      {passwordMessage && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${passwordMessage.includes('succès') || passwordMessage.includes('success') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {passwordMessage}
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            {t.settings.currentPassword}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            {t.settings.newPassword}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            {t.settings.confirmPassword}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={handleChangePassword}
                          disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          {isLoading ? '...' : t.settings.changePassword}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AccountPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageFallback />}>
      <AccountPageContent />
    </Suspense>
  );
}
