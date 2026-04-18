'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showToast } from '../components/Toast';
import { 
  ChevronLeft, 
  ChevronRight,
  Truck,
  CreditCard,
  Smartphone,
  Building2,
  Check,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import FlutterwavePayment from '../components/FlutterwavePayment';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'delivery' | 'payment' | 'confirm'>('info');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Yaoundé',
    notes: ''
  });
  
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'om' | 'mtn' | 'flutterwave'>('om');
  const [orderComplete, setOrderComplete] = useState(false);
  const [showFlutterwavePayment, setShowFlutterwavePayment] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    const savedLang = localStorage.getItem('ads-language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    // Pre-fill form data when user is available
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const t = {
    fr: {
      title: 'Finaliser la commande',
      backToCart: 'Retour au panier',
      steps: ['Informations', 'Livraison', 'Paiement', 'Confirmation'],
      personalInfo: 'Informations personnelles',
      firstName: 'Prénom *',
      lastName: 'Nom *',
      phone: 'Téléphone *',
      email: 'Email',
      address: 'Adresse de livraison',
      city: 'Ville',
      notes: 'Notes (optionnel)',
      delivery: 'Mode de livraison',
      pickup: 'Retrait sur place (Gratuit)',
      deliveryOption: 'Livraison à domicile (+1 500 FCFA)',
      payment: 'Mode de paiement',
      om: 'Orange Money',
      mtn: 'MTN Mobile Money',
      flutterwave: 'Carte bancaire (Visa/Mastercard) - Flutterwave',
      orderSummary: 'Récapitulatif',
      subtotal: 'Sous-total',
      deliveryFee: 'Frais de livraison',
      free: 'Gratuit',
      total: 'Total',
      confirmOrder: 'Confirmer la commande',
      processing: 'Traitement en cours...',
      paymentInstructions: {
        om: 'Instructions Orange Money:\n1. Composez #150#\n2. Choisissez 1 (Transfert)\n3. Entrez le numéro: 6XX XXX XXX\n4. Montant: {amount}\n5. Validez avec votre code',
        mtn: 'Instructions MTN MoMo:\n1. Composez *126#\n2. Choisissez 1 (Transfert)\n3. Entrez le numéro\n4. Montant: {amount}\n5. Confirmez avec votre code',
        flutterwave: 'Paiement par carte bancaire:\nCliquez sur "Confirmer la commande" pour procéder au paiement sécurisé avec Flutterwave (Visa, Mastercard, Mobile Money).'
      },
      thankYou: 'Merci pour votre commande !',
      orderReceived: 'Votre commande a été reçue et est en cours de traitement.',
      orderNumber: 'N° de commande',
      continueShopping: 'Continuer les achats',
      required: 'Champ obligatoire',
      error: 'Veuillez remplir tous les champs obligatoires'
    },
    en: {
      title: 'Checkout',
      backToCart: 'Back to cart',
      steps: ['Information', 'Delivery', 'Payment', 'Confirmation'],
      personalInfo: 'Personal information',
      firstName: 'First name *',
      lastName: 'Last name *',
      phone: 'Phone *',
      email: 'Email',
      address: 'Delivery address',
      city: 'City',
      notes: 'Notes (optional)',
      delivery: 'Delivery method',
      pickup: 'Pickup (Free)',
      deliveryOption: 'Home delivery (+1 500 FCFA)',
      payment: 'Payment method',
      om: 'Orange Money',
      mtn: 'MTN Mobile Money',
      flutterwave: 'Credit/Debit Card (Visa/Mastercard) - Flutterwave',
      orderSummary: 'Order summary',
      subtotal: 'Subtotal',
      deliveryFee: 'Delivery fee',
      free: 'Free',
      total: 'Total',
      confirmOrder: 'Confirm order',
      processing: 'Processing...',
      paymentInstructions: {
        om: 'Orange Money instructions:\n1. Dial #150#\n2. Select 1 (Transfer)\n3. Enter number: 6XX XXX XXX\n4. Amount: {amount}\n5. Confirm with PIN',
        mtn: 'MTN MoMo instructions:\n1. Dial *126#\n2. Select 1 (Transfer)\n3. Enter number\n4. Amount: {amount}\n5. Confirm with PIN',
        flutterwave: 'Credit card payment:\nClick "Confirm order" to proceed with secure Flutterwave payment (Visa, Mastercard, Mobile Money).'
      },
      thankYou: 'Thank you for your order!',
      orderReceived: 'Your order has been received and is being processed.',
      orderNumber: 'Order number',
      continueShopping: 'Continue shopping',
      required: 'Required field',
      error: 'Please fill in all required fields'
    }
  }[lang];

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryOption === 'delivery' ? 1500 : 0;
  const total = subtotal + deliveryFee;

  // Helper function to format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If number is 9 digits and starts with 6 (Cameroon format), add 237 prefix
    if (cleaned.length === 9 && cleaned.startsWith('6')) {
      cleaned = '237' + cleaned;
    }
    
    return cleaned;
  };

  const handleSubmit = async () => {
    if (step === 'info') {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        showToast(t.error, 'error');
        return;
      }
      setStep('delivery');
    } else if (step === 'delivery') {
      setStep('payment');
    } else if (step === 'payment') {
      if (paymentMethod === 'flutterwave') {
        // Générer un ID de commande unique pour Flutterwave
        const newOrderId = `ADS_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setOrderId(newOrderId);
        setShowFlutterwavePayment(true);
      } else {
        // Paiement Campay (OM/MTN)
        setIsLoading(true);
        
        // Générer un ID de commande pour Campay
        const campayOrderId = `ADS_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        try {
          const response = await fetch('/api/payments/campay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              cart,
              amount: total,
              phone: formatPhoneNumber(formData.phone),
              operator: paymentMethod === 'om' ? 'orange' : 'mtn',
              reference: campayOrderId,
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Vider le panier
            clearCart();
            // Mettre à jour le compteur de commandes
            const currentCount = parseInt(localStorage.getItem('ads-order-count') || '0');
            localStorage.setItem('ads-order-count', (currentCount + 1).toString());
            setOrderComplete(true);
          } else {
            showToast(data.error || 'Erreur lors du paiement', 'error');
          }
        } catch (error) {
          console.error('Erreur lors de la commande:', error);
          showToast('Erreur lors de la commande', 'error');
        }
        
        setIsLoading(false);
      }
    }
  };

  if (orderComplete) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              {t.thankYou}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {t.orderReceived}
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              {t.orderNumber}: <span className="font-mono font-medium">{orderId}</span>
            </p>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line">
                  {t.paymentInstructions[paymentMethod].replace('{amount}', `${total.toLocaleString()} FCFA`)}
                </p>
              </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
            >
              {t.continueShopping}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {t.title}
                </h1>
                <p className="text-blue-100 text-lg">
                  {cart.length} {cart.length === 1 ? (lang === 'fr' ? 'article' : 'item') : (lang === 'fr' ? 'articles' : 'items')}
                </p>
              </div>
              <Link
                href="/cart"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                {t.backToCart}
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            {t.steps.map((stepName, index) => {
              const stepKey = ['info', 'delivery', 'payment', 'confirm'][index] as typeof step;
              const isActive = step === stepKey;
              const isPast = ['info', 'delivery', 'payment', 'confirm'].indexOf(step) > index;
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                      : isPast 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {isPast ? <Check className="w-6 h-6" /> : index + 1}
                  </div>
                  <span className={`ml-3 text-base font-semibold hidden sm:block transition-all ${
                    isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'
                  }`}>
                    {stepName}
                  </span>
                  {index < 3 && (
                    <ChevronRight className="w-6 h-6 mx-4 text-zinc-300" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {step === 'info' && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.personalInfo}
                  </h2>
                  
                  {user && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {lang === 'fr' ? 'Informations récupérées depuis votre profil (modifiables)' : 'Information retrieved from your profile (editable)'}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.firstName}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.lastName}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.phone}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="+237 6XX XXX XXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                        {t.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      {t.notes}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {step === 'delivery' && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.delivery}
                  </h2>

                  <div className="space-y-5">
                    <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      deliveryOption === 'pickup' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-lg shadow-blue-500/20' 
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="delivery"
                        value="pickup"
                        checked={deliveryOption === 'pickup'}
                        onChange={() => setDeliveryOption('pickup')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-lg text-zinc-900 dark:text-white">{t.pickup}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Yaoundé, Centre Commercial</p>
                      </div>
                    </label>

                    <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      deliveryOption === 'delivery' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-lg shadow-blue-500/20' 
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="delivery"
                        value="delivery"
                        checked={deliveryOption === 'delivery'}
                        onChange={() => setDeliveryOption('delivery')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-lg text-zinc-900 dark:text-white">{t.deliveryOption}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Livraison sous 24-48h</p>
                      </div>
                    </label>
                  </div>

                  {deliveryOption === 'delivery' && (
                    <div className="mt-8 space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                          {t.address}
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="Entrez votre adresse complète"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                          {t.city}
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full px-5 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    {t.payment}
                  </h2>

                  <div className="space-y-5">
                    <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      paymentMethod === 'om' 
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/30 shadow-lg shadow-orange-500/20' 
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="om"
                        checked={paymentMethod === 'om'}
                        onChange={() => setPaymentMethod('om')}
                        className="w-5 h-5 text-orange-500"
                      />
                      <div className="ml-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          OM
                        </div>
                        <div>
                          <p className="font-bold text-lg text-zinc-900 dark:text-white">{t.om}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Paiement rapide et sécurisé</p>
                        </div>
                      </div>
                    </label>

                    <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      paymentMethod === 'mtn' 
                        ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 shadow-lg shadow-yellow-500/20' 
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="mtn"
                        checked={paymentMethod === 'mtn'}
                        onChange={() => setPaymentMethod('mtn')}
                        className="w-5 h-5 text-yellow-500"
                      />
                      <div className="ml-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          MTN
                        </div>
                        <div>
                          <p className="font-bold text-lg text-zinc-900 dark:text-white">{t.mtn}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Paiement mobile simple</p>
                        </div>
                      </div>
                    </label>

                    <label className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      paymentMethod === 'flutterwave' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 shadow-lg shadow-blue-500/20' 
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="flutterwave"
                        checked={paymentMethod === 'flutterwave'}
                        onChange={() => setPaymentMethod('flutterwave')}
                        className="w-5 h-5 text-blue-500"
                      />
                      <div className="ml-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                          <CreditCard className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-zinc-900 dark:text-white">{t.flutterwave}</p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Paiement sécurisé par Flutterwave</p>
                        </div>
                      </div>
                    </label>

                  </div>

                  {/* Payment Instructions */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 border-2 border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-base text-amber-800 dark:text-amber-200 whitespace-pre-line font-medium">
                        {t.paymentInstructions[paymentMethod].replace('{amount}', `${total.toLocaleString()} FCFA`).replace('{orderId}', orderId)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {step !== 'info' && (
                  <button
                    onClick={() => {
                      const steps: ('info' | 'delivery' | 'payment' | 'confirm')[] = ['info', 'delivery', 'payment', 'confirm'];
                      const currentIndex = steps.indexOf(step);
                      setStep(steps[currentIndex - 1]);
                    }}
                    className="px-8 py-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    {lang === 'fr' ? 'Retour' : 'Back'}
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      {step === 'payment' ? t.confirmOrder : (lang === 'fr' ? 'Continuer' : 'Continue')}
                      <ChevronRight className="w-6 h-6" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl sticky top-24">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
                  {t.orderSummary}
                </h2>

                {/* Items */}
                <div className="space-y-5 mb-8">
                  {cart.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center flex-shrink-0 shadow-md relative overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-zinc-900 dark:text-white line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {item.quantity} x {(item.price || 0).toLocaleString()} FCFA
                        </p>
                      </div>
                      <p className="text-base font-bold text-zinc-900 dark:text-white">
                        {((item.price || 0) * item.quantity).toLocaleString()} FCFA
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-4 pt-6 border-t-2 border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between text-base text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{t.subtotal}</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-base text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{t.deliveryFee}</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                      {deliveryFee === 0 ? t.free : `${deliveryFee.toLocaleString()} FCFA`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-5 border-t-2 border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-xl text-zinc-900 dark:text-white">{t.total}</span>
                    <span className="font-bold text-3xl text-zinc-900 dark:text-white">
                      {total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Flutterwave Payment */}
      {showFlutterwavePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {lang === 'fr' ? 'Paiement par carte' : 'Card Payment'}
              </h2>
              <button
                onClick={() => {
                  setShowFlutterwavePayment(false);
                }}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <AlertCircle className="w-6 h-6 text-zinc-500" />
              </button>
            </div>
            <FlutterwavePayment
              amount={total}
              email={formData.email || ''}
              name={`${formData.firstName} ${formData.lastName}`}
              phone={formData.phone}
              orderId={orderId}
              onSuccess={() => {
                setShowFlutterwavePayment(false);
                clearCart();
                const currentCount = parseInt(localStorage.getItem('ads-order-count') || '0');
                localStorage.setItem('ads-order-count', (currentCount + 1).toString());
                setOrderComplete(true);
              }}
              onCancel={() => {
                setShowFlutterwavePayment(false);
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
