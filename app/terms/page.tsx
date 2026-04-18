import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | ADS - Angela Diagnostics et Services",
  description: "Conditions d'utilisation d'ADS - Consultez nos termes et conditions pour l'utilisation de nos services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
          Conditions d'Utilisation
        </h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">
            Dernière mise à jour : 17 Avril 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              1. Acceptation des Conditions
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              En accédant et en utilisant le site web d'Angela Diagnostics et Services (ADS), 
              vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas 
              ces conditions, veuillez ne pas utiliser notre site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              2. Description des Services
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              ADS est une entreprise spécialisée dans la distribution de réactifs de laboratoire 
              et solutions diagnostiques. Nos produits sont destinés exclusivement aux professionnels 
              de santé et laboratoires agréés.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              3. Commandes et Paiements
            </h2>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Les commandes sont soumises à validation par notre équipe commerciale</li>
              <li>Les prix sont indiqués en FCFA et peuvent être modifiés sans préavis</li>
              <li>Paiement possible par Orange Money, MTN Mobile Money ou virement bancaire</li>
              <li>Les commandes sont traitées sous 24-48h ouvrées</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              4. Livraison
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Les livraisons sont effectuées dans toutes les régions du Cameroun. Les délais de 
              livraison varient selon la localisation :
            </p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Douala et Yaoundé : 24-48h</li>
              <li>Autres villes : 2-5 jours ouvrés</li>
              <li>Frais de livraison calculés selon la destination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              5. Retours et Remboursements
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              En raison de la nature sensible des produits médicaux et diagnostiques, les retours 
              ne sont acceptés que dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 text-zinc-600 dark:text-zinc-400 space-y-2">
              <li>Produit défectueux ou endommagé à la réception</li>
              <li>Erreur de livraison (produit non conforme à la commande)</li>
              <li>Produit périmé à la livraison</li>
            </ul>
            <p className="text-zinc-600 dark:text-zinc-400 mt-4">
              Les demandes de retour doivent être effectuées dans les 48h suivant la réception.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              6. Propriété Intellectuelle
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Tout le contenu du site (logos, textes, images) est la propriété exclusive d'ADS 
              et est protégé par les lois sur la propriété intellectuelle. Toute reproduction 
              sans autorisation écrite est interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
              7. Contact
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Pour toute question concernant ces conditions :
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
