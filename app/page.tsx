import HomePage from "./components/home/HomePage";
import { Metadata } from "next";
import { getCategories } from "./actions/catalog";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Réactifs de laboratoire au Cameroun | ADS - Fortress, Bioline",
  description:
    "ADS distribue des réactifs de laboratoire au Cameroun : latex RPR, CRP, ASO, ELISA, hormones, biochimie. Marques Fortress Diagnostics et Bioline. Stock Yaoundé, livraison Douala.",
  keywords:
    "réactifs laboratoire Cameroun, réactifs Fortress Diagnostics, Bioline Yaoundé, test latex RPR CRP, ELISA laboratoire, réactifs biochimie Douala, distributeur réactifs Afrique",
  openGraph: {
    title: "Réactifs de laboratoire au Cameroun | ADS",
    description:
      "Distributeur de réactifs de laboratoire au Cameroun — Fortress, Bioline, Hightop. Commande en ligne, livraison et retrait à Yaoundé.",
    url: absoluteUrl("/"),
    type: "website",
  },
  alternates: {
    canonical: absoluteUrl("/"),
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
