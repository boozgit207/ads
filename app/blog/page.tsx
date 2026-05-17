import { Metadata } from 'next';
import { getPublishedPosts } from '../actions/blog';
import { absoluteUrl } from '@/lib/seo';
import BlogListClient from './BlogListClient';

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
  return <BlogListClient posts={posts} />;
}
