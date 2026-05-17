import type { Category, Laboratory, Product } from '@/app/actions/catalog';
import { CONTACT } from '@/lib/config';

export function buildSiteKnowledgeContext(
  products: Product[],
  laboratories: Laboratory[],
  categories: Category[],
  lang: 'fr' | 'en' = 'fr'
): string {
  const labsList = laboratories
    .map((l) => `- ${l.nom} (slug: ${l.slug})`)
    .join('\n');

  const catsList = categories
    .slice(0, 40)
    .map((c) => {
      const lab = laboratories.find((l) => l.id === c.laboratoire_id);
      return `- ${c.nom} / ${lab?.nom || '?'} (lab: ${lab?.slug}, cat: ${c.slug})`;
    })
    .join('\n');

  const productsList = products
    .slice(0, 60)
    .map((p) => {
      const price = p.prix_promo ?? p.prix;
      const stock =
        p.quantite_stock > 0
          ? lang === 'fr'
            ? 'en stock'
            : 'in stock'
          : lang === 'fr'
            ? 'rupture'
            : 'out of stock';
      const lab = p.laboratoire?.nom || p.categorie?.laboratoire?.nom || '';
      const cat = p.categorie?.nom || '';
      return `- ${p.nom} | ${price} FCFA | ${stock} | ${lab} / ${cat} | /product/${p.slug}`;
    })
    .join('\n');

  return `
ENTREPRISE: ADS - Angela Diagnostics et Services
Adresse: ${CONTACT.address}
Téléphones: Orange ${CONTACT.phoneOrange}, MTN ${CONTACT.phoneMtn}
Email: ${CONTACT.email}

LABORATOIRES (${laboratories.length}):
${labsList || '(aucun)'}

CATÉGORIES (${categories.length}):
${catsList || '(aucune)'}

PRODUITS (${products.length} au catalogue, extraits):
${productsList || '(aucun)'}

LOGOS PARTENAIRES: Fortress, Bioline, Hightop, Liofilchem — voir /products
`.trim();
}

export function findLocalChatbotAnswer(
  message: string,
  products: Product[],
  laboratories: Laboratory[],
  categories: Category[],
  lang: 'fr' | 'en'
): string | null {
  const q = message.toLowerCase().trim();

  if (/laboratoire|laboratory|marque|brand|fortress|bioline|hightop|liofilchem/i.test(q)) {
    const lines = laboratories.map((l) => `• ${l.nom} → /products/${l.slug}`).join('\n');
    return lang === 'fr'
      ? `🏭 Nos laboratoires partenaires :\n${lines || '• Consultez /products'}\n\nLogos : Fortress, Bioline, Hightop, Liofilchem.`
      : `🏭 Our partner laboratories:\n${lines || '• See /products'}\n\nBrands: Fortress, Bioline, Hightop, Liofilchem.`;
  }

  if (/catégor|category|categorie/i.test(q)) {
    const lines = categories
      .slice(0, 15)
      .map((c) => {
        const lab = laboratories.find((l) => l.id === c.laboratoire_id);
        return `• ${c.nom} (${lab?.nom}) → /products/${lab?.slug}/${c.slug}`;
      })
      .join('\n');
    return lang === 'fr'
      ? `📂 Catégories du catalogue :\n${lines}\n\nVoir tout : /products`
      : `📂 Catalog categories:\n${lines}\n\nBrowse all: /products`;
  }

  if (/prix|price|coût|cost|combien/i.test(q)) {
    const matches = products.filter((p) => q.split(/\s+/).some((w) => w.length > 3 && p.nom.toLowerCase().includes(w)));
    if (matches.length > 0) {
      return matches
        .slice(0, 5)
        .map((p) => `• ${p.nom}: ${(p.prix_promo ?? p.prix).toLocaleString('fr-FR')} FCFA → /product/${p.slug}`)
        .join('\n');
    }
  }

  const words = q.split(/\s+/).filter((w) => w.length > 2);
  const matched = products.filter((p) =>
    words.some(
      (w) =>
        p.nom.toLowerCase().includes(w) ||
        p.description?.toLowerCase().includes(w) ||
        p.reference?.toLowerCase().includes(w)
    )
  );

  if (matched.length > 0) {
    const list = matched
      .slice(0, 6)
      .map((p) => {
        const price = (p.prix_promo ?? p.prix).toLocaleString('fr-FR');
        const stock = p.quantite_stock > 0 ? '✓' : '✗';
        return `• ${p.nom} — ${price} FCFA ${stock} → /product/${p.slug}`;
      })
      .join('\n');
    return lang === 'fr'
      ? `🔍 Produits trouvés sur notre site :\n${list}`
      : `🔍 Products found on our site:\n${list}`;
  }

  if (/contact|email|téléphone|phone|adresse|address/i.test(q)) {
    return lang === 'fr'
      ? `📞 ${CONTACT.address}\nOrange: ${CONTACT.phoneOrange}\nMTN: ${CONTACT.phoneMtn}\nEmail: ${CONTACT.email}\n→ /contact`
      : `📞 ${CONTACT.address}\nOrange: ${CONTACT.phoneOrange}\nMTN: ${CONTACT.phoneMtn}\nEmail: ${CONTACT.email}\n→ /contact`;
  }

  if (/livraison|delivery|expédition/i.test(q)) {
    return lang === 'fr'
      ? '🚚 Livraison express Afrique centrale (2-5 jours). Retrait gratuit à Yaoundé. Gratuit dès 50 000 FCFA.'
      : '🚚 Express delivery Central Africa (2-5 days). Free pickup in Yaoundé. Free from 50,000 FCFA.';
  }

  if (/paiement|payment|orange|mtn|mobile money/i.test(q)) {
    return lang === 'fr'
      ? '💳 Orange Money (#150#) et MTN Mobile Money (*126#). Paiement sécurisé au checkout.'
      : '💳 Orange Money and MTN Mobile Money. Secure payment at checkout.';
  }

  return null;
}
