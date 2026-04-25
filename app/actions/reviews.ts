'use server';

import { createServerSupabaseClient } from '@/lib/supabase';

export interface Review {
  id: string;
  produit_id: string;
  user_id: string;
  note: number;
  titre: string | null;
  commentaire: string | null;
  statut: 'en_attente' | 'approuve' | 'rejete';
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  };
}

// Récupérer les avis approuvés d'un produit
export async function getProductReviews(productId: string): Promise<{ success: boolean; reviews?: Review[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('avis_produits')
      .select('*')
      .eq('produit_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      // Retourner toujours un tableau vide pour ne pas bloquer la page
      return { success: true, reviews: [] };
    }

    // Récupérer les infos utilisateur séparément
    const reviewsWithUser = await Promise.all(
      (data || []).map(async (review: any) => {
        try {
          const { data: userData } = await supabase
            .from('profiles')
            .select('first_name, last_name, avatar')
            .eq('id', review.user_id)
            .single();
          
          return {
            ...review,
            user: userData || { first_name: 'Anonyme', last_name: '', avatar: null }
          };
        } catch {
          return {
            ...review,
            user: { first_name: 'Anonyme', last_name: '', avatar: null }
          };
        }
      })
    );

    return { success: true, reviews: reviewsWithUser };
  } catch (error: any) {
    // En cas d'erreur, retourner un tableau vide pour ne pas bloquer la page
    return { success: true, reviews: [] };
  }
}

// Ajouter un avis
export async function addReview(
  productId: string,
  userId: string,
  note: number,
  titre: string,
  commentaire: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier si l'utilisateur a déjà laissé un avis
    const { data: existing } = await supabase
      .from('avis_produits')
      .select('id')
      .eq('produit_id', productId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return { success: false, error: 'Vous avez déjà laissé un avis sur ce produit' };
    }

    const { error } = await supabase
      .from('avis_produits')
      .insert({
        produit_id: productId,
        user_id: userId,
        note,
        titre,
        commentaire
      });

    if (error) {
      console.error('Erreur lors de l\'ajout de l\'avis:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Avis stocké avec succès - produit:', productId, 'utilisateur:', userId, 'note:', note);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur addReview:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'ajout de l\'avis' };
  }
}

// Supprimer un avis
export async function deleteReview(reviewId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier que l'avis appartient à l'utilisateur
    const { data: review } = await supabase
      .from('avis_produits')
      .select('user_id')
      .eq('id', reviewId)
      .single();
    
    if (!review) {
      return { success: false, error: 'Avis non trouvé' };
    }
    
    if (review.user_id !== userId) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à supprimer cet avis' };
    }
    
    const { error } = await supabase
      .from('avis_produits')
      .delete()
      .eq('id', reviewId);
    
    if (error) {
      console.error('Erreur lors de la suppression de l\'avis:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Avis supprimé avec succès - id:', reviewId);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur deleteReview:', error);
    return { success: false, error: error.message || 'Erreur lors de la suppression de l\'avis' };
  }
}

// Modifier un avis
export async function updateReview(
  reviewId: string,
  userId: string,
  note: number,
  titre: string,
  commentaire: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Vérifier que l'avis appartient à l'utilisateur
    const { data: review } = await supabase
      .from('avis_produits')
      .select('user_id')
      .eq('id', reviewId)
      .single();
    
    if (!review) {
      return { success: false, error: 'Avis non trouvé' };
    }
    
    if (review.user_id !== userId) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à modifier cet avis' };
    }
    
    const { error } = await supabase
      .from('avis_produits')
      .update({
        note,
        titre,
        commentaire,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);
    
    if (error) {
      console.error('Erreur lors de la modification de l\'avis:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Avis modifié avec succès - id:', reviewId);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur updateReview:', error);
    return { success: false, error: error.message || 'Erreur lors de la modification de l\'avis' };
  }
}

// Vérifier si l'utilisateur a déjà laissé un avis
export async function hasUserReviewed(productId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data } = await supabase
      .from('avis_produits')
      .select('id')
      .eq('produit_id', productId)
      .eq('user_id', userId)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

// Récupérer la moyenne des avis d'un produit
export async function getProductAverageRating(productId: string): Promise<{ success: boolean; average?: number; count?: number; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('avis_produits')
      .select('note')
      .eq('produit_id', productId);

    if (error) {
      return { success: true, average: 0, count: 0 };
    }

    if (!data || data.length === 0) {
      return { success: true, average: 0, count: 0 };
    }

    const total = data.reduce((sum: number, review: any) => sum + review.note, 0);
    const average = total / data.length;

    return { success: true, average, count: data.length };
  } catch (error: any) {
    return { success: true, average: 0, count: 0 };
  }
}
