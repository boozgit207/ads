import { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | ADS - Angela Diagnostics et Services",
  description: "Conditions d'utilisation d'ADS - Consultez nos termes et conditions pour l'utilisation de nos services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Conditions d'Utilisation
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Dernière mise à jour : 22 Avril 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 sm:p-12 shadow-lg">
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">1</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Acceptation des Conditions
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                En accédant et en utilisant le site web d'Angela Diagnostics et Services (ADS), 
                vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas 
                ces conditions, veuillez ne pas utiliser notre site.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Description des Services
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                ADS est une entreprise spécialisée dans la distribution de réactifs de laboratoire 
                et solutions diagnostiques. Nos produits sont destinés exclusivement aux professionnels 
                de santé et laboratoires agréés.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">3</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Commandes et Paiements
                </h2>
              </div>
              <ul className="list-disc pl-13 text-slate-600 dark:text-slate-400 space-y-2">
                <li>Les commandes sont soumises à validation par notre équipe commerciale</li>
                <li>Les prix sont indiqués en FCFA et peuvent être modifiés sans préavis</li>
                <li>Paiement possible par Orange Money, MTN Mobile Money ou virement bancaire</li>
                <li>Les commandes sont traitées sous 24-48h ouvrées</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">4</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Livraison
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 mb-4 leading-relaxed">
                Les livraisons sont effectuées dans toutes les régions du Cameroun. Les délais de 
                livraison varient selon la localisation :
              </p>
              <ul className="list-disc pl-13 text-slate-600 dark:text-slate-400 space-y-2">
                <li>Yaoundé : 24-48h</li>
                <li>Douala : 24-48h</li>
                <li>Autres villes : 2-5 jours ouvrés</li>
                <li>Frais de livraison calculés selon la destination</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">5</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Retours et Remboursements
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 mb-4 leading-relaxed">
                En raison de la nature sensible des produits médicaux et diagnostiques, les retours 
                ne sont acceptés que dans les cas suivants :
              </p>
              <ul className="list-disc pl-13 text-slate-600 dark:text-slate-400 space-y-2">
                <li>Produit défectueux ou endommagé à la réception</li>
                <li>Erreur de livraison (produit non conforme à la commande)</li>
                <li>Produit périmé à la livraison</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 pl-13 mt-4 leading-relaxed">
                Les demandes de retour doivent être effectuées dans les 48h suivant la réception.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">6</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Propriété Intellectuelle
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                Tout le contenu du site (logos, textes, images) est la propriété exclusive d'ADS 
                et est protégé par les lois sur la propriété intellectuelle. Toute reproduction 
                sans autorisation écrite est interdite.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">7</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Contact
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                Pour toute question concernant ces conditions d'utilisation, n'hésitez pas à nous contacter :
              </p>
              <div className="pl-13 mt-4 space-y-2">
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Email :</strong> angeladiagnostics8@gmail.com
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Téléphone :</strong> +237 697 12 13 28
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>Adresse :</strong> Yaoundé, Carrefour Intendance, Cameroun
                </p>
              </div>
            </section>

            {/* CTA */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-all hover:scale-105 shadow-lg"
                >
                  Nous Contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
