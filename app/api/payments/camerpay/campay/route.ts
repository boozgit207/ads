import { NextRequest, NextResponse } from 'next/server';
import { initiateCamerpayPayment, createAdminSupabaseClient } from '../../../actions/payments';
import { sendAdminNotification } from '../../../actions/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, phone, operator, reference, cart, userId, deliveryInfo, fraisLivraison } = body;

    if (!amount || !phone || !operator) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Initier le paiement Camerpay
    const result = await initiateCamerpayPayment({
      amount,
      phone,
      operator,
      reference,
    });

    if (result.success) {
      // Créer la commande dans la base de données (utilise admin client pour bypass RLS)
      const supabase = await createAdminSupabaseClient();

      // Calculer les totaux depuis le panier
      const cartItems = cart || [];
      const sousTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const deliveryFees = fraisLivraison || 0;
      const totalCommande = sousTotal + deliveryFees;

      // Récupérer les infos livraison du body si disponibles
      const delivery = deliveryInfo || {};

      const { data: order, error: orderError } = await supabase
        .from('commandes')
        .insert({
          user_id: userId,
          client_nom: delivery.nom || 'Client',
          client_prenom: delivery.prenom || '',
          client_phone: delivery.telephone || phone,
          client_email: delivery.email || null,
          adresse_livraison: delivery.adresse || '',
          ville_livraison: delivery.ville || '',
          sous_total: sousTotal,
          frais_livraison: deliveryFees,
          total_commande: totalCommande,
          statut: 'en_attente',
          methode_paiement: operator === 'orange' ? 'orange_money' : operator === 'mtn' ? 'mtn_mobile_money' : 'stripe',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Erreur création commande:', orderError);
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création de la commande' },
          { status: 500 }
        );
      }

      // Créer les articles de commande
      const orderItems = cartItems.map((item: any) => ({
        commande_id: order.id,
        produit_id: item.id,
        produit_nom: item.name,
        quantite: item.quantity,
        prix_unitaire: item.price,
        prix_total: item.price * item.quantity,
      }));

      await supabase.from('commande_items').insert(orderItems);

      // Enregistrer le paiement avec la commande ID
      if (result.paymentId) {
        await supabase.from('paiements').update({
          commande_id: order.id,
        }).eq('id', result.paymentId);
      }

      // Envoyer une notification admin
      try {
        await sendAdminNotification('new_order', {
          id: order.id,
          numero: order.numero_commande,
          client_nom: order.client_nom,
          client_prenom: order.client_prenom,
          total_commande: order.total_commande,
          methode_paiement: operator === 'orange' ? 'orange_money' : operator === 'mtn' ? 'mtn_mobile_money' : 'stripe',
        });
      } catch (notifError) {
        console.error('⚠️ Erreur envoi notification:', notifError);
        // Non bloquant
      }

      return NextResponse.json({ success: true, orderId: order.id, paymentReference: result.payment?.reference });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erreur API Camerpay:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
