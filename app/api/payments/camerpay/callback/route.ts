import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '../../../../actions/payments';
import { confirmPaymentGenerateReceiptAndSendEmail } from '../../../../actions/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Webhook Camerpay reçu:', body);

    // Vérifier le statut du paiement
    const status = body.status || body.payment_status;
    const reference = body.merchant_invoice_id || body.reference || body.transaction_id;

    if (!reference) {
      console.error('❌ Référence manquante dans le webhook');
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 });
    }

    console.log(`📋 Statut paiement: ${status}, Référence: ${reference}`);

    if (status === 'success' || status === 'completed' || status === 'paid') {
      // Récupérer le paiement correspondant
      const supabase = await createAdminSupabaseClient();
      
      const { data: paiement, error: paiementError } = await supabase
        .from('paiements')
        .select('*')
        .eq('reference_operateur', reference)
        .single();

      if (paiementError || !paiement) {
        console.error('❌ Paiement introuvable pour la référence:', reference);
        return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
      }

      // Si le paiement est déjà confirmé, ne rien faire
      if (paiement.statut === 'confirme') {
        console.log('✅ Paiement déjà confirmé');
        return NextResponse.json({ success: true, message: 'Paiement déjà confirmé' });
      }

      // Mettre à jour le statut du paiement
      const { error: updateError } = await supabase
        .from('paiements')
        .update({
          statut: 'confirme',
          confirme_le: new Date().toISOString(),
          montant_recu: body.amount || paiement.montant,
          reponse_api: body,
        })
        .eq('id', paiement.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour paiement:', updateError);
        return NextResponse.json({ error: 'Erreur mise à jour paiement' }, { status: 500 });
      }

      // Générer le reçu et l'envoyer par email si une commande est associée
      if (paiement.commande_id) {
        const result = await confirmPaymentGenerateReceiptAndSendEmail(
          paiement.id,
          paiement.commande_id
        );

        if (result.success) {
          console.log('✅ Reçu généré et email envoyé:', result.receiptNumber);
        } else {
          console.error('❌ Erreur génération reçu/email:', result.error);
        }
      }

      console.log('✅ Paiement confirmé avec succès');
      return NextResponse.json({ success: true, message: 'Paiement confirmé' });
    } else if (status === 'failed' || status === 'cancelled' || status === 'error') {
      // Mettre à jour le statut du paiement comme échoué
      const supabase = await createAdminSupabaseClient();
      
      const { data: paiement, error: paiementError } = await supabase
        .from('paiements')
        .select('*')
        .eq('reference_operateur', reference)
        .single();

      if (paiement) {
        await supabase
          .from('paiements')
          .update({
            statut: 'echoue',
            echoue_le: new Date().toISOString(),
            reponse_api: body,
          })
          .eq('id', paiement.id);
      }

      console.log('❌ Paiement échoué');
      return NextResponse.json({ success: true, message: 'Paiement échoué noté' });
    }

    console.log('⏳ Statut intermédiaire:', status);
    return NextResponse.json({ success: true, message: 'Webhook reçu' });
  } catch (error: any) {
    console.error('❌ Erreur webhook Camerpay:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
