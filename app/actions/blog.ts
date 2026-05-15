'use server';

import { createPublicSupabaseClient } from '@/lib/supabase';

export interface BlogPost {
  id: string;
  titre: string;
  titre_en: string | null;
  slug: string;
  extrait: string | null;
  extrait_en: string | null;
  contenu: string;
  contenu_en: string | null;
  image_url: string | null;
  auteur: string | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getPublishedPosts(): Promise<{ success: boolean; posts?: BlogPost[]; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        return { success: true, posts: [] };
      }
      return { success: false, error: error.message };
    }
    return { success: true, posts: data || [] };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

export async function getPostBySlug(slug: string): Promise<{ success: boolean; post?: BlogPost; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    if (!data) {
      return { success: false, error: 'Article introuvable' };
    }
    return { success: true, post: data };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
