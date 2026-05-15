'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function listBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
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

  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
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
  const updateData: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };

  if (input.titre && !input.slug) {
    updateData.slug = slugify(input.titre);
  }

  if (input.is_published === true) {
    const { data: existing } = await supabase.from('blog_posts').select('published_at').eq('id', id).single();
    if (!existing?.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase.from('blog_posts').update(updateData).eq('id', id).select().single();

  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  if (data?.slug) revalidatePath(`/blog/${data.slug}`);
  return data;
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/blog');
  revalidatePath('/admin/blog');
}
