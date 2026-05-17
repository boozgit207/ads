'use server';

import { getCachedPublishedPosts, getCachedPostBySlug } from '@/lib/blog-cache';
import type { BlogPost } from '@/lib/blog-types';

export type { BlogPost } from '@/lib/blog-types';

export async function getPublishedPosts(): Promise<{
  success: boolean;
  posts?: BlogPost[];
  error?: string;
}> {
  try {
    const posts = await getCachedPublishedPosts();
    return { success: true, posts };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    console.error('getPublishedPosts:', message);
    return { success: false, error: message, posts: [] };
  }
}

export async function getPostBySlug(slug: string): Promise<{
  success: boolean;
  post?: BlogPost;
  error?: string;
}> {
  try {
    const post = await getCachedPostBySlug(slug);
    if (!post) {
      return { success: false, error: 'Article introuvable' };
    }
    return { success: true, post };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
