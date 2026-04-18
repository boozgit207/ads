'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { uploadImage } from './cloudinary';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================
// LABORATOIRES - Insertion simple directe
// ============================================================

export async function createLaboratoireSimple(data: {
  nom: string;
  nom_en?: string;
  description?: string;
  description_en?: string;
  image_url?: string;
  icone_url?: string;
  is_active?: boolean;
}) {
  // Générer le slug
  const slug = data.nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: result, error } = await supabase
    .from('laboratoires')
    .insert({
      nom: data.nom,
      nom_en: data.nom_en,
      slug: slug,
      description: data.description,
      description_en: data.description_en,
      image_url: data.image_url,
      icone_url: data.icone_url,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function updateLaboratoireSimple(
  id: string,
  data: {
    nom?: string;
    nom_en?: string;
    description?: string;
    description_en?: string;
    image_url?: string;
    icone_url?: string;
    is_active?: boolean;
  }
) {
  const { data: result, error } = await supabase
    .from('laboratoires')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function deleteLaboratoireSimple(id: string) {
  const { error } = await supabase.from('laboratoires').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
}

// ============================================================
// CATEGORIES - Insertion simple directe
// ============================================================

export async function createCategorieSimple(data: {
  laboratoire_id: string;
  nom: string;
  nom_en?: string;
  description?: string;
  description_en?: string;
  image_url?: string;
  is_active?: boolean;
}) {
  // Générer le slug
  const slug = data.nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: result, error } = await supabase
    .from('categories')
    .insert({
      laboratoire_id: data.laboratoire_id,
      nom: data.nom,
      nom_en: data.nom_en,
      slug: slug,
      description: data.description,
      description_en: data.description_en,
      image_url: data.image_url,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function updateCategorieSimple(
  id: string,
  data: {
    laboratoire_id?: string;
    nom?: string;
    nom_en?: string;
    description?: string;
    description_en?: string;
    image_url?: string;
    is_active?: boolean;
  }
) {
  const { data: result, error } = await supabase
    .from('categories')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  return result;
}

export async function deleteCategorieSimple(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
}

// ============================================================
// PRODUITS avec upload image
// ============================================================

export async function createProduitAvecImage(
  data: {
    categorie_id: string;
    nom: string;
    nom_en?: string;
    reference?: string;
    code_barre?: string;
    description?: string;
    description_en?: string;
    prix: number;
    quantite_stock?: number;
    seuil_alerte?: number;
  },
  imageFile?: Buffer | string
) {
  let image_url: string | undefined;

  // Upload image si fournie
  if (imageFile) {
    const uploadResult = await uploadImage(imageFile, 'ads/products', data.nom);
    image_url = uploadResult.secure_url;
  }

  const { data: result, error } = await supabase
    .from('produits')
    .insert({
      ...data,
      image_principale_url: image_url,
      slug: data.nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

export async function updateProduitAvecImage(
  id: string,
  data: {
    categorie_id?: string;
    nom?: string;
    nom_en?: string;
    reference?: string;
    code_barre?: string;
    description?: string;
    description_en?: string;
    prix?: number;
    quantite_stock?: number;
    seuil_alerte?: number;
  },
  imageFile?: Buffer | string
) {
  let image_url: string | undefined;

  // Upload nouvelle image si fournie
  if (imageFile) {
    const uploadResult = await uploadImage(imageFile, 'ads/products', data.nom || 'product');
    image_url = uploadResult.secure_url;
  }

  const { data: result, error } = await supabase
    .from('produits')
    .update({
      ...data,
      ...(image_url && { image_principale_url: image_url }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

// ============================================================
// LISTES (fallback si les RPC ne fonctionnent pas)
// ============================================================

export async function listLaboratoiresSimple() {
  const { data, error } = await supabase
    .from('laboratoires')
    .select('*')
    .eq('is_active', true)
    .order('nom', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function listCategoriesSimple(laboratoireId?: string) {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('nom', { ascending: true });

  if (laboratoireId) {
    query = query.eq('laboratoire_id', laboratoireId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function listProduitsSimple(search?: string) {
  try {
    let query = supabase
      .from('produits')
      .select(`
        *,
        categories!inner(nom, laboratoire_id, laboratoires!inner(nom))
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('nom', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error in listProduitsSimple:', error);
      throw new Error(error.message);
    }
    
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
  } catch (err) {
    console.error('Exception in listProduitsSimple:', err);
    throw err;
  }
}

// ============================================================
// DELETE
// ============================================================

export async function deleteProduitSimple(id: string) {
  const { error } = await supabase.from('produits').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
}

// ============================================================
// ALIASES pour compatibilité avec l'interface catalogue.ts
// ============================================================

export { listProduitsSimple as listProduits };
export { listCategoriesSimple as listCategories };
export { listLaboratoiresSimple as listLaboratoires };
export { deleteProduitSimple as deleteProduit };

// ============================================================
// VERSIONS SIMPLES (sans upload intégré - upload géré dans la page)
// ============================================================

export async function createProduit(data: {
  categorie_id: string;
  nom: string;
  nom_en?: string;
  reference?: string;
  code_barre?: string;
  description?: string;
  description_en?: string;
  prix: number;
  quantite_stock?: number;
  seuil_alerte?: number;
  image_principale_url?: string;
}) {
  const slug = data.nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: result, error } = await supabase
    .from('produits')
    .insert({
      ...data,
      slug,
      statut: 'disponible',
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

export async function updateProduit(
  id: string,
  data: {
    categorie_id?: string;
    nom?: string;
    nom_en?: string;
    reference?: string;
    code_barre?: string;
    description?: string;
    description_en?: string;
    prix?: number;
    quantite_stock?: number;
    seuil_alerte?: number;
    image_principale_url?: string;
  }
) {
  // Générer nouveau slug si nom change
  let updateData: any = { ...data, updated_at: new Date().toISOString() };
  
  if (data.nom) {
    updateData.slug = data.nom
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const { data: result, error } = await supabase
    .from('produits')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/produits');
  revalidatePath('/admin/stocks');
  return result;
}

// ============================================================
// AJUSTEMENT STOCK
// ============================================================

export async function ajusterStock(
  produitId: string,
  quantite: number,
  type: 'entree' | 'sortie' | 'inventaire',
  notes?: string,
  seuilAlerte?: number
) {
  let nouveauStock: number;

  if (type === 'inventaire') {
    // Direct stock modification (set absolute value)
    nouveauStock = quantite;
  } else {
    // Movement-based adjustment (add/subtract)
    const { data: produit, error: fetchError } = await supabase
      .from('produits')
      .select('quantite_stock')
      .eq('id', produitId)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    nouveauStock = type === 'sortie' 
      ? (produit.quantite_stock || 0) - quantite
      : (produit.quantite_stock || 0) + quantite;
  }

  // Prepare update data
  const updateData: any = {
    quantite_stock: Math.max(0, nouveauStock),
    updated_at: new Date().toISOString()
  };

  // Add seuil_alerte if provided
  if (seuilAlerte !== undefined) {
    updateData.seuil_alerte = seuilAlerte;
  }

  // Mettre à jour le produit
  const { error: updateError } = await supabase
    .from('produits')
    .update(updateData)
    .eq('id', produitId);

  if (updateError) throw new Error(updateError.message);

  // Logger le mouvement
  const { error: logError } = await supabase
    .from('stock_mouvements')
    .insert({
      produit_id: produitId,
      type: type === 'entree' ? 'entree' : type === 'sortie' ? 'sortie' : 'ajustement',
      quantite: type === 'sortie' ? -quantite : quantite,
      notes: notes || `${type === 'entree' ? 'Entrée' : type === 'sortie' ? 'Sortie' : 'Inventaire'} de stock`,
    });

  if (logError) {
    console.error('Erreur log mouvement:', logError);
  }

  revalidatePath('/admin/stocks');
  revalidatePath('/admin/produits');
}

// ============================================================
// PRODUCT IMAGES
// ============================================================

export async function addProductImages(produit_id: string, imageUrls: string[]) {
  const imagesToInsert = imageUrls.map((url, index) => ({
    produit_id,
    url,
    ordre: index,
    is_primary: index === 0,
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

export async function getProductImages(produit_id: string) {
  const { data, error } = await supabase
    .from('produit_images')
    .select('*')
    .eq('produit_id', produit_id)
    .order('ordre', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

// Upload images to Cloudinary AND save to database in one action (avoids nesting issues)
export async function uploadAndSaveProductImages(
  produit_id: string,
  images: { base64: string; filename: string }[]
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Upload all images to Cloudinary
  const uploadedUrls: string[] = [];
  for (const image of images) {
    const result = await uploadImage(image.base64, 'ads/products', image.filename);
    uploadedUrls.push(result.secure_url);
  }
  
  // Delete old images
  await supabase.from('produit_images').delete().eq('produit_id', produit_id);
  
  // Insert new images
  const imagesToInsert = uploadedUrls.map((url, index) => ({
    produit_id,
    url,
    ordre: index,
    is_primary: index === 0,
  }));
  
  const { data, error } = await supabase
    .from('produit_images')
    .insert(imagesToInsert)
    .select();
  
  if (error) throw new Error(error.message);
  return { urls: uploadedUrls, data };
}
