import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/app/actions/orders';
import { normalizeOrderForClient } from '@/lib/order-utils';
import { normalizePhoneDigits } from '@/lib/phone-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const numero = searchParams.get('numero')?.trim();
    const phone = searchParams.get('phone')?.trim();

    if (!numero || !phone) {
      return NextResponse.json(
        { error: 'Numéro de commande et téléphone requis' },
        { status: 400 }
      );
    }

    const supabase = await createAdminSupabaseClient();
    const phoneDigits = normalizePhoneDigits(phone);

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
      .or(`numero_commande.eq.${numero},id.eq.${numero}`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const order = (orders || []).find(
      (o) => normalizePhoneDigits(o.client_phone || '') === phoneDigits
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable. Vérifiez le numéro et le téléphone.' },
        { status: 404 }
      );
    }

    return NextResponse.json(normalizeOrderForClient(order));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
