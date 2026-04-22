import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Récupérer les produits avec leurs images, catégories et laboratoires (via categories)
    const { data: products, error } = await supabase
      .from('produits')
      .select(`
        *,
        categorie:categories (nom, laboratoire:laboratoires(nom)),
        images:produit_images (url)
      `)
      .order('quantite_stock', { ascending: false })
      .limit(8);

    console.log('Produits récupérés:', products?.length, 'Erreur:', error);
    console.log('Sample product:', products?.[0]);

    if (error) throw error;

    // Transformer les données pour inclure l'image principale ou la première image
    const transformedProducts = products?.map(product => ({
      id: product.id,
      name: product.nom,
      price: product.prix,
      quantity: 1,
      stock: product.quantite_stock,
      image: product.image_principale_url ||
        (product.images && product.images.length > 0 ? product.images[0].url : null),
      slug: product.slug || product.id,
      category: product.categorie?.nom,
      laboratory: product.categorie?.laboratoire?.nom
    })).filter(p => p.price && p.price > 0) || [];

    console.log('Produits transformés:', transformedProducts.length);

    return Response.json({ products: transformedProducts });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits vedettes:', error);
    return Response.json({ products: [] }, { status: 200 });
  }
}
