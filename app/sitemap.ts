import { MetadataRoute } from 'next';
import { getProducts } from './actions/catalog';
import { getPublishedPosts } from './actions/blog';
import { productPath, siteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl;
  
  // Récupérer les produits pour le sitemap dynamique
  const productsResult = await getProducts();
  const products = productsResult.success ? productsResult.products || [] : [];
  
  // URLs statiques
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const blogResult = await getPublishedPosts();
  const blogPosts = blogResult.success ? blogResult.posts || [] : [];
  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || post.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));
  
  // URLs dynamiques des produits
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}${productPath(product)}`,
    lastModified: new Date(product.updated_at || product.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  return [...staticUrls, ...blogUrls, ...productUrls];
}
