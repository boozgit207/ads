import { NextRequest, NextResponse } from 'next/server';
import { createBankTransferOrder } from '../../actions/payments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cartItems, total, deliveryInfo, paymentMethod } = body;

    if (!userId || !cartItems || !total || !deliveryInfo) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Créer la commande pour virement bancaire
    const result = await createBankTransferOrder(
      userId,
      cartItems,
      total,
      deliveryInfo
    );

    if (result.success) {
      return NextResponse.json({ success: true, orderId: result.orderId });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erreur API orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
