import { Metadata } from "next";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | ADS - Angela Diagnostics et Services",
  description: "Politique de confidentialité d'ADS - Découvrez comment nous protégeons vos données personnelles.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Politique de Confidentialité
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
                  Introduction
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                Angela Diagnostics et Services (ADS) s'engage à protéger la confidentialité de vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Données Collectées
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 mb-4 leading-relaxed">
                Nous collectons les informations suivantes :
              </p>
              <ul className="list-disc pl-13 text-slate-600 dark:text-slate-400 space-y-2">
                <li>Nom et coordonnées (email, téléphone)</li>
                <li>Informations de facturation et livraison</li>
                <li>Historique des commandes</li>
                <li>Données de navigation sur notre site</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">3</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Utilisation des Données
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 mb-4 leading-relaxed">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc pl-13 text-slate-600 dark:text-slate-400 space-y-2">
                <li>Traiter et livrer vos commandes</li>
                <li>Vous contacter concernant vos commandes</li>
                <li>Améliorer nos services</li>
                <li>Envoyer des informations sur nos produits (avec votre consentement)</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">4</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Protection des Données
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
                vos données contre tout accès non autorisé, modification, divulgation ou destruction.
              </p>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">5</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Vos Droits
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 mb-4 leading-relaxed">
                Vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-13 text-slate-600 dark:text-slate-400 space-y-2">
                <li>Accès à vos données personnelles</li>
                <li>Rectification des données inexactes</li>
                <li>Suppression de vos données</li>
                <li>Opposition au traitement</li>
                <li>Portabilité des données</li>
              </ul>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white font-bold">6</div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Contact
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 pl-13 leading-relaxed">
                Pour toute question concernant cette politique ou pour exercer vos droits, contactez-nous :
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
