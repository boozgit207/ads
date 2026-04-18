import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | ADS - Angela Diagnostics et Services',
  description: 'Contactez ADS pour vos besoins en réactifs de laboratoire et tests diagnostiques. Disponible à Douala, Cameroun. Email, téléphone, WhatsApp et formulaire de contact.',
  keywords: 'contact, ADS, réactifs laboratoire, Douala, Cameroun, devis, support, assistance, Elisa, test rapide, chlamydia',
  openGraph: {
    title: 'Contact | ADS - Angela Diagnostics et Services',
    description: 'Contactez-nous pour vos besoins en réactifs de laboratoire - Douala, Cameroun',
    type: 'website',
    url: 'https://ads-diagnostics.com/contact',
  },
  alternates: {
    canonical: 'https://ads-diagnostics.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
