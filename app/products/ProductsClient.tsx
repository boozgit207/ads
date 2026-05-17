'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import { showToast } from '../components/Toast';
import { Product, Laboratory, Category } from '../actions/catalog';
import { FlaskConical, Check, PanelLeftOpen } from 'lucide-react';
import CatalogFiltersPanel, { OPEN_CATALOG_FILTERS_EVENT } from './CatalogFiltersPanel';
import { useCart } from '../context/CartContext';
import { useI18n } from '../context/I18nContext';
import StarRating from '../components/StarRating';
import { getProductDisplayName, getProductImageAlt } from '@/lib/image-seo';
import { catalogPath } from '@/lib/catalog-urls';
import LabLogo from '@/app/components/LabLogo';
import LabCatalogBanner from '@/app/components/catalog/LabCatalogBanner';
import ProductCardActions from '@/app/components/products/ProductCardActions';

interface ProductsClientProps {
  products: Product[];
  laboratories: Laboratory[];
  categories: Category[];
  initialLabId?: string;
  initialCategoryId?: string;
  initialLabSlug?: string;
  initialCategorySlug?: string;
}

function productHref(product: Product) {
  return `/product/${product.slug || product.id}`;
}

export default function ProductsClient({
  products,
  laboratories,
  categories,
  initialLabId = 'Tous',
  initialCategoryId = 'Tous',
  initialLabSlug,
  initialCategorySlug,
}: ProductsClientProps) {
  const { addToCart: addToCartToContext } = useCart();
  const { locale } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabId, setSelectedLabId] = useState(initialLabId);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [sortBy, setSortBy] = useState('name-asc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const openDrawer = () => setFiltersOpen(true);
    window.addEventListener(OPEN_CATALOG_FILTERS_EVENT, openDrawer);
    return () => window.removeEventListener(OPEN_CATALOG_FILTERS_EVENT, openDrawer);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [filtersOpen]);

  const currentLab = useMemo(
    () => (selectedLabId === 'Tous' ? undefined : laboratories.find((l) => l.id === selectedLabId)),
    [selectedLabId, laboratories]
  );
  const currentCategory = useMemo(
    () =>
      selectedCategoryId === 'Tous'
        ? undefined
        : categories.find((c) => c.id === selectedCategoryId),
    [selectedCategoryId, categories]
  );
  const displayLab = currentLab;
  const displayCategory = currentCategory;

  const updateFilters = useCallback(
    (labId: string, categoryId: string) => {
      setSelectedLabId(labId);
      setSelectedCategoryId(categoryId);
      if (typeof window !== 'undefined') {
        const lab = labId === 'Tous' ? null : laboratories.find((l) => l.id === labId);
        const cat = categoryId === 'Tous' ? null : categories.find((c) => c.id === categoryId);
        const path = catalogPath(lab, cat);
        window.history.replaceState(null, '', path);
      }
    },
    [laboratories, categories]
  );

  useEffect(() => {
    setSelectedLabId(initialLabId);
    setSelectedCategoryId(initialCategoryId);
  }, [initialLabId, initialCategoryId]);

  const visibleCategories = useMemo(() => {
    if (selectedLabId === 'Tous') return categories;
    return categories.filter((c) => c.laboratoire_id === selectedLabId);
  }, [categories, selectedLabId]);

  // Filtrer les produits quand les filtres changent
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nom?.toLowerCase().includes(term) ||
          p.nom_en?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.reference?.toLowerCase().includes(term)
      );
    }

    if (selectedCategoryId !== 'Tous') {
      filtered = filtered.filter((p) => p.categorie_id === selectedCategoryId);
    } else if (selectedLabId !== 'Tous') {
      filtered = filtered.filter((p) => p.laboratoire?.id === selectedLabId);
    }

    // Tri des produits
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return getProductName(a).localeCompare(getProductName(b));
        case 'name-desc':
          return getProductName(b).localeCompare(getProductName(a));
        case 'price-asc':
          return getProductPrice(a) - getProductPrice(b);
        case 'price-desc':
          return getProductPrice(b) - getProductPrice(a);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, selectedLabId, selectedCategoryId, sortBy, products, locale]);

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
      stockAvailable: 'disponible',
      sortBy: 'Trier par',
      nameAsc: 'Nom (A-Z)',
      nameDesc: 'Nom (Z-A)',
      priceAsc: 'Prix (croissant)',
      priceDesc: 'Prix (décroissant)',
      catalogTitle: 'Catalogue réactifs',
      labs: 'Marques / laboratoires',
      categories: 'Catégories',
      showFilters: 'Afficher les filtres',
      hideFilters: 'Masquer les filtres',
      filtersTitle: 'Filtres',
      applyFilters: 'Appliquer',
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
      stockAvailable: 'available',
      sortBy: 'Sort by',
      nameAsc: 'Name (A-Z)',
      nameDesc: 'Name (Z-A)',
      priceAsc: 'Price (low to high)',
      priceDesc: 'Price (high to low)',
      catalogTitle: 'Reagents catalog',
      labs: 'Brands / laboratories',
      categories: 'Categories',
      showFilters: 'Show filters',
      hideFilters: 'Hide filters',
      filtersTitle: 'Filters',
      applyFilters: 'Apply',
    },
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

  const filterLabels = {
    search: t.search,
    all: t.all,
    labs: t.labs,
    categories: t.categories,
    nameAsc: t.nameAsc,
    nameDesc: t.nameDesc,
    priceAsc: t.priceAsc,
    priceDesc: t.priceDesc,
    filtersTitle: t.filtersTitle,
    apply: t.applyFilters,
  };

  const handleSelectLab = (labId: string) => {
    updateFilters(labId, 'Tous');
    setFiltersOpen(false);
  };

  const handleSelectCategory = (labId: string, categoryId: string) => {
    updateFilters(labId, categoryId);
    setFiltersOpen(false);
  };

  const pageTitle =
    displayCategory && displayLab
      ? `${displayCategory.nom} — ${displayLab.nom}`
      : displayLab
        ? displayLab.nom
        : displayCategory
          ? displayCategory.nom
          : t.title;

  // Helper pour obtenir le nom du produit selon la langue
  const getProductName = (p: Product) => getProductDisplayName(p, locale);
  
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
    <>
      <LoadingScreen />
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-2">
            {t.catalogTitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-blue-100 dark:text-blue-200 text-lg">
            {filteredProducts.length} {t.results}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {filtersOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 bg-black/50 z-40"
              aria-label={t.hideFilters}
              onClick={() => setFiltersOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 z-50 w-[min(320px,90vw)] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-xl p-4 flex flex-col">
              <CatalogFiltersPanel
                labels={filterLabels}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selectedLabId={selectedLabId}
                selectedCategoryId={selectedCategoryId}
                laboratories={laboratories}
                visibleCategories={visibleCategories}
                onSelectLab={handleSelectLab}
                onSelectCategory={handleSelectCategory}
                showClose
                onClose={() => setFiltersOpen(false)}
              />
            </aside>
          </>
        )}

        <div className="flex items-center gap-3 py-4">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
            {t.showFilters}
          </button>
        </div>

      {displayLab && (
        <div className="pt-4">
          <LabCatalogBanner
            nom={displayLab.nom}
            slug={displayLab.slug}
            description={displayLab.description}
            productCount={filteredProducts.length}
            productCountLabel={locale === 'fr' ? 'produits' : 'products'}
          />
        </div>
      )}

      <main className="py-6 lg:py-10 w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical className="w-20 h-20 text-zinc-300 mx-auto mb-6" />
            <p className="text-zinc-500 text-xl font-medium mb-4">{t.noResults}</p>
            {(selectedCategoryId !== 'Tous' || selectedLabId !== 'Tous' || searchTerm) && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    updateFilters('Tous', 'Tous');
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  {t.resetFilters}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateFilters('Tous', 'Tous');
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors font-medium"
                >
                  {t.seeAllProducts}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Si une catégorie est spécifique, afficher directement les produits sans regrouper par laboratoire */}
            {selectedCategoryId !== 'Tous' ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {(displayLab || displayCategory) && (
                  <div className="p-4 pb-0">
                    <LabCatalogBanner
                      nom={
                        displayLab?.nom ||
                        laboratories.find((l) => l.id === displayCategory?.laboratoire_id)?.nom ||
                        displayCategory?.nom ||
                        ''
                      }
                      slug={
                        displayLab?.slug ||
                        laboratories.find((l) => l.id === displayCategory?.laboratoire_id)?.slug
                      }
                      description={
                        displayLab?.description ||
                        (displayCategory
                          ? `${displayCategory.nom} — ${filteredProducts.length} ${locale === 'fr' ? 'produits' : 'products'}`
                          : undefined)
                      }
                      productCount={filteredProducts.length}
                      productCountLabel={locale === 'fr' ? 'produits' : 'products'}
                    />
                  </div>
                )}

                {/* Products Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500"
              >
                {/* Image */}
                <Link href={productHref(product)} className="block relative h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                  {product.image_principale_url ? (
                    <Image
                      src={product.image_principale_url || ''}
                      unoptimized={product.image_principale_url?.includes('cloudinary.com')}
                      alt={getProductImageAlt(product, locale)}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FlaskConical className="w-24 h-24 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  )}
                  {!isInStock(product) && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-lg">
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
                    <div className="mb-2">
                      <LabLogo
                        slug={product.laboratoire?.slug || product.categorie?.laboratoire?.slug}
                        nom={product.laboratoire?.nom || product.categorie?.laboratoire?.nom}
                        size="sm"
                      />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {getProductName(product)}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-lg">
                      {product.categorie?.nom || ''}
                    </span>
                  </div>
                  <div className="mb-4">
                    <StarRating rating={product.averageRating || 0} size={14} />
                  </div>

                  <ProductCardActions
                    href={productHref(product)}
                    price={product.prix}
                    promoPrice={product.prix_promo}
                    inStock={isInStock(product)}
                    onAddToCart={() => addToCart(product)}
                    locale={locale}
                    priceOnRequest={t.priceOnRequest}
                  />
                </div>
              </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Affichage normal groupé par laboratoire quand aucune catégorie n'est sélectionnée */
              <>
                {(selectedLabId === 'Tous'
                  ? laboratories
                  : laboratories.filter((l) => l.id === selectedLabId)
                ).map((lab) => {
                  const labProducts = filteredProducts.filter(p => p.laboratoire?.id === lab.id);
                  if (labProducts.length === 0) return null;

                  // Get unique categories for this laboratory
                  const labCategories = Array.from(new Set(labProducts.map(p => p.categorie_id)))
                    .map(catId => categories.find(c => c.id === catId))
                    .filter(Boolean) as Category[];

                  return (
                    <div key={lab.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        <LabCatalogBanner
                          nom={lab.nom}
                          slug={lab.slug}
                          description={lab.description}
                          productCount={labProducts.length}
                          productCountLabel={locale === 'fr' ? 'produits' : 'products'}
                        />
                      </div>

                      {/* Categories */}
                      <div className="p-6 space-y-8">
                        {labCategories.map((cat) => {
                          const catProducts = labProducts.filter(p => p.categorie_id === cat.id);
                          if (catProducts.length === 0) return null;

                          return (
                            <div key={cat.id}>
                              {/* Category Header */}
                              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 pb-2 border-b-2 border-blue-500">
                                {cat.nom}
                              </h3>

                              {/* Products Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {catProducts.map((product) => (
                                  <div
                                    key={product.id}
                                    className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500"
                                  >
                                    {/* Image */}
                                    <Link href={productHref(product)} className="block relative h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                                      {product.image_principale_url ? (
                                        <Image
                                          src={product.image_principale_url || ''}
                                          unoptimized={product.image_principale_url?.includes('cloudinary.com')}
                                          alt={getProductImageAlt(product, locale)}
                                          fill
                                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                      ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <FlaskConical className="w-24 h-24 text-zinc-300 dark:text-zinc-700" />
                                        </div>
                                      )}
                                      {!isInStock(product) && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                          <span className="px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow-lg">
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
                                        <div className="mb-2">
                                          <LabLogo
                                            slug={product.laboratoire?.slug || product.categorie?.laboratoire?.slug}
                                            nom={product.laboratoire?.nom || product.categorie?.laboratoire?.nom}
                                            size="sm"
                                          />
                                        </div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          {getProductName(product)}
                                        </h3>
                                      </div>

                                      <div className="flex items-center gap-2 mb-4">
                                        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-lg">
                                          {product.categorie?.nom || ''}
                                        </span>
                                      </div>
                                      <div className="mb-4">
                                        <StarRating rating={product.averageRating || 0} size={14} />
                                      </div>

                                      <ProductCardActions
                                        href={productHref(product)}
                                        price={product.prix}
                                        promoPrice={product.prix_promo}
                                        inStock={isInStock(product)}
                                        onAddToCart={() => addToCart(product)}
                                        locale={locale}
                                        priceOnRequest={t.priceOnRequest}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </main>
      </div>

      <Footer />
      </div>
    </>
  );
}
