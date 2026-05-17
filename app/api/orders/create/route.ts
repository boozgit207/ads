import { NextRequest, NextResponse } from 'next/server';
import { createOrderFromCheckout } from '@/app/actions/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      cart,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      notes,
      deliveryOption,
      paymentMethod,
    } = body;

    if (!cart?.length || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Informations incomplètes' },
        { status: 400 }
      );
    }

    if (deliveryOption === 'delivery' && !address?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Adresse de livraison requise' },
        { status: 400 }
      );
    }

    const result = await createOrderFromCheckout({
      userId: userId || null,
      cart,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      notes,
      deliveryOption: deliveryOption || 'pickup',
      paymentMethod: paymentMethod || 'om',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        orderId: result.orderId,
        numero: result.numero,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
