import { NextRequest, NextResponse } from 'next/server';
import { FLUTTERWAVE_CONFIG } from '@/lib/flutterwave';

// POST - Vérifier le statut d'un paiement
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, tx_ref } = body;

    // Vérifier par ID de transaction ou par référence
    const verifyUrl = transactionId 
      ? `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

    const response = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Flutterwave verify error:', data);
      return NextResponse.json(
        { error: data.message || 'Verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });

  } catch (error) {
    console.error('Error verifying Flutterwave payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
