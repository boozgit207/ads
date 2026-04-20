import HomePage from "./components/home/HomePage";
import { Metadata } from "next";
import { getCategories } from "./actions/catalog";

export const metadata: Metadata = {
  metadataBase: new URL('https://ads-str7.vercel.app'),
  title: "Accueil | ADS - Angela Diagnostics et Services",
  description: "Découvrez ADS, votre partenaire de confiance pour la distribution de réactifs de laboratoire et solutions diagnostiques en Afrique. Tests COVID-19, HIV, Malaria, Biochimie et plus.",
  keywords: "accueil, réactifs laboratoire, tests diagnostiques, COVID-19, HIV, malaria, biochimie, Cameroun, Afrique, Elisa, test rapide, chlamydia",
  openGraph: {
    title: "Accueil | ADS - Angela Diagnostics et Services",
    description: "Découvrez ADS, votre partenaire de confiance pour la distribution de réactifs de laboratoire et solutions diagnostiques en Afrique",
    url: "https://ads-str7.vercel.app",
    type: "website",
  },
};

export default async function Home() {
  const catsResult = await getCategories();
  const categories = catsResult.success ? catsResult.categories || [] : [];

  return (
    <main>
      <HomePage categories={categories} />
    </main>
  );
}
