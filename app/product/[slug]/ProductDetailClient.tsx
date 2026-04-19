'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { showToast } from '../../components/Toast';
import { Product } from '../../actions/catalog';
import { Review } from '../../actions/reviews';
import { 
  ChevronLeft, 
  ShoppingCart, 
  Star, 
  Share2, 
  Heart,
  Check,
  Truck,
  Shield,
  Clock,
  FlaskConical,
  Eye,
  Package,
  Thermometer,
  Factory,
  Calendar,
  Hash,
  Weight,
  AlertCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { addReview, deleteReview, updateReview } from '../../actions/reviews';

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
  similarProducts: Product[];
}

export default function ProductDetailClient({ 
  product, 
  reviews, 
  similarProducts 
}: ProductDetailClientProps) {
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'specs'>('description');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [showPrice, setShowPrice] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    const savedLang = localStorage.getItem('ads-language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  const t = {
    fr: {
      back: 'Retour aux produits',
      laboratory: 'Laboratoire',
      category: 'Catégorie',
      inStock: 'En stock',
      outOfStock: 'Rupture de stock',
      lowStock: 'Stock limité',
      minOrder: 'Minimum',
      quantity: 'Quantité',
      addToCart: 'Ajouter au panier',
      buyNow: 'Acheter maintenant',
      showPrice: 'Voir le prix',
      hidePrice: 'Masquer le prix',
      description: 'Description',
      specifications: 'Caractéristiques',
      reviews: 'Avis clients',
      similarProducts: 'Produits similaires',
      reference: 'Référence',
      lotNumber: 'N° de lot',
      expiration: 'Date de péremption',
      manufacturer: 'Fabricant',
      country: 'Pays d\'origine',
      weight: 'Poids',
      storage: 'Conservation',
      temperature: 'Température',
      dimensions: 'Dimensions',
      unit: 'Unité',
      writeReview: 'Écrire un avis',
      loginToReview: 'Connectez-vous pour laisser un avis',
      delivery: 'Livraison express',
      securePayment: 'Paiement sécurisé',
      support: 'Support 24/7',
      stockAvailable: 'unités disponibles',
      noReviews: 'Aucun avis pour le moment',
      beFirst: 'Soyez le premier à donner votre avis !',
      submitReview: 'Soumettre l\'avis',
      rating: 'Note',
      title: 'Titre',
      comment: 'Commentaire',
      cancel: 'Annuler',
      addedToCart: 'Produit ajouté au panier !',
      mustBeLogged: 'Vous devez être connecté pour ajouter un avis'
    },
    en: {
      back: 'Back to products',
      laboratory: 'Laboratory',
      category: 'Category',
      inStock: 'In stock',
      outOfStock: 'Out of stock',
      lowStock: 'Low stock',
      minOrder: 'Minimum',
      quantity: 'Quantity',
      addToCart: 'Add to cart',
      buyNow: 'Buy now',
      showPrice: 'Show price',
      hidePrice: 'Hide price',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Customer reviews',
      similarProducts: 'Similar products',
      reference: 'Reference',
      lotNumber: 'Lot number',
      expiration: 'Expiration date',
      manufacturer: 'Manufacturer',
      country: 'Country of origin',
      weight: 'Weight',
      storage: 'Storage',
      temperature: 'Temperature',
      dimensions: 'Dimensions',
      unit: 'Unit',
      writeReview: 'Write a review',
      loginToReview: 'Login to write a review',
      delivery: 'Express delivery',
      securePayment: 'Secure payment',
      support: '24/7 support',
      stockAvailable: 'units available',
      noReviews: 'No reviews yet',
      beFirst: 'Be the first to review!',
      submitReview: 'Submit review',
      rating: 'Rating',
      title: 'Title',
      comment: 'Comment',
      cancel: 'Cancel',
      addedToCart: 'Product added to cart!',
      mustBeLogged: 'You must be logged in to add a review'
    }
  }[lang];

  const getProductName = () => lang === 'fr' ? product.nom : (product.nom_en || product.nom);
  const getProductDesc = () => lang === 'fr' ? product.description : (product.description_en || product.description);
  const getConservation = () => product.conditions_conservation;

  const getStockStatus = () => {
    if (product.quantite_stock === 0 || product.statut === 'rupture') {
      return { text: t.outOfStock, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle };
    }
    if (product.quantite_stock <= 10) {
      return { text: t.lowStock, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle };
    }
    return { text: t.inStock, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Check };
  };

  const isInStock = () => product.quantite_stock > 0 && product.statut === 'disponible';

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: lang === 'fr' ? product.nom : (product.nom_en || product.nom),
      price: product.prix,
      quantity,
      image: product.image_principale_url,
      slug: product.slug,
      laboratory: product.laboratoire?.nom || product.categorie?.laboratoire?.nom,
      stock: product.quantite_stock
    };
    
    addToCartContext(cartItem);
    
    showToast(lang === 'fr' ? 'Produit ajouté au panier !' : 'Product added to cart!', 'success');
  };

  const submitReview = async () => {
    if (!user) {
      showToast(t.mustBeLogged, 'error');
      return;
    }
    // Appel API pour ajouter l'avis
    const result = await addReview(product.id, user.id, reviewForm.rating, reviewForm.title, reviewForm.comment);
    
    if (result.success) {
      showToast(lang === 'fr' ? 'Avis soumis avec succès !' : 'Review submitted successfully!', 'success');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      
      // Add the new review to local state
      const newReview: Review = {
        id: crypto.randomUUID(),
        produit_id: product.id,
        user_id: user.id,
        note: reviewForm.rating,
        titre: reviewForm.title || null,
        commentaire: reviewForm.comment || null,
        statut: 'approuve',
        created_at: new Date().toISOString(),
        user: {
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          avatar: user.avatar || null
        }
      };
      setLocalReviews([newReview, ...localReviews]);
    } else {
      showToast(result.error || (lang === 'fr' ? 'Erreur lors de la soumission' : 'Error submitting review'), 'error');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) {
      showToast(lang === 'fr' ? 'Vous devez être connecté' : 'You must be logged in', 'error');
      return;
    }

    if (confirm(lang === 'fr' ? 'Êtes-vous sûr de vouloir supprimer cet avis ?' : 'Are you sure you want to delete this review?')) {
      const result = await deleteReview(reviewId, user.id);
      if (result.success) {
        showToast(lang === 'fr' ? 'Avis supprimé avec succès !' : 'Review deleted successfully!', 'success');
        setLocalReviews(localReviews.filter(r => r.id !== reviewId));
      } else {
        showToast(result.error || (lang === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting review'), 'error');
      }
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditReviewForm({
      rating: review.note,
      title: review.titre || '',
      comment: review.commentaire || ''
    });
  };

  const handleUpdateReview = async () => {
    if (!user || !editingReviewId) {
      showToast(lang === 'fr' ? 'Erreur lors de la modification' : 'Error updating review', 'error');
      return;
    }

    const result = await updateReview(editingReviewId, user.id, editReviewForm.rating, editReviewForm.title, editReviewForm.comment);
    if (result.success) {
      showToast(lang === 'fr' ? 'Avis modifié avec succès !' : 'Review updated successfully!', 'success');
      setLocalReviews(localReviews.map(r => 
        r.id === editingReviewId 
          ? { ...r, note: editReviewForm.rating, titre: editReviewForm.title, commentaire: editReviewForm.comment }
          : r
      ));
      setEditingReviewId(null);
      setEditReviewForm({ rating: 5, title: '', comment: '' });
    } else {
      showToast(result.error || (lang === 'fr' ? 'Erreur lors de la modification' : 'Error updating review'), 'error');
    }
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  // Récupérer les images du produit
  const images = product.images && product.images.length > 0
    ? product.images.sort((a, b) => a.ordre - b.ordre).map(img => img.url)
    : [product.image_principale_url].filter(Boolean);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length 
    : 0;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <Link 
              href="/products" 
              className="flex items-center gap-2 text-sm text-blue-100 hover:text-white transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.back}
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Images */}
            <div className="space-y-5">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden shadow-xl">
                {images[selectedImage] ? (
                  <Image
                    src={images[selectedImage]}
                    alt={getProductName()}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={images[selectedImage]?.includes('cloudinary.com')}
                  />
                ) : (
                  <FlaskConical className="w-32 h-32 text-zinc-300 dark:text-zinc-700" />
                )}
                {!isInStock() && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xl rounded-2xl shadow-lg">
                      {t.outOfStock}
                    </span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center border-2 transition-all overflow-hidden hover:scale-105 ${
                        selectedImage === index 
                          ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                          : 'border-transparent hover:border-zinc-300'
                      }`}
                    >
                      {img ? (
                        <Image
                          src={img}
                          alt={`${getProductName()} - ${index + 1}`}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                          unoptimized={img?.includes('cloudinary.com')}
                        />
                      ) : (
                        <FlaskConical className="w-8 h-8 text-zinc-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
                  {product.laboratoire?.nom || product.categorie?.laboratoire?.nom} • {product.categorie?.nom}
                </p>
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-5 leading-tight">
                  {getProductName()}
                </h1>
                
                {/* Rating */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(averageRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-zinc-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">
                      {averageRating.toFixed(1)} ({reviews.length} {lang === 'fr' ? 'avis' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>

              {/* Price - Hidden by default */}
              <div className="p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg">
                {!showPrice ? (
                  <button
                    onClick={() => setShowPrice(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-3"
                  >
                    <Eye className="w-6 h-6" />
                    {t.showPrice}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-5xl font-bold text-zinc-900 dark:text-white mb-3">
                      {product.prix.toLocaleString()} FCFA
                    </p>
                    <p className="text-base text-zinc-500 dark:text-zinc-400 font-medium">
                      HT / {product.unite || 'unité'}
                    </p>
                    {product.prix_promo && product.prix_promo < product.prix && (
                      <p className="text-xl text-zinc-400 line-through mt-2">
                        {product.prix.toLocaleString()} FCFA
                      </p>
                    )}
                    <button
                      onClick={() => setShowPrice(false)}
                      className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      {t.hidePrice}
                    </button>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm ${stockStatus.color}`}>
                  <StockIcon className="w-5 h-5" />
                  {stockStatus.text}
                </span>
                {isInStock() && (
                  <span className="text-base font-medium text-zinc-600 dark:text-zinc-400">
                    {product.quantite_stock} {t.stockAvailable}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {isInStock() && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t.quantity}:</span>
                  <div className="flex items-center border-2 border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-5 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="px-6 py-3 font-bold min-w-[70px] text-center text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantite_stock, quantity + 1))}
                      className="px-5 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock()}
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none transition-all"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {t.addToCart}
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <button className="p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 py-8 border-t-2 border-zinc-200 dark:border-zinc-800">
                <div className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Truck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.delivery}</p>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.securePayment}</p>
                </div>
                <div className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Clock className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.support}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-16">
            <div className="flex border-b-2 border-zinc-200 dark:border-zinc-800">
              {(['description', 'specs', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 font-semibold text-base transition-all relative ${
                    activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab === 'description' && t.description}
                  {tab === 'specs' && t.specifications}
                  {tab === 'reviews' && `${t.reviews} (${localReviews.length})`}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="py-10">
              {activeTab === 'description' && (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    <p className="text-lg text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                      {getProductDesc() || (lang === 'fr' ? 'Aucune description disponible' : 'No description available')}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid sm:grid-cols-2 gap-5">
                  {product.reference && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Hash className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.reference}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">{product.reference}</p>
                      </div>
                    </div>
                  )}
                  {product.numero_lot && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.lotNumber}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">{product.numero_lot}</p>
                      </div>
                    </div>
                  )}
                  {product.date_peremption && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.expiration}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">
                          {new Date(product.date_peremption).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  )}
                  {product.fabricant && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Factory className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.manufacturer}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">{product.fabricant}</p>
                      </div>
                    </div>
                  )}
                  {product.pays_fabricant && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Factory className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.country}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">{product.pays_fabricant}</p>
                      </div>
                    </div>
                  )}
                  {product.poids && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Weight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.weight}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">{product.poids} {product.unite === 'g' ? 'g' : 'kg'}</p>
                      </div>
                    </div>
                  )}
                  {(product.temperature_min !== null || product.temperature_max !== null) && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Thermometer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.temperature}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">
                          {product.temperature_min}°C - {product.temperature_max}°C
                        </p>
                      </div>
                    </div>
                  )}
                  {getConservation() && (
                    <div className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-4 sm:col-span-2 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">{t.storage}</p>
                        <p className="font-semibold text-zinc-900 dark:text-white text-lg">{getConservation()}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Form Toggle */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{t.reviews}</h3>
                    {user ? (
                      <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        {showReviewForm ? t.cancel : t.writeReview}
                      </button>
                    ) : (
                      <Link 
                        href="/auth"
                        className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-300"
                      >
                        {t.loginToReview}
                      </Link>
                    )}
                  </div>

                  {/* Review Form */}
                  {showReviewForm && user && (
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <h4 className="font-medium mb-4">{t.writeReview}</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.rating}</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="p-1"
                              >
                                <Star className={`w-6 h-6 ${
                                  star <= reviewForm.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-zinc-300'
                                }`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.title}</label>
                          <input
                            type="text"
                            value={reviewForm.title}
                            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            placeholder={lang === 'fr' ? 'Résumé de votre avis' : 'Summary of your review'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">{t.comment}</label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                            placeholder={lang === 'fr' ? 'Détaillez votre expérience...' : 'Detail your experience...'}
                          />
                        </div>
                        <button
                          onClick={submitReview}
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                        >
                          {t.submitReview}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  {localReviews.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-zinc-500 text-lg">{t.noReviews}</p>
                      <p className="text-sm text-zinc-400 mt-2">{t.beFirst}</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {localReviews.map((review) => (
                        <div key={review.id} className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {review.user?.first_name?.[0] || review.user?.last_name?.[0] || 'U'}
                                </span>
                              </div>
                              <span className="font-medium text-zinc-900 dark:text-white">
                                {review.user?.first_name} {review.user?.last_name?.[0]}.
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-zinc-500">
                                {new Date(review.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                              </span>
                              {user && user.id === review.user_id && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="p-1 text-zinc-500 hover:text-blue-600 transition-colors"
                                    title={lang === 'fr' ? 'Modifier' : 'Edit'}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="p-1 text-zinc-500 hover:text-red-600 transition-colors"
                                    title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.note
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-zinc-300'
                                }`}
                              />
                            ))}
                          </div>
                          {review.titre && (
                            <h4 className="font-medium text-zinc-900 dark:text-white mb-1">{review.titre}</h4>
                          )}
                          {review.commentaire && (
                            <p className="text-zinc-700 dark:text-zinc-300">{review.commentaire}</p>
                          )}
                          {editingReviewId === review.id && (
                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    {t.rating}
                                  </label>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}
                                        className="transition-colors"
                                      >
                                        <Star
                                          className={`w-6 h-6 ${
                                            star <= editReviewForm.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-zinc-300'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    {t.title}
                                  </label>
                                  <input
                                    type="text"
                                    value={editReviewForm.title}
                                    onChange={(e) => setEditReviewForm({ ...editReviewForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    placeholder={lang === 'fr' ? 'Titre de votre avis (optionnel)' : 'Review title (optional)'}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    {lang === 'fr' ? 'Commentaire' : 'Comment'}
                                  </label>
                                  <textarea
                                    value={editReviewForm.comment}
                                    onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    rows={3}
                                    placeholder={lang === 'fr' ? 'Partagez votre expérience...' : 'Share your experience...'}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleUpdateReview}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                                  >
                                    {lang === 'fr' ? 'Enregistrer' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingReviewId(null);
                                      setEditReviewForm({ rating: 5, title: '', comment: '' });
                                    }}
                                    className="px-4 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600"
                                  >
                                    {lang === 'fr' ? 'Annuler' : 'Cancel'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
                {t.similarProducts}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    href={`/product/${similarProduct.slug || similarProduct.id}`}
                    className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="h-52 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden">
                      {similarProduct.image_principale_url ? (
                        <Image
                          src={similarProduct.image_principale_url}
                          alt={lang === 'fr' ? similarProduct.nom : (similarProduct.nom_en || similarProduct.nom)}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          unoptimized={similarProduct.image_principale_url?.includes('cloudinary.com')}
                        />
                      ) : (
                        <FlaskConical className="w-20 h-20 text-zinc-300 dark:text-zinc-700" />
                      )}
                      {similarProduct.quantite_stock === 0 && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                          <span className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg">
                            {t.outOfStock}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">{similarProduct.laboratoire?.nom}</p>
                      <h3 className="font-bold text-zinc-900 dark:text-white mb-3 line-clamp-2 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {lang === 'fr' ? similarProduct.nom : (similarProduct.nom_en || similarProduct.nom)}
                      </h3>
                      <p className="font-bold text-2xl text-zinc-900 dark:text-white">
                        {similarProduct.prix.toLocaleString()} FCFA
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
