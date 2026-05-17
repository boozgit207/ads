import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { BlogPost } from '@/lib/blog-types';

export const BLOG_REVALIDATE_SECONDS = 60;
export const BLOG_CACHE_TAG = 'blog-posts';

function createBlogReader() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key);
}

function isPublishedRow(row: { is_published?: boolean | null }): boolean {
  return row.is_published === true;
}

async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const supabase = createBlogReader();
  if (!supabase) {
    console.warn('[blog] Configuration Supabase incomplète (SERVICE_ROLE_KEY)');
    return [];
  }
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    console.error('[blog] fetchPublishedPosts:', error.message);
    return [];
  }

  return (data || []).filter(isPublishedRow) as BlogPost[];
}

export const getCachedPublishedPosts = unstable_cache(
  fetchPublishedPosts,
  ['ads-blog-published-posts'],
  { revalidate: BLOG_REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG] }
);

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createBlogReader();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data || !isPublishedRow(data)) return null;
  return data as BlogPost;
}

export function getCachedPostBySlug(slug: string) {
  return unstable_cache(
    () => fetchPostBySlug(slug),
    ['ads-blog-post', slug],
    { revalidate: BLOG_REVALIDATE_SECONDS, tags: [BLOG_CACHE_TAG, `blog-post-${slug}`] }
  )();
}
