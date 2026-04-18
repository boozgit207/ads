'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types pour les opérations CRUD
export interface Product {
  id?: number;
  name: string;
  category: string;
  laboratory: string;
  price: number;
  stock: number;
  description?: string;
  image_url?: string;
}

export interface Stock {
  id?: number;
  product_id: number;
  quantity: number;
  min_stock: number;
  location: string;
}

export interface Order {
  id?: string;
  customer_id: string;
  total: number;
  status: 'en_attente' | 'payee' | 'valide' | 'annule' | 'expedie';
}

export interface Review {
  id?: number;
  product_id: number;
  customer_id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Gestion d'erreurs
function handleSupabaseError(error: any) {
  console.error('Supabase error:', error);
  return {
    success: false,
    error: error.message || 'Une erreur est survenue lors de l\'opération',
  };
}

// ============= PRODUITS =============

export async function getProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function createProduct(product: Product) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/produits');
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function updateProduct(id: number, product: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/produits');
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function deleteProduct(id: number) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/produits');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

// ============= STOCKS =============

export async function getStocks() {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function createStock(stock: Stock) {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .insert(stock)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/stocks');
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function updateStock(id: number, stock: Partial<Stock>) {
  try {
    const { data, error } = await supabase
      .from('stocks')
      .update(stock)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/admin/stocks');
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function deleteStock(id: number) {
  try {
    const { error } = await supabase
      .from('stocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/stocks');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

// ============= COMMANDES =============

export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(first_name, last_name, email, phone, address)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function validateOrder(orderId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'valide' })
      .eq('id', orderId);

    if (error) throw error;
    
    // Créer une notification pour le client
    // (à implémenter avec la table notifications)
    
    revalidatePath('/admin/commandes');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'annule' })
      .eq('id', orderId);

    if (error) throw error;
    
    // Créer une notification pour le client
    // (à implémenter avec la table notifications)
    
    revalidatePath('/admin/commandes');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

// ============= CLIENTS =============

export async function getClients() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function deleteClient(userId: string) {
  try {
    // Supprimer d'abord les commandes du client
    await supabase.from('orders').delete().eq('customer_id', userId);
    
    // Supprimer le profil
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/clients');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

// ============= AVIS =============

export async function getReviews() {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name), profiles(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function approveReview(reviewId: number) {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', reviewId);

    if (error) throw error;
    revalidatePath('/admin/avis');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function rejectReview(reviewId: number) {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', reviewId);

    if (error) throw error;
    revalidatePath('/admin/avis');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

export async function deleteReview(reviewId: number) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    revalidatePath('/admin/avis');
    return { success: true };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

// ============= STATISTIQUES =============

export async function getStatistics() {
  try {
    const [
      productsCount,
      ordersCount,
      clientsCount,
      totalRevenue
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('orders').select('total').eq('status', 'valide'),
    ]);

    const revenue = totalRevenue.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    return {
      success: true,
      data: {
        products: productsCount.count || 0,
        orders: ordersCount.count || 0,
        clients: clientsCount.count || 0,
        revenue,
      },
    };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}

// ============= EXPORT DE DONNÉES =============

export async function exportDataCSV(table: string) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) throw error;

    // Convertir en CSV
    if (!data || data.length === 0) {
      return { success: false, error: 'Aucune donnée à exporter' };
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(',')),
    ].join('\n');

    return { success: true, csv, filename: `${table}_export.csv` };
  } catch (error: any) {
    return handleSupabaseError(error);
  }
}
