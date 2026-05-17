'use server';

import { createClient } from '@supabase/supabase-js';
import {
  sendNewOrderToAdmin,
  sendOrderConfirmationToClient,
  type OrderEmailPayload,
} from '@/lib/email';
import { ADMIN_ORDER_EMAIL, DELIVERY_FEE_FCFA } from '@/lib/order-config';
import { formatPhoneForStorage } from '@/lib/phone-utils';

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

export type CreateOrderInput = {
  userId?: string | null;
  cart: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
  }>;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  deliveryOption: 'pickup' | 'delivery';
  paymentMethod: 'om' | 'mtn';
};

export async function createOrderFromCheckout(
  input: CreateOrderInput
): Promise<{
  success: boolean;
  orderId?: string;
  numero?: string;
  error?: string;
}> {
  try {
    const supabase = await createAdminSupabaseClient();
    const cartItems = input.cart || [];

    if (cartItems.length === 0) {
      return { success: false, error: 'Panier vide' };
    }

    const sousTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const fraisLivraison =
      input.deliveryOption === 'delivery' ? DELIVERY_FEE_FCFA : 0;
    const totalCommande = sousTotal + fraisLivraison;
    const phone = formatPhoneForStorage(input.phone);

    const methodePaiement =
      input.paymentMethod === 'om' ? 'orange_money' : 'mtn_money';
    const typeLivraison =
      input.deliveryOption === 'delivery' ? 'livraison_domicile' : 'retrait_magasin';

    let userId: string | null = input.userId || null;
    let clientAnonymeId: string | null = null;

    if (!userId) {
      const { data: existingAnon } = await supabase
        .from('clients_anonymes')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (existingAnon?.id) {
        clientAnonymeId = existingAnon.id;
        await supabase
          .from('clients_anonymes')
          .update({
            nom: input.lastName,
            prenom: input.firstName,
            email: input.email?.trim() || null,
            adresse:
              input.deliveryOption === 'delivery' ? input.address || null : null,
            ville: input.city || 'Yaoundé',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAnon.id);
      } else {
        const { data: newAnon, error: anonError } = await supabase
          .from('clients_anonymes')
          .insert({
            nom: input.lastName,
            prenom: input.firstName,
            phone,
            email: input.email?.trim() || null,
            adresse:
              input.deliveryOption === 'delivery' ? input.address || null : null,
            ville: input.city || 'Yaoundé',
          })
          .select('id')
          .single();

        if (anonError || !newAnon) {
          console.error('Erreur client anonyme:', anonError);
          return {
            success: false,
            error:
              anonError?.message ||
              'Impossible d enregistrer les informations client',
          };
        }
        clientAnonymeId = newAnon.id;
      }
    }

    const { data: order, error: orderError } = await supabase
      .from('commandes')
      .insert({
        user_id: userId,
        client_anonyme_id: clientAnonymeId,
        client_nom: input.lastName,
        client_prenom: input.firstName,
        client_phone: phone,
        client_email: input.email?.trim() || null,
        adresse_livraison:
          input.deliveryOption === 'delivery' ? input.address || '' : 'Retrait sur place',
        ville_livraison: input.city || 'Yaoundé',
        type_livraison: typeLivraison,
        sous_total: sousTotal,
        frais_livraison: fraisLivraison,
        total_commande: totalCommande,
        statut: 'en_attente',
        methode_paiement: methodePaiement,
        note_client: input.notes?.trim() || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Erreur création commande:', orderError);
      return {
        success: false,
        error: orderError?.message || 'Impossible de créer la commande',
      };
    }

    const orderItems = cartItems.map((item) => ({
      commande_id: order.id,
      produit_id: item.id,
      produit_nom: item.name,
      produit_image_url: item.image || null,
      quantite: item.quantity,
      prix_unitaire: item.price,
      prix_total: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('commande_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erreur articles commande:', itemsError);
      await supabase.from('commandes').delete().eq('id', order.id);
      return { success: false, error: itemsError.message };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const numero = order.numero_commande || order.id.slice(0, 8);
    const trackingUrl = `${siteUrl}/orders/${order.id}?phone=${encodeURIComponent(phone)}`;

    const emailPayload: OrderEmailPayload = {
      numero,
      orderId: order.id,
      clientName: `${input.firstName} ${input.lastName}`.trim(),
      clientEmail: input.email,
      clientPhone: phone,
      address: input.deliveryOption === 'delivery' ? input.address : undefined,
      city: input.city,
      deliveryType:
        input.deliveryOption === 'delivery'
          ? 'Livraison à domicile'
          : 'Retrait sur place',
      paymentMethod:
        input.paymentMethod === 'om' ? 'Orange Money' : 'MTN Mobile Money',
      subtotal: sousTotal,
      deliveryFee: fraisLivraison,
      total: totalCommande,
      items: cartItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      notes: input.notes,
      trackingUrl,
    };

    try {
      await sendAdminNotification('new_order', {
        id: order.id,
        numero,
        client_nom: order.client_nom,
        client_prenom: order.client_prenom,
        total_commande: totalCommande,
        methode_paiement: methodePaiement,
      });
    } catch (e) {
      console.error('Notification admin:', e);
    }

    const [clientMail, adminMail] = await Promise.all([
      sendOrderConfirmationToClient(emailPayload),
      sendNewOrderToAdmin(emailPayload, ADMIN_ORDER_EMAIL),
    ]);

    if (!clientMail.ok && input.email) {
      console.warn('Email client:', clientMail.error);
    }
    if (!adminMail.ok) {
      console.warn('Email admin:', adminMail.error);
    }

    return {
      success: true,
      orderId: order.id,
      numero,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('createOrderFromCheckout:', error);
    return { success: false, error: message };
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
