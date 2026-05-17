import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '../../actions/blog';
import { absoluteUrl } from '@/lib/seo';
import BlogArticleClient from './BlogArticleClient';

export const revalidate = 60;

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

  return <BlogArticleClient post={result.post} />;
}
