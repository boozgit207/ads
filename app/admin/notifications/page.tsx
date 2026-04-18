'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ThemeProvider } from '../components/ThemeProvider';
import { 
  ShoppingCart, 
  MessageSquare, 
  Check, 
  Trash2,
  Bell,
  Clock,
  Mail,
  DollarSign,
  Package,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { getAdminNotifications, markNotificationAsRead } from '../../actions/orders';

interface Notification {
  id: string;
  type: 'new_order' | 'order_paid' | 'order_shipped' | 'low_stock';
  title: string;
  message: string;
  lu: boolean;
  created_at: string;
  data?: any;
}

const typeConfig = {
  new_order: { icon: ShoppingCart, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300', gradient: 'from-blue-500 to-cyan-500' },
  order_paid: { icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300', gradient: 'from-green-500 to-emerald-500' },
  order_shipped: { icon: Package, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300', gradient: 'from-purple-500 to-pink-500' },
  low_stock: { icon: AlertTriangle, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300', gradient: 'from-amber-500 to-orange-500' },
  message: { icon: MessageSquare, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300', gradient: 'from-indigo-500 to-blue-500' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getAdminNotifications();
    if (result.success && result.notifications) {
      setNotifications(result.notifications);
    }
    setLoading(false);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.lu;
    if (filter === 'read') return n.lu;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.lu).length;

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsRead(id);
    if (result.success) {
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, lu: true } : n
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.lu).map(n => n.id);
    for (const id of unreadIds) {
      await markNotificationAsRead(id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
  };

  const handleDelete = (id: string) => {
    // TODO: Implement delete notification in database
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-FR');
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
                    <Bell className="w-5 h-5" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Tout marquer comme lu
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-8 pt-20 lg:pt-8">
            {/* Stats */}
            <div className="grid gap-6 sm:grid-cols-3 mb-8">
              {[
                { label: 'Total', value: notifications.length, Icon: Bell, gradient: 'from-amber-500 to-orange-500' },
                { label: 'Non lues', value: unreadCount, Icon: Mail, gradient: 'from-blue-500 to-cyan-500' },
                { label: 'Lues', value: notifications.length - unreadCount, Icon: Check, gradient: 'from-green-500 to-emerald-500' },
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

            {/* Filter tabs */}
            <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl p-2 mb-8">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    filter === 'all' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Toutes ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    filter === 'unread' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Non lues ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    filter === 'read' 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Lues ({notifications.length - unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-16 text-center shadow-xl">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg">Chargement des notifications...</p>
                </div>
              ) : filteredNotifications.map((notification) => {
                const typeInfo = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.message;
                const Icon = typeInfo.icon;
                return (
                  <div
                    key={notification.id}
                    className={`group bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border rounded-3xl p-6 transition-all hover:shadow-xl ${
                      !notification.lu 
                        ? 'border-blue-200 dark:border-blue-800/50 shadow-lg' 
                        : 'border-zinc-200/50 dark:border-zinc-800/50 shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${typeInfo.color} shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={`font-bold text-base ${!notification.lu ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{notification.message}</p>
                          </div>
                          <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                          {!notification.lu && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Marquer comme lu
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredNotifications.length === 0 && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-16 text-center shadow-xl">
                  <Bell className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg">Aucune notification trouvée</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
