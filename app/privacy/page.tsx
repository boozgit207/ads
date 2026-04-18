import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | ADS - Angela Diagnostics et Services",
  description: "Politique de confidentialité d'ADS - Découvrez comment nous protégeons vos données personnelles.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          Politique de Confidentialité
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Dernière mise à jour : 17 Avril 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Angela Diagnostics et Services (ADS) s'engage à protéger la confidentialité de vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              2. Données Collectées
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Nous collectons les informations suivantes :
            </p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Nom et coordonnées (email, téléphone)</li>
              <li>Informations de facturation et livraison</li>
              <li>Historique des commandes</li>
              <li>Données de navigation sur notre site</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              3. Utilisation des Données
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter concernant vos commandes</li>
              <li>Améliorer nos services</li>
              <li>Envoyer des informations sur nos produits (avec votre consentement)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              4. Protection des Données
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
              vos données contre tout accès non autorisé, modification, divulgation ou destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              5. Vos Droits
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Accès à vos données personnelles</li>
              <li>Rectification des données inexactes</li>
              <li>Suppression de vos données</li>
              <li>Opposition au traitement</li>
              <li>Portabilité des données</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              6. Contact
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Pour toute question concernant cette politique ou pour exercer vos droits, contactez-nous :
            </p>
            <ul className="list-none pl-0 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Email : angeladiagnostics8@gmail.com</li>
              <li>Téléphone : +237 697121328 (Orange) / 686094205 (MTN)</li>
              <li>Adresse : B.P. 12028 Douala Akwa, Cameroun</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
