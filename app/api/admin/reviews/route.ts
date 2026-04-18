import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: reviews, error } = await supabase
      .from('avis_produits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Fetch user and product data separately
    const reviewsWithDetails = await Promise.all(
      (reviews || []).map(async (review: any) => {
        try {
          const [{ data: userData }, { data: productData }] = await Promise.all([
            supabase
              .from('profiles')
              .select('first_name, last_name')
              .eq('id', review.user_id)
              .single(),
            supabase
              .from('produits')
              .select('nom')
              .eq('id', review.produit_id)
              .single()
          ]);
          
          return {
            ...review,
            user: userData || { first_name: 'Anonyme', last_name: '' },
            produit: productData || { nom: 'Produit inconnu' }
          };
        } catch {
          return {
            ...review,
            user: { first_name: 'Anonyme', last_name: '' },
            produit: { nom: 'Produit inconnu' }
          };
        }
      })
    );

    return NextResponse.json({ success: true, reviews: reviewsWithDetails });
  } catch (error: any) {
    console.error('Error in GET /api/admin/reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, statut } = body;

    if (!id || !statut) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase
      .from('avis_produits')
      .update({ statut })
      .eq('id', id);

    if (error) {
      console.error('Error updating review status:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing review id' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    const { error } = await supabase
      .from('avis_produits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting review:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/reviews:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
