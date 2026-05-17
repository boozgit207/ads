import type { BlogPost } from '@/lib/blog-types';

export type BlogLocale = 'fr' | 'en';

export function getLocalizedBlogPost(post: BlogPost, locale: BlogLocale) {
  if (locale === 'en') {
    return {
      titre: post.titre_en?.trim() || post.titre,
      extrait: post.extrait_en?.trim() || post.extrait,
      contenu: post.contenu_en?.trim() || post.contenu,
    };
  }
  return {
    titre: post.titre,
    extrait: post.extrait,
    contenu: post.contenu,
  };
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
