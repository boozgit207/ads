// Configuration centralisée des informations de contact
// Modifiez ces valeurs pour mettre à jour les informations de contact partout dans l'application

export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'angeladiagnostics8@gmail.com',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+237 697 12 13 28',
  phoneOrange: '+237 697 12 13 28',
  phoneMtn: '+237 686 09 42 05',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '+237 697 12 13 28',
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Yaoundé, Carrefour Intendance, Cameroun',
} as const;

export const COMPANY = {
  name: 'ADS - Angela Diagnostics et Services',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://ads-diagnostics.com',
} as const;
