import { NextRequest, NextResponse } from 'next/server';
import { FLUTTERWAVE_CONFIG, generateTransactionRef } from '@/lib/flutterwave';

// POST - Initialiser un paiement Flutterwave
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, email, name, phone, orderId } = body;

    // Validation
    if (!amount || !email || !name || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Générer une référence de transaction unique
    const tx_ref = generateTransactionRef();

    // Créer le lien de paiement Flutterwave
    const paymentData = {
      tx_ref,
      amount: Number(amount),
      currency: FLUTTERWAVE_CONFIG.CURRENCY,
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout?order=${orderId}&txref=${tx_ref}`,
      customer: {
        email,
        phonenumber: phone || '',
        name,
      },
      customizations: {
        title: 'ADS - Angela Diagnostics et Services',
        description: `Paiement commande #${orderId}`,
        logo: process.env.NEXT_PUBLIC_LOGO_URL || '',
      },
      meta: {
        order_id: orderId,
      },
    };

    // Appeler l'API Flutterwave
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Flutterwave API error:', data);
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        link: data.data?.link,
        tx_ref,
        orderId,
      },
    });

  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
