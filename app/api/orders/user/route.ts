import { createServerSupabaseClient } from '@/lib/supabase';
import { canUserDeleteOrder, normalizeOrderForClient } from '@/lib/order-utils';
import { NextResponse, NextRequest } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from('commandes')
      .select(`
        *,
        commande_items (
          id,
          produit_nom,
          produit_image_url,
          quantite,
          prix_unitaire
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const normalized = (orders || []).map((o) => normalizeOrderForClient(o));
    return NextResponse.json(normalized);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Error in orders API:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'ID de commande requis' }, { status: 400 });
    }

    const { data: order, error: fetchError } = await supabase
      .from('commandes')
      .select('statut')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (!canUserDeleteOrder(order.statut)) {
      return NextResponse.json({
        error: 'Seules les commandes en attente ou annulées peuvent être supprimées',
      }, { status: 400 });
    }

    await supabase.from('paiements').delete().eq('commande_id', orderId);

    const { error: deleteError } = await supabase
      .from('commandes')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting order:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Commande supprimée avec succès' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
