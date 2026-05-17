'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath, updateTag } from 'next/cache';
import { BLOG_CACHE_TAG } from '@/lib/blog-cache';

function revalidateBlog() {
  updateTag(BLOG_CACHE_TAG);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Configuration Supabase manquante (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)'
    );
  }
  return createClient(url, key);
}

function formatBlogError(error: { message: string; code?: string }) {
  if (error.code === '42P01') {
    return 'Table blog_posts absente. Exécutez sql/blog_posts.sql dans Supabase.';
  }
  if (error.code === '23505') {
    return 'Ce slug existe déjà. Choisissez un autre slug.';
  }
  return error.message;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listBlogPosts() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(formatBlogError(error));
  return data || [];
}

export async function createBlogPost(input: {
  titre: string;
  titre_en?: string;
  slug?: string;
  extrait?: string;
  extrait_en?: string;
  contenu: string;
  contenu_en?: string;
  image_url?: string;
  auteur?: string;
  is_published?: boolean;
  meta_title?: string;
  meta_description?: string;
}) {
  const supabase = getSupabaseAdmin();
  const slug = input.slug?.trim() || slugify(input.titre);
  const isPublished = input.is_published ?? false;

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      titre: input.titre,
      titre_en: input.titre_en,
      slug,
      extrait: input.extrait,
      extrait_en: input.extrait_en,
      contenu: input.contenu,
      contenu_en: input.contenu_en,
      image_url: input.image_url,
      auteur: input.auteur || 'ADS',
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      meta_title: input.meta_title,
      meta_description: input.meta_description,
    })
    .select()
    .single();

  if (error) throw new Error(formatBlogError(error));
  revalidateBlog();
  if (data?.slug) revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function updateBlogPost(
  id: string,
  input: {
    titre?: string;
    titre_en?: string;
    slug?: string;
    extrait?: string;
    extrait_en?: string;
    contenu?: string;
    contenu_en?: string;
    image_url?: string;
    auteur?: string;
    is_published?: boolean;
    meta_title?: string;
    meta_description?: string;
  }
) {
  const supabase = getSupabaseAdmin();
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (input.titre !== undefined) updateData.titre = input.titre;
  if (input.titre_en !== undefined) updateData.titre_en = input.titre_en;
  if (input.slug !== undefined) updateData.slug = input.slug;
  if (input.extrait !== undefined) updateData.extrait = input.extrait;
  if (input.extrait_en !== undefined) updateData.extrait_en = input.extrait_en;
  if (input.contenu !== undefined) updateData.contenu = input.contenu;
  if (input.contenu_en !== undefined) updateData.contenu_en = input.contenu_en;
  if (input.image_url !== undefined) updateData.image_url = input.image_url;
  if (input.auteur !== undefined) updateData.auteur = input.auteur;
  if (input.meta_title !== undefined) updateData.meta_title = input.meta_title;
  if (input.meta_description !== undefined) updateData.meta_description = input.meta_description;

  if (input.titre && !input.slug) {
    updateData.slug = slugify(input.titre);
  }

  if (input.is_published !== undefined) {
    updateData.is_published = input.is_published;
    if (input.is_published === true) {
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .single();
      if (!existing?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
  }

  const { data, error } = await supabase.from('blog_posts').update(updateData).eq('id', id).select().single();

  if (error) throw new Error(formatBlogError(error));
  revalidateBlog();
  if (data?.slug) revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function deleteBlogPost(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw new Error(formatBlogError(error));
  revalidateBlog();
}
