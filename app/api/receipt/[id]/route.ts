import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Récupérer la commande avec ses items
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
      .eq('id', id)
      .single();

    if (commandeError || !commande) {
      return NextResponse.json(
        { success: false, error: 'Commande introuvable' },
        { status: 404 }
      );
    }

    // Construire un objet receipt-like depuis les données de la commande
    const receipt = {
      numero_recu: commande.numero_commande,
      client_nom: commande.client_nom,
      client_prenom: commande.client_prenom,
      client_phone: commande.client_phone,
      client_email: commande.client_email,
      sous_total: commande.sous_total || commande.total_commande,
      frais_livraison: commande.frais_livraison || 0,
      total: commande.total_commande,
      methode_paiement: commande.methode_paiement,
      created_at: commande.created_at,
      recu_items: commande.commande_items?.map((item: any) => ({
        produit_nom: item.produit_nom,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
        prix_total: item.quantite * item.prix_unitaire,
      })) || [],
    };

    // Générer le PDF du reçu
    const pdfBuffer = await generateReceiptPDF(receipt);

    // Retourner le PDF comme réponse
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recu-${receipt.numero_recu}.pdf"`,
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

async function generateReceiptPDF(receipt: any): Promise<Buffer> {
  const doc = new jsPDF();

  // Charger le logo SVG
  let logoDataUrl = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo_1.svg');
    if (fs.existsSync(logoPath)) {
      const logoSvg = fs.readFileSync(logoPath, 'utf-8');
      // Convertir SVG en data URL (simplifié - pour une meilleure qualité, utiliser une bibliothèque comme svg2img)
      logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`;
    }
  } catch (error) {
    console.log('Logo non disponible, utilisation du texte');
  }

  const date = new Date(receipt.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Couleurs
  const primaryColor = [37, 99, 235]; // #2563eb
  const textColor = [31, 41, 55]; // #1f2937
  const grayColor = [75, 85, 99]; // #4b5563

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ADS - Angela Diagnostics et Services', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Votre partenaire de confiance pour la distribution de réactifs de laboratoire', 105, 30, { align: 'center' });

  // Logo (si disponible)
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'SVG', 15, 5, 30, 30);
    } catch (error) {
      console.log('Erreur ajout logo SVG');
    }
  }

  // Numéro de reçu
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Reçu N° ${receipt.numero_recu}`, 195, 55, { align: 'right' });

  // Informations client
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Client', 15, 65);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Nom: ${receipt.client_prenom} ${receipt.client_nom}`, 15, 75);
  doc.text(`Téléphone: ${receipt.client_phone || 'N/A'}`, 15, 82);
  doc.text(`Email: ${receipt.client_email || 'N/A'}`, 15, 89);

  // Informations reçu
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Reçu', 110, 65);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Date: ${date}`, 110, 75);
  doc.text(`Méthode de paiement: ${formatPaymentMethod(receipt.methode_paiement)}`, 110, 82);
  doc.text('Statut: Payé', 110, 89);

  // Tableau des articles
  let y = 105;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(15, y - 5, 180, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Produit', 20, y);
  doc.text('Qté', 120, y, { align: 'center' });
  doc.text('Prix unitaire', 140, y);
  doc.text('Total', 170, y);

  y += 10;
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFont('helvetica', 'normal');

  receipt.recu_items?.forEach((item: any) => {
    const productName = item.produit_nom.length > 40 ? item.produit_nom.substring(0, 40) + '...' : item.produit_nom;
    doc.text(productName, 20, y);
    doc.text(item.quantite.toString(), 120, y, { align: 'center' });
    doc.text(`${item.prix_unitaire.toLocaleString()} FCFA`, 140, y);
    doc.text(`${item.prix_total.toLocaleString()} FCFA`, 170, y);
    y += 8;
  });

  // Totaux
  y += 10;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, y - 5, 195, y - 5);

  doc.text(`Sous-total: ${receipt.sous_total?.toLocaleString() || 0} FCFA`, 150, y + 5, { align: 'right' });
  doc.text(`Frais de livraison: ${receipt.frais_livraison?.toLocaleString() || 0} FCFA`, 150, y + 12, { align: 'right' });

  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(1);
  doc.line(15, y + 18, 195, y + 18);

  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${receipt.total?.toLocaleString() || 0} FCFA`, 150, y + 25, { align: 'right' });

  // Footer
  y += 40;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, y, 195, y);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci pour votre confiance !', 105, y + 8, { align: 'center' });
  doc.text('Yaoundé, Carrefour Intendance, Cameroun', 105, y + 15, { align: 'center' });
  doc.text('Orange: +237 697 12 13 28 | MTN: +237 686 09 42 05', 105, y + 22, { align: 'center' });
  doc.text(`© ${new Date().getFullYear()} ADS - Angela Diagnostics et Services`, 105, y + 29, { align: 'center' });

  return Buffer.from(doc.output('arraybuffer'));
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
