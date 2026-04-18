'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Client {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  avatar: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

/**
 * Liste tous les clients inscrits
 */
export async function listClients(search?: string): Promise<Client[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Mettre à jour le rôle d'un client
 */
export async function updateClientRole(
  clientId: string,
  role: 'user' | 'admin'
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', clientId);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/clients');
}

/**
 * Supprimer un client
 */
export async function deleteClient(clientId: string): Promise<void> {
  // Supprimer d'abord de auth.users (cascade supprimera profiles)
  const { error } = await supabase.auth.admin.deleteUser(clientId);
  
  if (error) {
    // Fallback: supprimer seulement le profil
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', clientId);
    
    if (profileError) throw new Error(profileError.message);
  }
  
  revalidatePath('/admin/clients');
}

/**
 * Récupérer les statistiques des clients
 */
export async function getClientsStats() {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, created_at');

  if (error) throw new Error(error.message);

  const total = data?.length || 0;
  const admins = data?.filter(c => c.role === 'admin').length || 0;
  const users = total - admins;
  
  // Nouveaux ce mois
  const now = new Date();
  const thisMonth = data?.filter(c => {
    const created = new Date(c.created_at);
    return created.getMonth() === now.getMonth() && 
           created.getFullYear() === now.getFullYear();
  }).length || 0;

  return { total, admins, users, thisMonth };
}
