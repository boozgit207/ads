import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getPostBySlug } from '../../actions/blog';
import { absoluteUrl } from '@/lib/seo';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPostBySlug(slug);
  if (!result.success || !result.post) {
    return { title: 'Article introuvable | ADS' };
  }
  const post = result.post;
  return {
    title: post.meta_title || `${post.titre} | Blog ADS`,
    description: post.meta_description || post.extrait || undefined,
    alternates: { canonical: absoluteUrl(`/blog/${slug}`) },
    openGraph: {
      title: post.titre,
      description: post.extrait || undefined,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);

  if (!result.success || !result.post) {
    notFound();
  }

  const post = result.post;
  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date(post.created_at).toLocaleDateString('fr-FR');

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au blog
        </Link>

        {post.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 border border-zinc-200 dark:border-zinc-800">
            <img src={post.image_url} alt={post.titre} className="w-full h-full object-cover" />
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
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">{post.titre}</h1>
          {post.extrait && (
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{post.extrait}</p>
          )}
        </header>

        <article
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:text-zinc-900 dark:prose-headings:text-white"
          dangerouslySetInnerHTML={{ __html: post.contenu }}
        />
      </main>
      <Footer />
    </div>
  );
}
