import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPublishedPosts } from '../actions/blog';
import { absoluteUrl } from '@/lib/seo';
import { Calendar, User, ArrowRight } from 'lucide-react';

/** ISR : régénération toutes les 60 s + invalidation via revalidateTag après publication admin */
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog | ADS - Angela Diagnostics et Services',
  description:
    'Actualités, conseils et informations sur les réactifs de laboratoire et solutions diagnostiques en Afrique.',
  alternates: { canonical: absoluteUrl('/blog') },
};

export default async function BlogPage() {
  const result = await getPublishedPosts();
  const posts = result.success ? result.posts || [] : [];
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h1 className="text-4xl font-bold text-white mb-3">Blog ADS</h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Actualités, guides et expertise en diagnostics de laboratoire
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xl text-zinc-500 dark:text-zinc-400">
                Aucun article pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {post.image_url ? (
                    <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={post.image_url}
                        alt={post.titre}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={80}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
                      <span className="text-4xl font-bold text-blue-600/50 dark:text-blue-400/50">ADS</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('fr-FR')
                          : new Date(post.created_at).toLocaleDateString('fr-FR')}
                      </span>
                      {post.auteur && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.auteur}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2">
                      {post.titre}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4">
                      {post.extrait || (post.contenu ?? '').replace(/<[^>]+>/g, '').slice(0, 160)}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-3 transition-all"
                    >
                      Lire la suite
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

