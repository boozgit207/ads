import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminSupabaseClient } from '../../../../actions/payments';
import { sendAdminNotification } from '../../../../actions/orders';

// Vérifier les variables d'environnement
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY non définie pour le webhook');
}
if (!endpointSecret) {
  console.error('❌ STRIPE_WEBHOOK_SECRET non définie');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any })
  : null;

export async function POST(request: NextRequest) {
  // Vérifier si Stripe est configuré
  if (!stripe || !endpointSecret) {
    console.error('❌ Webhook Stripe non configuré');
    return NextResponse.json(
      { error: 'Webhook non configuré' },
      { status: 503 }
    );
  }

  let payload: string;
  try {
    payload = await request.text();
  } catch (err: any) {
    console.error('❌ Erreur lecture payload:', err.message);
    return NextResponse.json(
      { error: 'Erreur lecture requête' },
      { status: 400 }
    );
  }

  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    console.error('❌ Erreur webhook signature:', err.message);
    return NextResponse.json(
      { error: `Signature invalide: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = await createAdminSupabaseClient();

  // Gérer les événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      console.log('✅ Paiement réussi:', paymentIntent.id);

      // Mettre à jour la commande
      const { data: order } = await supabase
        .from('commandes')
        .update({
          statut: 'paiement_recu',
          reference_paiement: paymentIntent.id,
        })
        .eq('id', orderId)
        .select()
        .single();

      // Envoyer une notification admin
      try {
        await sendAdminNotification('order_paid', {
          id: orderId,
          numero: order?.numero_commande,
          client_nom: order?.client_nom,
          client_prenom: order?.client_prenom,
          total_commande: order?.total_commande,
          methode_paiement: 'stripe',
          reference_paiement: paymentIntent.id,
        });
      } catch (notifError) {
        console.error('⚠️ Erreur envoi notification:', notifError);
        // Non bloquant
      }

      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      const failedOrderId = failedPayment.metadata.orderId;

      console.log('❌ Paiement échoué:', failedPayment.id);

      await supabase
        .from('commandes')
        .update({
          statut: 'annulee',
          note_admin: `Paiement échoué: ${failedPayment.last_payment_error?.message || 'Erreur inconnue'}`,
        })
        .eq('id', failedOrderId);

      break;

    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
