// Configuration Flutterwave pour les paiements
// Mode test (sandbox) - remplacer par les vraies clés en production

export const FLUTTERWAVE_CONFIG = {
  // Clés API (mode test)
  PUBLIC_KEY: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-xxxxxxxxxxxxxxxx', // Remplacer par la vraie clé publique
  SECRET_KEY: process.env.FLUTTERWAVE_SECRET_KEY || 'fam7TnL7139X2hg6HkdRBOGpt5K4BqtR',
  ENCRYPTION_KEY: process.env.FLUTTERWAVE_ENCRYPTION_KEY || 'eCnprU3o2a7ZGIR44hh5wa+E3nCuGNs+yWcCU5YQtMA=',
  
  // Configuration
  IS_SANDBOX: process.env.NODE_ENV !== 'production',
  
  // URLs de redirection
  REDIRECT_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/checkout',
  
  // Devise
  CURRENCY: 'XAF', // Franc CFA pour Cameroun
  COUNTRY: 'CM',   // Cameroun
};

// Types pour Flutterwave
export interface FlutterwavePaymentConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  country: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  redirect_url?: string;
  meta?: Record<string, any>;
}

// Générer une référence de transaction unique
export function generateTransactionRef(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ADS_${timestamp}_${random}`;
}

// Vérifier le statut d'un paiement
export async function verifyPayment(transactionId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

// Initialiser un paiement (pour les paiements backend)
export async function initializePayment(data: {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  orderId: string;
}): Promise<any> {
  try {
    const tx_ref = generateTransactionRef();
    
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_CONFIG.SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref,
        amount: data.amount,
        currency: FLUTTERWAVE_CONFIG.CURRENCY,
        redirect_url: `${FLUTTERWAVE_CONFIG.REDIRECT_URL}?order=${data.orderId}&txref=${tx_ref}`,
        customer: {
          email: data.email,
          phonenumber: data.phone || '',
          name: data.name,
        },
        customizations: {
          title: 'ADS - Angela Diagnostics et Services',
          description: 'Paiement de commande',
          logo: 'https://ads-diagnostics.com/logo.png',
        },
        meta: {
          order_id: data.orderId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
}
