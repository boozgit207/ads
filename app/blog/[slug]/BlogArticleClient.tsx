'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useI18n } from '../../context/I18nContext';
import type { BlogPost } from '@/lib/blog-types';
import { getLocalizedBlogPost } from '@/lib/blog-i18n';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const ui = {
  fr: { back: 'Retour au blog' },
  en: { back: 'Back to blog' },
};

export default function BlogArticleClient({ post }: { post: BlogPost }) {
  const { locale } = useI18n();
  const copy = ui[locale];
  const localized = getLocalizedBlogPost(post, locale);
  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-GB';
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date(post.created_at).toLocaleDateString(dateLocale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {copy.back}
        </Link>

        {post.image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 border border-zinc-200 dark:border-zinc-800">
            <Image
              src={post.image_url}
              alt={localized.titre}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {dateStr}
            </span>
            {post.auteur && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.auteur}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            {localized.titre}
          </h1>
          {localized.extrait && (
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{localized.extrait}</p>
          )}
        </header>

        <article
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-white"
          dangerouslySetInnerHTML={{ __html: localized.contenu || '<p></p>' }}
        />
      </main>
      <Footer />
    </div>
  );
}
