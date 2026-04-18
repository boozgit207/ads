import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminSupabaseClient } from '../../../actions/payments';
import { sendAdminNotification } from '../../../actions/orders';

// Vérifier la clé Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY non définie dans les variables d\'environnement');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any })
  : null;

export async function POST(request: NextRequest) {
  try {
    // Vérifier si Stripe est configuré
    if (!stripe) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Paiement par carte non configuré. Veuillez contacter l\'administrateur.',
          code: 'STRIPE_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { userId, cart, amount, deliveryInfo, deliveryFee, metadata } = body;

    // Validation des données
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Panier vide ou invalide', code: 'INVALID_CART' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Montant invalide', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (!deliveryInfo || !deliveryInfo.nom || !deliveryInfo.prenom) {
      return NextResponse.json(
        { success: false, error: 'Informations de livraison incomplètes', code: 'INVALID_DELIVERY' },
        { status: 400 }
      );
    }

    // Créer la commande dans la base de données
    const supabase = await createAdminSupabaseClient();
    
    const sousTotal = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const totalCommande = sousTotal + (deliveryFee || 0);
    
    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('commandes')
      .insert({
        user_id: userId,
        client_nom: deliveryInfo?.nom || 'Client',
        client_prenom: deliveryInfo?.prenom || '',
        client_phone: deliveryInfo?.telephone || '',
        client_email: deliveryInfo?.email || '',
        adresse_livraison: deliveryInfo?.adresse || '',
        ville_livraison: deliveryInfo?.ville || '',
        sous_total: sousTotal,
        frais_livraison: deliveryFee || 0,
        total_commande: totalCommande,
        statut: 'en_attente',
        methode_paiement: 'virement_bancaire',
        note_client: 'Paiement par carte bancaire (Stripe)',
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Erreur création commande:', orderError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création de la commande', code: 'DB_ERROR', details: orderError.message },
        { status: 500 }
      );
    }

    if (!order || !order.id) {
      return NextResponse.json(
        { success: false, error: 'Commande non créée', code: 'ORDER_NOT_CREATED' },
        { status: 500 }
      );
    }

    // Créer les articles de commande
    const orderItems = cart.map((item: any) => ({
      commande_id: order.id,
      produit_id: item.id,
      nom_produit: item.name,
      quantite: item.quantity,
      prix_unitaire: item.price,
    }));

    const { error: itemsError } = await supabase.from('commande_items').insert(orderItems);
    
    if (itemsError) {
      console.error('❌ Erreur création items:', itemsError);
      // On continue quand même, l'ordre est créé
    }

    // Envoyer une notification admin
    try {
      await sendAdminNotification('new_order', {
        id: order.id,
        numero: order.numero_commande,
        client_nom: order.client_nom,
        client_prenom: order.client_prenom,
        total_commande: order.total_commande,
        methode_paiement: 'stripe',
      });
    } catch (notifError) {
      console.error('⚠️ Erreur envoi notification:', notifError);
      // Non bloquant
    }

    // Créer le PaymentIntent Stripe
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency: 'xaf', // Franc CFA
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.numero_commande || 'N/A',
          userId: userId || 'guest',
          ...metadata,
        },
        description: `Commande ${order.numero_commande || order.id} - ADS Diagnostics`,
      });
    } catch (stripeError: any) {
      console.error('❌ Erreur Stripe PaymentIntent:', stripeError);
      
      // Annuler la commande en cas d'échec Stripe
      await supabase.from('commandes').update({ statut: 'annulee', note_admin: 'Échec création PaymentIntent Stripe' }).eq('id', order.id);
      
      return NextResponse.json(
        { 
          success: false, 
          error: stripeError.message || 'Erreur lors de la création du paiement Stripe',
          code: 'STRIPE_ERROR',
          type: stripeError.type
        },
        { status: 500 }
      );
    }

    if (!paymentIntent || !paymentIntent.client_secret) {
      return NextResponse.json(
        { success: false, error: 'Erreur: client_secret manquant', code: 'MISSING_CLIENT_SECRET' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.numero_commande,
    });
  } catch (error: any) {
    console.error('❌ Erreur inattendue Stripe API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
