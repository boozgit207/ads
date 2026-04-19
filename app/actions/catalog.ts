'use server';

import { createServerSupabaseClient, createPublicSupabaseClient } from '@/lib/supabase';

// Types pour les produits
export interface Product {
  id: string;
  nom: string;
  nom_en: string | null;
  slug: string;
  reference: string | null;
  description: string | null;
  description_en: string | null;
  prix: number;
  prix_promo: number | null;
  quantite_stock: number;
  statut: 'disponible' | 'rupture' | 'perime' | 'retire';
  fabricant: string | null;
  pays_fabricant: string | null;
  numero_lot: string | null;
  date_peremption: string | null;
  conditions_conservation: string | null;
  poids: number | null;
  unite: string;
  image_principale_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  categorie_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  categorie?: Category;
  laboratoire?: Laboratory;
  images?: ProductImage[];
}

export interface Category {
  id: string;
  nom: string;
  nom_en: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  laboratoire_id: string;
  is_active: boolean;
  laboratoire?: Laboratory;
}

export interface Laboratory {
  id: string;
  nom: string;
  nom_en: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  ordre: number;
  is_primary: boolean;
}

export interface CatalogFilters {
  laboratoryId?: string;
  categoryId?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

// Récupérer tous les produits actifs avec leurs relations
export async function getProducts(filters?: CatalogFilters): Promise<{ success: boolean; products?: Product[]; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();

    let query = supabase
      .from('produits')
      .select(`
        *,
        categorie:categories(*, laboratoire:laboratoires(*)),
        images:produit_images(*)
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('ordre', { ascending: true })
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters?.laboratoryId && filters.laboratoryId !== 'Tous') {
      query = query.eq('categorie.laboratoire_id', filters.laboratoryId);
    }

    if (filters?.categoryId && filters.categoryId !== 'Tous') {
      query = query.eq('categorie_id', filters.categoryId);
    }

    if (filters?.searchTerm) {
      query = query.or(`nom.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,reference.ilike.%${filters.searchTerm}%`);
    }

    if (filters?.inStockOnly) {
      query = query.gt('quantite_stock', 0);
    }

    const { data, error } = await query;

    if (error) {
      // Gérer JWT expired et autres erreurs d'auth
      if (error.message.includes('JWT expired') || error.message.includes('Invalid JWT') || error.code === 'PGRST303') {
        console.log('JWT expired lors de getProducts, retour de tableau vide');
        return { success: true, products: [] };
      }
      console.error('Erreur lors de la récupération des produits:', error);
      return { success: false, error: 'Impossible de charger les produits. Veuillez réessayer.' };
    }

    // Transformer les données pour le frontend
    const products: Product[] = (data || []).map((item: any) => ({
      ...item,
      laboratoire: item.categorie?.laboratoire,
    }));

    return { success: true, products };
  } catch (error: any) {
    console.error('Erreur getProducts:', error);
    // En cas d'erreur critique, retourner un tableau vide pour éviter de bloquer l'UI
    return { success: true, products: [] };
  }
}

// Récupérer un produit par son ID
export async function getProductById(id: string): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('produits')
      .select(`
        *,
        categorie:categories(*, laboratoire:laboratoires(*)),
        images:produit_images(*)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return { success: false, error: 'Impossible de charger ce produit. Veuillez réessayer.' };
    }

    if (!data) {
      return { success: false, error: 'Ce produit n\'est pas disponible ou a été supprimé.' };
    }

    const product: Product = {
      ...data,
      laboratoire: data.categorie?.laboratoire,
    };

    return { success: true, product };
  } catch (error: any) {
    console.error('Erreur getProductById:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération du produit' };
  }
}

// Récupérer un produit par son slug (fallback sur ID si slug null)
export async function getProductBySlug(slugOrId: string): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();
    
    console.log('Recherche produit avec:', slugOrId);
    
    // Essayer d'abord par slug - sans relations pour simplifier
    let { data, error } = await supabase
      .from('produits')
      .select('*')
      .eq('slug', slugOrId)
      .eq('is_active', true)
      .maybeSingle();

    console.log('Résultat slug (simple):', { data, error });

    // Si slug échoue, essayer par ID
    if (error || !data) {
      console.log('Slug échoué, essai par ID...');
      const result = await supabase
        .from('produits')
        .select('*')
        .eq('id', slugOrId)
        .eq('is_active', true)
        .maybeSingle();
      
      console.log('Résultat ID (simple):', { data: result.data, error: result.error });
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.error('Produit non trouvé pour:', slugOrId);
      return { success: false, error: `Produit non trouvé (slug/ID: ${slugOrId})` };
    }

    // Récupérer les relations séparément
    const [categorieResult, imagesResult] = await Promise.all([
      supabase.from('categories').select('*, laboratoire:laboratoires(*)').eq('id', data.categorie_id).single(),
      supabase.from('produit_images').select('*').eq('produit_id', data.id).order('ordre', { ascending: true })
    ]);

    const product: Product = {
      ...data,
      categorie: categorieResult.data || undefined,
      images: imagesResult.data || [],
      laboratoire: categorieResult.data?.laboratoire || undefined,
    };

    return { success: true, product };
  } catch (error: any) {
    console.error('Erreur getProductBySlug:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération du produit' };
  }
}

// Récupérer tous les laboratoires actifs
export async function getLaboratories(): Promise<{ success: boolean; laboratories?: Laboratory[]; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();

    const { data, error } = await supabase
      .from('laboratoires')
      .select('*')
      .eq('is_active', true)
      .order('nom', { ascending: true });

    if (error) {
      // Gérer JWT expired et autres erreurs d'auth
      if (error.message.includes('JWT expired') || error.message.includes('Invalid JWT') || error.code === 'PGRST303') {
        console.log('JWT expired lors de getLaboratories, retour de tableau vide');
        return { success: true, laboratories: [] };
      }
      console.error('Erreur lors de la récupération des laboratoires:', error);
      return { success: false, error: error.message };
    }

    return { success: true, laboratories: data || [] };
  } catch (error: any) {
    console.error('Erreur getLaboratories:', error);
    // En cas d'erreur critique, retourner un tableau vide pour éviter de bloquer l'UI
    return { success: true, laboratories: [] };
  }
}

// Récupérer toutes les catégories actives
export async function getCategories(laboratoryId?: string): Promise<{ success: boolean; categories?: Category[]; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();

    let query = supabase
      .from('categories')
      .select('*, laboratoire:laboratoires(*)')
      .eq('is_active', true)
      .order('nom', { ascending: true });

    if (laboratoryId) {
      query = query.eq('laboratoire_id', laboratoryId);
    }

    const { data, error } = await query;

    if (error) {
      // Gérer JWT expired et autres erreurs d'auth
      if (error.message.includes('JWT expired') || error.message.includes('Invalid JWT') || error.code === 'PGRST303') {
        console.log('JWT expired lors de getCategories, retour de tableau vide');
        return { success: true, categories: [] };
      }
      console.error('Erreur lors de la récupération des catégories:', error);
      return { success: false, error: error.message };
    }

    return { success: true, categories: data || [] };
  } catch (error: any) {
    console.error('Erreur getCategories:', error);
    // En cas d'erreur critique, retourner un tableau vide pour éviter de bloquer l'UI
    return { success: true, categories: [] };
  }
}

// Récupérer les produits similaires (même catégorie)
export async function getSimilarProducts(productId: string, categoryId: string, limit: number = 4): Promise<{ success: boolean; products?: Product[]; error?: string }> {
  try {
    const supabase = createPublicSupabaseClient();
    
    const { data, error } = await supabase
      .from('produits')
      .select(`
        *,
        categorie:categories(*, laboratoire:laboratoires(*)),
        images:produit_images(*)
      `)
      .eq('categorie_id', categoryId)
      .eq('is_active', true)
      .neq('id', productId)
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la récupération des produits similaires:', error);
      return { success: false, error: error.message };
    }

    const products: Product[] = (data || []).map((item: any) => ({
      ...item,
      laboratoire: item.categorie?.laboratoire,
    }));

    return { success: true, products };
  } catch (error: any) {
    console.error('Erreur getSimilarProducts:', error);
    return { success: false, error: error.message || 'Erreur lors de la récupération des produits similaires' };
  }
}
