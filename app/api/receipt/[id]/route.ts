import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '../../../actions/payments';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createAdminSupabaseClient();

    // Récupérer le reçu avec ses items par l'ID de commande
    const { data: receipt, error: receiptError } = await supabase
      .from('recus')
      .select(`
        *,
        recu_items (*),
        commande:commandes (*)
      `)
      .eq('commande_id', id)
      .single();

    if (receiptError || !receipt) {
      return NextResponse.json(
        { success: false, error: 'Reçu introuvable' },
        { status: 404 }
      );
    }

    // Générer le HTML du reçu
    const html = generateReceiptHTML(receipt);

    // Retourner le HTML comme réponse
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="recu-${receipt.numero_recu}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Erreur téléchargement reçu:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du téléchargement du reçu' },
      { status: 500 }
    );
  }
}

function generateReceiptHTML(receipt: any): string {
  const date = new Date(receipt.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const itemsHTML = receipt.recu_items?.map((item: any) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">${item.produit_nom}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantite}</td>
      <td style="padding: 12px 8px; text-align: right;">${item.prix_unitaire.toLocaleString()} FCFA</td>
      <td style="padding: 12px 8px; text-align: right;">${item.prix_total.toLocaleString()} FCFA</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu ${receipt.numero_recu} - ADS</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .header p {
      color: #6b7280;
      margin: 0;
    }
    .receipt-number {
      text-align: right;
      margin-bottom: 30px;
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-section h3 {
      color: #1f2937;
      margin: 0 0 15px 0;
      font-size: 16px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .info-section p {
      margin: 8px 0;
      color: #4b5563;
      font-size: 14px;
    }
    .info-section strong {
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #2563eb;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    th:nth-child(2), th:nth-child(3), th:nth-child(4) {
      text-align: center;
    }
    td {
      padding: 12px 8px;
      font-size: 14px;
    }
    .totals {
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
      color: #4b5563;
    }
    .total-row.final {
      border-top: 2px solid #2563eb;
      border-bottom: none;
      font-weight: bold;
      font-size: 18px;
      color: #1f2937;
      margin-top: 10px;
      padding-top: 15px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .receipt {
        box-shadow: none;
        border-radius: 0;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>🧪 ADS - Angela Diagnostics et Services</h1>
      <p>Votre partenaire de confiance pour la distribution de réactifs de laboratoire</p>
    </div>

    <div class="receipt-number">
      Reçu N° ${receipt.numero_recu}
    </div>

    <div class="info-grid">
      <div class="info-section">
        <h3>Informations Client</h3>
        <p><strong>Nom:</strong> ${receipt.client_prenom} ${receipt.client_nom}</p>
        <p><strong>Téléphone:</strong> ${receipt.client_phone || 'N/A'}</p>
        <p><strong>Email:</strong> ${receipt.client_email || 'N/A'}</p>
      </div>
      <div class="info-section">
        <h3>Informations Reçu</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Méthode de paiement:</strong> ${formatPaymentMethod(receipt.methode_paiement)}</p>
        <p><strong>Statut:</strong> Payé</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
          <th>Prix unitaire</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Sous-total:</span>
        <span>${receipt.sous_total?.toLocaleString() || 0} FCFA</span>
      </div>
      <div class="total-row">
        <span>Frais de livraison:</span>
        <span>${receipt.frais_livraison?.toLocaleString() || 0} FCFA</span>
      </div>
      <div class="total-row final">
        <span>Total:</span>
        <span>${receipt.total?.toLocaleString() || 0} FCFA</span>
      </div>
    </div>

    <div class="footer">
      <p>Merci pour votre confiance !</p>
      <p>Yaoundé, Carrefour Intendance, Cameroun</p>
      <p>Orange: +237 697 12 13 28 | MTN: +237 686 09 42 05</p>
      <p>© ${new Date().getFullYear()} ADS - Angela Diagnostics et Services</p>
    </div>
  </div>
</body>
</html>
  `;
}

function formatPaymentMethod(method: string): string {
  const methods: Record<string, string> = {
    'orange_money': 'Orange Money',
    'mtn_mobile_money': 'MTN Mobile Money',
    'virement_bancaire': 'Virement bancaire',
    'especes': 'Espèces',
  };
  return methods[method] || method;
}
