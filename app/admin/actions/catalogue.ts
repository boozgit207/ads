'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================
// LABORATOIRES
// ============================================================

export async function listLaboratoires(params?: {
  search?: string;
  is_active?: boolean;
}) {
  const { data, error } = await supabase.rpc('fn_admin_list_laboratoires', {
    p_search: params?.search || null,
    p_is_active: params?.is_active ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function createLaboratoire(data: {
  nom: string;
  nom_en?: string;
  description?: string;
  desc_en?: string;
  image_url?: string;
  icone_url?: string;
  ordre?: number;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_creer_laboratoire', {
    p_nom: data.nom,
    p_nom_en: data.nom_en || null,
    p_description: data.description || null,
    p_desc_en: data.desc_en || null,
    p_image_url: data.image_url || null,
    p_icone_url: data.icone_url || null,
    p_ordre: data.ordre || 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function updateLaboratoire(id: string, data: {
  nom?: string;
  nom_en?: string;
  description?: string;
  desc_en?: string;
  image_url?: string;
  icone_url?: string;
  ordre?: number;
  is_active?: boolean;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_modifier_laboratoire', {
    p_id: id,
    p_nom: data.nom || null,
    p_nom_en: data.nom_en || null,
    p_description: data.description || null,
    p_desc_en: data.desc_en || null,
    p_image_url: data.image_url || null,
    p_icone_url: data.icone_url || null,
    p_ordre: data.ordre || null,
    p_is_active: data.is_active ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function deleteLaboratoire(id: string) {
  const { data: result, error } = await supabase.rpc('fn_admin_supprimer_laboratoire', {
    p_id: id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

// ============================================================
// CATEGORIES
// ============================================================

export async function listCategories(params?: {
  laboratoire_id?: string;
  search?: string;
  is_active?: boolean;
}) {
  const { data, error } = await supabase.rpc('fn_admin_list_categories', {
    p_laboratoire_id: params?.laboratoire_id || null,
    p_search: params?.search || null,
    p_is_active: params?.is_active ?? null,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(data: {
  laboratoire_id: string;
  nom: string;
  nom_en?: string;
  description?: string;
  desc_en?: string;
  image_url?: string;
  ordre?: number;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_creer_categorie', {
    p_laboratoire_id: data.laboratoire_id,
    p_nom: data.nom,
    p_nom_en: data.nom_en || null,
    p_description: data.description || null,
    p_desc_en: data.desc_en || null,
    p_image_url: data.image_url || null,
    p_ordre: data.ordre || 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function updateCategory(id: string, data: {
  laboratoire_id?: string;
  nom?: string;
  nom_en?: string;
  description?: string;
  desc_en?: string;
  image_url?: string;
  ordre?: number;
  is_active?: boolean;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_modifier_categorie', {
    p_id: id,
    p_laboratoire_id: data.laboratoire_id || null,
    p_nom: data.nom || null,
    p_nom_en: data.nom_en || null,
    p_description: data.description || null,
    p_desc_en: data.desc_en || null,
    p_image_url: data.image_url || null,
    p_ordre: data.ordre || null,
    p_is_active: data.is_active ?? null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function deleteCategory(id: string) {
  const { data: result, error } = await supabase.rpc('fn_admin_supprimer_categorie', {
    p_id: id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

// ============================================================
// PRODUITS
// ============================================================

export async function listProduits(params?: {
  laboratoire_id?: string;
  categorie_id?: string;
  statut?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { data, error } = await supabase.rpc('fn_admin_list_produits', {
    p_laboratoire_id: params?.laboratoire_id || null,
    p_categorie_id: params?.categorie_id || null,
    p_statut: params?.statut || null,
    p_is_active: params?.is_active ?? null,
    p_is_featured: params?.is_featured ?? null,
    p_search: params?.search || null,
    p_limit: params?.limit || 50,
    p_offset: params?.offset || 0,
  });

  if (error) throw new Error(error.message);
  
  // Fetch images for each product
  const productsWithImages = await Promise.all(
    (data || []).map(async (product: any) => {
      const { data: images } = await supabase
        .from('produit_images')
        .select('*')
        .eq('produit_id', product.id)
        .order('ordre', { ascending: true });
      
      return {
        ...product,
        images: images || []
      };
    })
  );
  
  return productsWithImages;
}

export async function createProduit(data: {
  categorie_id: string;
  nom: string;
  nom_en?: string;
  reference?: string;
  code_barre?: string;
  description?: string;
  description_en?: string;
  indications?: string;
  indications_en?: string;
  composition?: string;
  prix: number;
  prix_promo?: number;
  promo_debut?: string;
  promo_fin?: string;
  quantite_stock?: number;
  seuil_alerte?: number;
  unite?: string;
  contenance?: string;
  fabricant?: string;
  pays_fabricant?: string;
  numero_lot?: string;
  date_fabrication?: string;
  date_peremption?: string;
  temperature_min?: number;
  temperature_max?: number;
  conditions_conservation?: string;
  conditions_conservation_en?: string;
  poids?: number;
  dimensions?: string;
  certifications?: string[];
  classe_dispositif?: string;
  meta_title?: string;
  meta_description?: string;
  meta_title_en?: string;
  meta_description_en?: string;
  image_principale_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
  ordre?: number;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_creer_produit', {
    p_data: data as any,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

export async function updateProduit(id: string, data: {
  categorie_id?: string;
  nom?: string;
  nom_en?: string;
  reference?: string;
  code_barre?: string;
  description?: string;
  description_en?: string;
  indications?: string;
  indications_en?: string;
  composition?: string;
  prix?: number;
  prix_promo?: number;
  promo_debut?: string;
  promo_fin?: string;
  quantite_stock?: number;
  seuil_alerte?: number;
  unite?: string;
  contenance?: string;
  fabricant?: string;
  pays_fabricant?: string;
  numero_lot?: string;
  date_fabrication?: string;
  date_peremption?: string;
  temperature_min?: number;
  temperature_max?: number;
  conditions_conservation?: string;
  conditions_conservation_en?: string;
  poids?: number;
  dimensions?: string;
  classe_dispositif?: string;
  meta_title?: string;
  meta_description?: string;
  meta_title_en?: string;
  meta_description_en?: string;
  image_principale_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
  ordre?: number;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_modifier_produit', {
    p_id: id,
    p_data: data as any,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

export async function deleteProduit(id: string) {
  const { data: result, error } = await supabase.rpc('fn_admin_supprimer_produit', {
    p_id: id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

// ============================================================
// STOCK
// ============================================================

export async function ajusterStock(data: {
  produit_id: string;
  quantite: number;
  type: 'entree' | 'sortie' | 'ajustement' | 'inventaire';
  note?: string;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_ajuster_stock', {
    p_produit_id: data.produit_id,
    p_quantite: data.quantite,
    p_type: data.type,
    p_note: data.note || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/stocks');
  revalidatePath('/admin/produits');
  return result;
}

export async function historiqueStock(produit_id: string, limit: number = 50) {
  const { data, error } = await supabase.rpc('fn_admin_historique_stock', {
    p_produit_id: produit_id,
    p_limit: limit,
  });

  if (error) throw new Error(error.message);
  return data;
}

// ============================================================
// IMAGES ET DOCUMENTS
// ============================================================

export async function addImageProduit(data: {
  produit_id: string;
  url: string;
  alt_text?: string;
  alt_en?: string;
  ordre?: number;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_ajouter_image_produit', {
    p_produit_id: data.produit_id,
    p_url: data.url,
    p_alt_text: data.alt_text || null,
    p_alt_en: data.alt_en || null,
    p_ordre: data.ordre || 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function deleteImageProduit(image_id: string) {
  const { data: result, error } = await supabase.rpc('fn_admin_supprimer_image_produit', {
    p_image_id: image_id,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function addProductImages(produit_id: string, imageUrls: string[]) {
  // Insert images into produit_images table
  const imagesToInsert = imageUrls.map((url, index) => ({
    produit_id,
    url,
    ordre: index,
    is_primary: index === 0, // First image is primary
  }));

  const { data, error } = await supabase
    .from('produit_images')
    .insert(imagesToInsert)
    .select();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAllProductImages(produit_id: string) {
  const { error } = await supabase
    .from('produit_images')
    .delete()
    .eq('produit_id', produit_id);

  if (error) throw new Error(error.message);
}

export async function addDocumentProduit(data: {
  produit_id: string;
  type: 'notice' | 'fiche_technique' | 'certificat' | 'autorisation' | 'autre';
  nom: string;
  nom_en?: string;
  url: string;
}) {
  const { data: result, error } = await supabase.rpc('fn_admin_ajouter_document_produit', {
    p_produit_id: data.produit_id,
    p_type: data.type,
    p_nom: data.nom,
    p_nom_en: data.nom_en || null,
    p_url: data.url,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}
