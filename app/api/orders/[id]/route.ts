import { createAdminSupabaseClient } from '@/app/actions/orders';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = await createAdminSupabaseClient();

    // Récupérer la commande avec ses articles
    const { data: order, error } = await supabase
      .from('commandes')
      .select(`
        id,
        numero,
        user_id,
        statut,
        total,
        created_at,
        estimated_delivery_date,
        articles (
          id,
          product_id,
          quantity,
          product_name,
          price
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json(order);
  } catch (error: any) {
    console.error('API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
