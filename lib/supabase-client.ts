import { createClient } from '@supabase/supabase-js';

let browserClient: any = null;

// Client côté navigateur uniquement (pas de cookies) - singleton
export const createBrowserClient = () => {
  if (browserClient) return browserClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  browserClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  
  return browserClient;
};

// Types pour les profils
export interface Profile {
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
