import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aide & FAQ | ADS - Questions Fréquentes',
  description: 'Trouvez les réponses à vos questions sur les réactifs de laboratoire, la livraison, les paiements et le support technique. FAQ complète ADS.',
  keywords: 'aide, FAQ, questions fréquentes, support, livraison, paiement, retours, réactifs laboratoire, Cameroun, Elisa, test rapide, chlamydia',
  openGraph: {
    title: 'Aide & FAQ | ADS - Questions Fréquentes',
    description: 'Trouvez les réponses à vos questions sur nos produits et services',
    type: 'website',
    url: 'https://ads-diagnostics.com/help',
  },
  alternates: {
    canonical: 'https://ads-diagnostics.com/help',
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
