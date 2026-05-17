import { createServerSupabaseClient } from '@/lib/supabase';
import { createAdminSupabaseClient } from '@/app/actions/orders';
import { canUserDeleteOrder, normalizeOrderForClient } from '@/lib/order-utils';
import { normalizePhoneDigits } from '@/lib/phone-utils';
import { NextRequest, NextResponse } from 'next/server';

async function fetchOrderForGuest(id: string, phoneParam: string) {
  const supabase = await createAdminSupabaseClient();
  const phoneDigits = normalizePhoneDigits(phoneParam);

  const { data: order, error } = await supabase
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
    .eq('id', id)
    .single();

  if (error || !order) {
    return null;
  }

  if (normalizePhoneDigits(order.client_phone || '') !== phoneDigits) {
    return null;
  }

  return order;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const phone = request.nextUrl.searchParams.get('phone');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    if (phone) {
      const guestOrder = await fetchOrderForGuest(id, phone);
      if (guestOrder) {
        return NextResponse.json(normalizeOrderForClient(guestOrder));
      }
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: order, error } = await supabase
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
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    return NextResponse.json(normalizeOrderForClient(order));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: order, error: fetchError } = await supabase
      .from('commandes')
      .select('statut')
      .eq('id', id)
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

    await supabase.from('paiements').delete().eq('commande_id', id);

    const { error: deleteError } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
