import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Client admin avec service role key (bypass RLS)
export async function createAdminSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================
// CAMERPAY API
// ============================================================

interface CamerpayPaymentRequest {
  amount: number;
  phone: string;
  operator: 'orange' | 'mtn' | 'stripe';
  reference?: string;
}

interface CamerpayPaymentResponse {
  success: boolean;
  payment?: {
    reference: string;
    amount: number;
    phone: string;
    status: 'pending' | 'success' | 'failed';
    transactionId?: string;
  };
  error?: string;
}

// Initier un paiement via Camerpay
export async function initiateCamerpayPayment(
  request: CamerpayPaymentRequest,
  commandeId?: string
): Promise<CamerpayPaymentResponse & { paymentId?: string }> {
  try {
    const camerpayBaseUrl = process.env.CAMERPAY_BASE_URL || 'https://www.camerpay.biz';
    const camerpayApiKey = process.env.CAMERPAY_API_KEY;

    if (!camerpayApiKey) {
      console.error('CAMERPAY_API_KEY missing');
      return { success: false, error: 'Configuration Camerpay manquante' };
    }

    const reference = request.reference || `ADS-${Date.now()}`;

    const response = await fetch(`${camerpayBaseUrl}/api/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${camerpayApiKey}`,
      },
      body: JSON.stringify({
        payment_method: request.operator === 'orange' ? 'orange_money' : request.operator === 'mtn' ? 'mtn_mobile_money' : 'stripe',
        amount: request.amount,
        currency: 'XAF',
        customer_phone: request.phone,
        merchant_invoice_id: reference,
        merchant_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/camerpay/callback`,
        merchant_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/camerpay/return`,
        source: 'api',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur Camerpay:', data);

      // Enregistrer le paiement échoué si commandeId est fourni
      if (commandeId) {
        await createPaymentRecord(
          commandeId,
          request.operator === 'orange' ? 'orange_money' : request.operator === 'mtn' ? 'mtn_mobile_money' : 'stripe',
          request.amount,
          reference,
          request.phone,
          request.operator,
          { error: data.message || data.error, camerpay_response: data }
        );
      }

      return { success: false, error: data.message || data.error || 'Erreur lors du paiement Camerpay' };
    }

    // Enregistrer le paiement réussi si commandeId est fourni
    let paymentId;
    if (commandeId) {
      const paymentResult = await createPaymentRecord(
        commandeId,
        request.operator === 'orange' ? 'orange_money' : request.operator === 'mtn' ? 'mtn_mobile_money' : 'stripe',
        request.amount,
        reference,
        request.phone,
        request.operator,
        { camerpay_response: data }
      );
      paymentId = paymentResult.paymentId;
    }

    return {
      success: true,
      payment: {
        reference: reference,
        amount: request.amount,
        phone: request.phone,
        status: 'pending',
        transactionId: data.transaction_id || data.id,
      },
      paymentId,
    };
  } catch (error: any) {
    console.error('Erreur initiateCamerpayPayment:', error);

    // Enregistrer le paiement échoué si commandeId est fourni
    if (commandeId) {
      await createPaymentRecord(
        commandeId,
        request.operator === 'orange' ? 'orange_money' : request.operator === 'mtn' ? 'mtn_mobile_money' : 'stripe',
        request.amount,
        request.reference,
        request.phone,
        request.operator,
        { error: error.message }
      );
    }

    return { success: false, error: error.message || 'Erreur lors du paiement Camerpay' };
  }
}

// Vérifier le statut d'un paiement Camerpay
export async function checkCamerpayPaymentStatus(
  reference: string
): Promise<{ success: boolean; status?: string; error?: string }> {
  try {
    const camerpayBaseUrl = process.env.CAMERPAY_BASE_URL || 'https://www.camerpay.biz';
    const camerpayApiKey = process.env.CAMERPAY_API_KEY;

    if (!camerpayApiKey) {
      return { success: false, error: 'Configuration Camerpay manquante' };
    }

    const response = await fetch(`${camerpayBaseUrl}/api/payment/status/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${camerpayApiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erreur vérification Camerpay:', data);
      return { success: false, error: data.message || 'Erreur lors de la vérification' };
    }

    return {
      success: true,
      status: data.status,
    };
  } catch (error: any) {
    console.error('Erreur checkCamerpayPaymentStatus:', error);
    return { success: false, error: error.message || 'Erreur lors de la vérification' };
  }
}

// Créer un enregistrement de paiement
export async function createPaymentRecord(
  commandeId: string,
  methodePaiement: string,
  montant: number,
  referenceTransaction?: string,
  telephone?: string,
  operator?: string,
  donneesTransaction?: any
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();

    const { data, error } = await supabase
      .from('paiements')
      .insert({
        commande_id: commandeId,
        methode: methodePaiement,
        montant: montant,
        statut: 'en_attente',
        numero_payeur: telephone,
        reference_operateur: referenceTransaction,
        transaction_id: referenceTransaction,
        reponse_api: donneesTransaction,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création paiement:', error);
      // Si la table n'existe pas, logguer seulement et continuer
      if (error.code === '42P01') {
        console.log('⚠️ Table paiements inexistante, paiement non enregistré');
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    console.log('✅ Paiement enregistré:', data.id);
    return { success: true, paymentId: data.id };
  } catch (error: any) {
    console.error('Erreur createPaymentRecord:', error);
    return { success: false, error: error.message };
  }
}

// Mettre à jour le statut d'un paiement
export async function updatePaymentStatus(
  paymentId: string,
  newStatus: string,
  referenceTransaction?: string,
  donneesTransaction?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();

    const updateData: any = {
      statut: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (referenceTransaction) {
      updateData.reference_operateur = referenceTransaction;
      updateData.transaction_id = referenceTransaction;
    }

    if (newStatus === 'confirme') {
      updateData.confirme_le = new Date().toISOString();
      updateData.montant_recu = donneesTransaction?.montant || donneesTransaction?.amount;
    }

    if (newStatus === 'echoue') {
      updateData.echoue_le = new Date().toISOString();
    }

    if (donneesTransaction) {
      updateData.reponse_api = donneesTransaction;
    }

    const { error } = await supabase
      .from('paiements')
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      console.error('Erreur mise à jour paiement:', error);
      if (error.code === '42P01') {
        console.log('⚠️ Table paiements inexistante, mise à jour ignorée');
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    console.log('✅ Statut paiement mis à jour:', newStatus);
    return { success: true };
  } catch (error: any) {
    console.error('Erreur updatePaymentStatus:', error);
    return { success: false, error: error.message };
  }
}

// Générer un reçu après confirmation du paiement
export async function generateReceipt(
  commandeId: string,
  paiementId: string
): Promise<{ success: boolean; receiptId?: string; receiptNumber?: string; error?: string }> {
  try {
    const supabase = await createAdminSupabaseClient();

    // Récupérer les informations de la commande et du paiement
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .select(`
        *,
        commande_items (
          id,
          produit_id,
          produit_nom,
          quantite,
          prix_unitaire
        )
      `)
      .eq('id', commandeId)
      .single();

    if (commandeError || !commande) {
      console.error('Erreur récupération commande:', commandeError);
      return { success: false, error: 'Commande introuvable' };
    }

    const { data: paiement, error: paiementError } = await supabase
      .from('paiements')
      .select('*')
      .eq('id', paiementId)
      .single();

    if (paiementError || !paiement) {
      console.error('Erreur récupération paiement:', paiementError);
      return { success: false, error: 'Paiement introuvable' };
    }

    // Créer le reçu (le numéro sera généré automatiquement par le trigger)
    const { data: recu, error: recuError } = await supabase
      .from('recus')
      .insert({
        commande_id: commandeId,
        paiement_id: paiementId,
        client_nom: commande.client_nom,
        client_prenom: commande.client_prenom,
        client_phone: commande.client_phone,
        client_email: commande.client_email || null,
        sous_total: commande.sous_total || commande.total_commande,
        frais_livraison: commande.frais_livraison || 0,
        total: commande.total_commande,
        methode_paiement: paiement.methode,
      })
      .select()
      .single();

    if (recuError) {
      console.error('Erreur création reçu:', recuError);
      if (recuError.code === '42P01') {
        console.log('⚠️ Table recus inexistante, reçu non généré');
        return { success: true };
      }
      return { success: false, error: recuError.message };
    }

    // Créer les items du reçu
    const recuItems = commande.commande_items?.map((item: any) => ({
      recu_id: recu.id,
      produit_nom: item.produit_nom,
      quantite: item.quantite,
      prix_unitaire: item.prix_unitaire,
      prix_total: item.quantite * item.prix_unitaire,
    })) || [];

    if (recuItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('recu_items')
        .insert(recuItems);

      if (itemsError) {
        console.error('Erreur création items reçu:', itemsError);
        if (itemsError.code !== '42P01') {
          return { success: false, error: itemsError.message };
        }
      }
    }

    console.log('✅ Reçu généré:', recu.numero_recu);
    return { success: true, receiptId: recu.id, receiptNumber: recu.numero_recu };
  } catch (error: any) {
    console.error('Erreur generateReceipt:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// ENVOI DE REÇU PAR EMAIL
// ============================================================

interface ReceiptData {
  numero_recu: string;
  commande_numero: string;
  client_nom: string;
  client_prenom: string;
  client_email: string;
  client_phone: string;
  sous_total: number;
  frais_livraison: number;
  total: number;
  methode_paiement: string;
  date: string;
  items: Array<{
    produit_nom: string;
    quantite: number;
    prix_unitaire: number;
    prix_total: number;
  }>;
}

// Générer le HTML du reçu
function generateReceiptHTML(data: ReceiptData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu de paiement - ADS</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .receipt-number {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 25px;
      border-left: 4px solid #667eea;
    }
    .receipt-number strong {
      color: #667eea;
      font-size: 18px;
    }
    .info-section {
      margin-bottom: 25px;
    }
    .info-section h3 {
      color: #333;
      font-size: 16px;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item label {
      color: #666;
      font-size: 13px;
      display: block;
      margin-bottom: 5px;
    }
    .info-item span {
      color: #333;
      font-weight: 600;
      font-size: 14px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th {
      background-color: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
      font-size: 14px;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }
    .items-table tr:last-child td {
      border-bottom: none;
    }
    .items-table .amount {
      text-align: right;
      font-weight: 600;
    }
    .total-section {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .total-row.final {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
      border-top: 2px solid #667eea;
      padding-top: 15px;
      margin-top: 15px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .payment-badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Angela Diagnostics & Services</h1>
      <p>Reçu de paiement</p>
    </div>
    <div class="content">
      <div class="receipt-number">
        <strong>Reçu #${data.numero_recu}</strong>
      </div>

      <div class="info-section">
        <h3>Informations de la commande</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Numéro de commande</label>
            <span>${data.commande_numero}</span>
          </div>
          <div class="info-item">
            <label>Date</label>
            <span>${new Date(data.date).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3>Informations du client</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Nom</label>
            <span>${data.client_prenom} ${data.client_nom}</span>
          </div>
          <div class="info-item">
            <label>Téléphone</label>
            <span>${data.client_phone}</span>
          </div>
          <div class="info-item">
            <label>Email</label>
            <span>${data.client_email}</span>
          </div>
          <div class="info-item">
            <label>Méthode de paiement</label>
            <span>${data.methode_paiement === 'orange_money' ? 'Orange Money' : 
                   data.methode_paiement === 'mtn_mobile_money' ? 'MTN Mobile Money' : 
                   data.methode_paiement}</span>
          </div>
        </div>
        <div class="payment-badge">✓ Paiement confirmé</div>
      </div>

      <div class="info-section">
        <h3>Détails des produits</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align: center;">Qté</th>
              <th class="amount">Prix unitaire</th>
              <th class="amount">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr>
                <td>${item.produit_nom}</td>
                <td style="text-align: center;">${item.quantite}</td>
                <td class="amount">${item.prix_unitaire.toLocaleString()} XAF</td>
                <td class="amount">${item.prix_total.toLocaleString()} XAF</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <div class="total-row">
          <span>Sous-total</span>
          <span>${data.sous_total.toLocaleString()} XAF</span>
        </div>
        <div class="total-row">
          <span>Frais de livraison</span>
          <span>${data.frais_livraison.toLocaleString()} XAF</span>
        </div>
        <div class="total-row final">
          <span>Total payé</span>
          <span>${data.total.toLocaleString()} XAF</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>Merci pour votre confiance !</p>
      <p>Angela Diagnostics & Services - Yaoundé, Cameroun</p>
      <p>Ce reçu a été généré automatiquement. Pour toute question, contactez notre service client.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Envoyer le reçu par email
export async function sendReceiptByEmail(
  receiptData: ReceiptData
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailService = process.env.EMAIL_SERVICE || 'resend';
    const fromEmail = process.env.FROM_EMAIL || 'noreply@ads-cameroun.com';
    const fromName = process.env.FROM_NAME || 'Angela Diagnostics & Services';

    const htmlContent = generateReceiptHTML(receiptData);

    if (emailService === 'resend') {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error('RESEND_API_KEY missing');
        return { success: false, error: 'Configuration email manquante' };
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: receiptData.client_email,
          subject: `Reçu de paiement #${receiptData.numero_recu} - Angela Diagnostics & Services`,
          html: htmlContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur Resend:', data);
        return { success: false, error: data.message || 'Erreur lors de l\'envoi de l\'email' };
      }

      console.log('✅ Email envoyé:', receiptData.client_email);
      return { success: true };
    } else {
      console.log('⚠️ Service email non configuré:', emailService);
      return { success: false, error: 'Service email non configuré' };
    }
  } catch (error: any) {
    console.error('Erreur sendReceiptByEmail:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'envoi de l\'email' };
  }
}

// Confirmer un paiement, générer le reçu et l'envoyer par email
export async function confirmPaymentGenerateReceiptAndSendEmail(
  paiementId: string,
  commandeId: string
): Promise<{ success: boolean; receiptNumber?: string; emailSent?: boolean; error?: string }> {
  try {
    // Mettre à jour le statut du paiement
    const updateResult = await updatePaymentStatus(paiementId, 'confirme');

    if (!updateResult.success) {
      return { success: false, error: updateResult.error };
    }

    // Générer le reçu
    const receiptResult = await generateReceipt(commandeId, paiementId);

    if (!receiptResult.success) {
      console.error('Erreur génération reçu:', receiptResult.error);
      return { success: false, error: receiptResult.error };
    }

    // Récupérer les données pour l'envoi d'email
    const supabase = await createAdminSupabaseClient();
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .select(`
        *,
        commande_items (
          produit_nom,
          quantite,
          prix_unitaire
        )
      `)
      .eq('id', commandeId)
      .single();

    if (commandeError || !commande) {
      console.error('Erreur récupération commande pour email:', commandeError);
      // Le reçu est généré mais l'email n'a pas pu être envoyé
      return { success: true, receiptNumber: receiptResult.receiptNumber, emailSent: false };
    }

    const { data: paiement } = await supabase
      .from('paiements')
      .select('*')
      .eq('id', paiementId)
      .single();

    if (!commande.client_email) {
      console.log('⚠️ Client sans email, envoi d\'email ignoré');
      return { success: true, receiptNumber: receiptResult.receiptNumber, emailSent: false };
    }

    // Préparer les données du reçu pour l'email
    const receiptData: ReceiptData = {
      numero_recu: receiptResult.receiptNumber || '',
      commande_numero: commande.numero_commande || commande.id.slice(0, 8),
      client_nom: commande.client_nom,
      client_prenom: commande.client_prenom,
      client_email: commande.client_email,
      client_phone: commande.client_phone,
      sous_total: commande.sous_total || commande.total_commande,
      frais_livraison: commande.frais_livraison || 0,
      total: commande.total_commande,
      methode_paiement: paiement?.methode || 'unknown',
      date: commande.created_at || new Date().toISOString(),
      items: commande.commande_items?.map((item: any) => ({
        produit_nom: item.produit_nom,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        prix_total: item.quantite * item.prix_unitaire,
      })) || [],
    };

    // Envoyer le reçu par email
    const emailResult = await sendReceiptByEmail(receiptData);

    if (!emailResult.success) {
      console.error('Erreur envoi email:', emailResult.error);
      // Le reçu est généré mais l'email n'a pas pu être envoyé
      return { success: true, receiptNumber: receiptResult.receiptNumber, emailSent: false, error: emailResult.error };
    }

    return { success: true, receiptNumber: receiptResult.receiptNumber, emailSent: true };
  } catch (error: any) {
    console.error('Erreur confirmPaymentGenerateReceiptAndSendEmail:', error);
    return { success: false, error: error.message };
  }
}

// Créer une commande avec paiement par virement bancaire
export async function createBankTransferOrder(
  userId: string,
  cartItems: any[],
  total: number,
  deliveryInfo: {
    nom: string;
    prenom: string;
    telephone: string;
    adresse: string;
    ville: string;
  }
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    // Calculer sous_total et frais_livraison
    const sousTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const fraisLivraison = 0; // À ajuster selon votre logique
    const totalCommande = sousTotal + fraisLivraison;

    // Créer la commande (numero_commande est auto-généré par trigger)
    const { data: order, error: orderError } = await supabase
      .from('commandes')
      .insert({
        user_id: userId,
        client_nom: deliveryInfo.nom,
        client_prenom: deliveryInfo.prenom,
        client_phone: deliveryInfo.telephone,
        adresse_livraison: deliveryInfo.adresse,
        ville_livraison: deliveryInfo.ville,
        sous_total: sousTotal,
        frais_livraison: fraisLivraison,
        total_commande: totalCommande,
        statut: 'en_attente',
        methode_paiement: 'virement_bancaire',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Erreur création commande:', orderError);
      return { success: false, error: orderError.message };
    }

    // Créer les articles de commande
    const orderItems = cartItems.map((item) => ({
      commande_id: order.id,
      produit_id: item.id,
      nom_produit: item.name,
      quantite: item.quantity,
      prix_unitaire: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('commande_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erreur création articles commande:', itemsError);
      return { success: false, error: itemsError.message };
    }

    // Mettre à jour le compteur de commandes dans localStorage
    if (typeof window !== 'undefined') {
      const currentCount = parseInt(localStorage.getItem('ads-order-count') || '0');
      localStorage.setItem('ads-order-count', (currentCount + 1).toString());
    }

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('Erreur createBankTransferOrder:', error);
    return { success: false, error: error.message || 'Erreur lors de la création de la commande' };
  }
}
