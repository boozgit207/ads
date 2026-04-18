'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Client admin pour bypass RLS
export async function createAdminSupabaseClient() {
  // Vérifier si la clé service role est définie
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante ! Utilisation de la clé anon (RLS active).');
  } else {
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY présente, RLS sera contournée.');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

interface Order {
  id: string;
  numero: string;
  statut: string;
  total: number;
  created_at: string;
}

// Récupérer les commandes d'un utilisateur
export async function getUserOrders(userId: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('commandes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      // Si la table n'existe pas, retourner un tableau vide
      if (error.code === '42P01') {
        return { success: true, orders: [] };
      }
      return { success: false, error: error.message };
    }

    return { success: true, orders: data || [] };
  } catch (error: any) {
    console.error('Erreur getUserOrders:', error);
    return { success: true, orders: [] };
  }
}

// Compter le nombre de commandes d'un utilisateur
export async function getUserOrderCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { count, error } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du comptage des commandes:', error);
      // Si la table n'existe pas, retourner 0
      if (error.code === '42P01') {
        return { success: true, count: 0 };
      }
      return { success: false, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('Erreur getUserOrderCount:', error);
    return { success: true, count: 0 };
  }
}

// Récupérer TOUTES les commandes (pour l'admin)
export async function getAllOrders(): Promise<{ success: boolean; orders?: any[]; error?: string }> {
  try {
    console.log('🔍 Récupération des commandes admin...');
    const supabase = await createAdminSupabaseClient();

    // D'abord, compter sans join pour voir si la table est accessible
    const { count, error: countError } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Nombre total de commandes:', count, 'Erreur:', countError);

    const { data, error } = await supabase
      .from('commandes')
      .select(`
        *,
        commande_items (
          id,
          produit_id,
          produit_nom,
          quantite,
          prix_unitaire
        ),
        paiements (
          id,
          methode,
          montant,
          statut,
          numero_payeur,
          reference_operateur,
          transaction_id,
          initie_le,
          confirme_le
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des commandes admin:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Commandes récupérées:', data?.length || 0);
    return { success: true, orders: data || [] };
  } catch (error: any) {
    console.error('❌ Erreur getAllOrders:', error);
    return { success: false, error: error.message };
  }
}

// Compter les commandes par statut (pour l'admin)
export async function getOrderStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('commandes')
      .select('statut');

    if (error) {
      console.error('Erreur lors du comptage des statuts:', error);
      return { success: false, error: error.message };
    }

    const stats = {
      total: data?.length || 0,
      en_attente: data?.filter((o: any) => o.statut === 'en_attente').length || 0,
      paiement_recu: data?.filter((o: any) => o.statut === 'paiement_recu').length || 0,
      en_cours: data?.filter((o: any) => o.statut === 'en_cours').length || 0,
      livree: data?.filter((o: any) => o.statut === 'livree').length || 0,
      annulee: data?.filter((o: any) => o.statut === 'annulee' || o.statut === 'annule').length || 0,
      valide: data?.filter((o: any) => o.statut === 'valide').length || 0,
    };

    return { success: true, stats };
  } catch (error: any) {
    console.error('Erreur getOrderStats:', error);
    return { success: false, error: error.message };
  }
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(
  orderId: string, 
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    const { error } = await supabase
      .from('commandes')
      .update({ statut: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur updateOrderStatus:', error);
    return { success: false, error: error.message };
  }
}

// Envoyer une notification admin (simulé - à connecter avec un vrai service d'envoi)
export async function sendAdminNotification(
  type: 'new_order' | 'order_paid' | 'order_shipped' | 'low_stock',
  data: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    // Enregistrer la notification dans la base de données
    const { error } = await supabase
      .from('notifications')
      .insert({
        type,
        title: getNotificationTitle(type),
        message: getNotificationMessage(type, data),
        data: data,
        lu: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Si la table n'existe pas, logguer seulement
      if (error.code === '42P01') {
        console.log('📢 Notification admin (table notifications inexistante):', { type, data });
        return { success: true };
      }
      console.error('Erreur lors de l\'envoi de la notification:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Notification admin enregistrée:', type, data);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur sendAdminNotification:', error);
    return { success: false, error: error.message };
  }
}

// Fonctions helper pour les notifications
function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    new_order: '🛒 Nouvelle commande',
    order_paid: '💰 Commande payée',
    order_shipped: '📦 Commande expédiée',
    low_stock: '⚠️ Stock faible',
  };
  return titles[type] || 'Notification';
}

function getNotificationMessage(type: string, data: any): string {
  switch (type) {
    case 'new_order':
      return `Commande #${data.numero || data.id?.slice(0, 8)} de ${data.client_nom || 'Client'} - ${data.total_commande || data.total || 0} FCFA`;
    case 'order_paid':
      return `Paiement reçu pour la commande #${data.numero || data.id?.slice(0, 8)}`;
    case 'order_shipped':
      return `Commande #${data.numero || data.id?.slice(0, 8)} expédiée vers ${data.ville_livraison || data.ville || 'N/A'}`;
    case 'low_stock':
      return `Produit "${data.produit_nom || data.nom || 'N/A'}" en stock faible (${data.stock || 0} restants)`;
    default:
      return 'Nouvelle notification';
  }
}

// Récupérer les notifications admin
export async function getAdminNotifications(): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      if (error.code === '42P01') {
        return { success: true, notifications: [] };
      }
      return { success: false, error: error.message };
    }

    return { success: true, notifications: data || [] };
  } catch (error: any) {
    console.error('Erreur getAdminNotifications:', error);
    return { success: true, notifications: [] };
  }
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ lu: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erreur markNotificationAsRead:', error);
    return { success: false, error: error.message };
  }
}
