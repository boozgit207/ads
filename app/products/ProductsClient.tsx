'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../components/Toast';
import { Product, Laboratory, Category } from '../actions/catalog';
import { Search, ChevronDown, ShoppingCart, Eye, FlaskConical, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';

interface ProductsClientProps {
  products: Product[];
  laboratories: Laboratory[];
  categories: Category[];
  initialLab?: string;
  initialCategory?: string;
}

export default function ProductsClient({
  products,
  laboratories,
  categories,
  initialLab,
  initialCategory
}: ProductsClientProps) {
  const { addToCart: addToCartToContext } = useCart();
  const { locale } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLab, setSelectedLab] = useState(initialLab || 'Tous');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Tous');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  // Filtrer les produits quand les filtres changent
  useEffect(() => {
    let filtered = products;

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom?.toLowerCase().includes(term) ||
        p.nom_en?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term)
      );
    }

    // Filtre par laboratoire (par ID ou par nom)
    if (selectedLab !== 'Tous') {
      filtered = filtered.filter(p => 
        p.laboratoire?.id === selectedLab || 
        p.laboratoire?.nom === selectedLab
      );
    }

    // Filtre par catégorie (comparer avec categorie_id car URL contient l'ID)
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(p => p.categorie_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedLab, selectedCategory, products]);

  const t = {
    fr: {
      title: 'Nos Produits',
      search: 'Rechercher un produit...',
      filter: 'Filtrer',
      laboratory: 'Laboratoire',
      category: 'Catégorie',
      all: 'Tous',
      viewDetails: 'Voir détails',
      addToCart: 'Ajouter',
      inStock: 'En stock',
      outOfStock: 'Rupture',
      noResults: 'Aucun produit trouvé pour cette catégorie',
      resetFilters: 'Réinitialiser les filtres',
      seeAllProducts: 'Voir tous les produits',
      results: 'produits trouvés',
      priceOnRequest: 'Prix sur demande',
      stockAvailable: 'disponible'
    },
    en: {
      title: 'Our Products',
      search: 'Search for a product...',
      filter: 'Filter',
      laboratory: 'Laboratory',
      category: 'Category',
      all: 'All',
      viewDetails: 'View details',
      addToCart: 'Add to cart',
      inStock: 'In stock',
      outOfStock: 'Out of stock',
      noResults: 'No products found for this category',
      resetFilters: 'Reset filters',
      seeAllProducts: 'See all products',
      results: 'products found',
      priceOnRequest: 'Price on request',
      stockAvailable: 'available'
    }
  }[locale];

  const addToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: locale === 'fr' ? product.nom : (product.nom_en || product.nom),
      price: product.prix,
      quantity: 1,
      image: product.image_principale_url,
      slug: product.slug,
      laboratory: product.laboratoire?.nom || product.categorie?.laboratoire?.nom,
      stock: product.quantite_stock
    };

    addToCartToContext(cartItem);

    showToast(locale === 'fr' ? 'Produit ajouté au panier !' : 'Product added to cart!', 'success');
  };

  // Préparer les options de filtres - éliminer les doublons
  const labOptions = ['Tous', ...Array.from(new Set(laboratories.map(l => l.nom)))];
  // Utiliser les IDs pour les catégories pour correspondre à l'URL
  const catOptions = [{ id: 'Tous', nom: t.all }, ...categories.map(c => ({ id: c.id, nom: c.nom }))];

  // Helper pour obtenir le nom du produit selon la langue
  const getProductName = (p: Product) => locale === 'fr' ? p.nom : (p.nom_en || p.nom);
  
  // Helper pour obtenir le prix (avec promo si applicable)
  const getProductPrice = (p: Product) => {
    if (p.prix_promo && p.prix_promo < p.prix) {
      return p.prix_promo;
    }
    return p.prix;
  };

  // Helper pour vérifier si en stock
  const isInStock = (p: Product) => p.quantite_stock > 0 && p.statut === 'disponible';

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            {t.title}
          </h1>
          <p className="text-blue-100 dark:text-blue-200 text-lg">
            {filteredProducts.length} {t.results}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-700 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Laboratory Filter */}
            <div className="relative min-w-[180px]">
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-pointer"
              >
                {labOptions.map(lab => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[180px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all shadow-sm cursor-pointer"
              >
                {catOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nom}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-20 h-20 text-zinc-300 mx-auto mb-6" />
            <p className="text-zinc-500 text-xl font-medium mb-4">{t.noResults}</p>
            {(selectedCategory !== 'Tous' || selectedLab !== 'Tous' || searchTerm) && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setSelectedCategory('Tous');
                    setSelectedLab('Tous');
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  {t.resetFilters}
                </button>
                <Link
                  href="/products"
                  className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
                >
                  {t.seeAllProducts}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Image */}
                <Link href={`/product/${product.id}`} className="block relative h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                  {product.image_principale_url ? (
                    <Image
                      src={product.image_principale_url || ''}
                      unoptimized={product.image_principale_url?.includes('cloudinary.com')}
                      alt={getProductName(product)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FlaskConical className="w-24 h-24 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  )}
                  {!isInStock(product) && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="px-5 py-3 bg-red-500 text-white font-semibold rounded-xl shadow-lg">
                        {t.outOfStock}
                      </span>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.prix_promo && product.prix_promo < product.prix && (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                        PROMO
                      </div>
                    )}
                    {isInStock(product) && (
                      <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {t.inStock}
                      </div>
                    )}
                  </div>
                  {/* Quick actions overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      {t.viewDetails}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                      {product.laboratoire?.nom || product.categorie?.laboratoire?.nom || 'ADS'}
                    </p>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {getProductName(product)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-lg">
                      {product.categorie?.nom || ''}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/product/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 font-semibold transition-all duration-300"
                    >
                      <Eye className="w-5 h-5" />
                      {t.viewDetails}
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!isInStock(product)}
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none transition-all duration-300"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
