'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { showToast } from './Toast';
import { CreditCard, Lock, Loader2, AlertCircle } from 'lucide-react';

// Charger Stripe avec gestion d'erreur
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  amount: number;
  errorMessage?: string;
}

function CheckoutForm({ clientSecret, onSuccess, onCancel, amount, errorMessage }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(errorMessage || null);

  // Réinitialiser l'erreur si le clientSecret change
  useEffect(() => {
    if (errorMessage) setError(errorMessage);
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Le système de paiement n\'est pas encore prêt. Veuillez réessayer.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Une erreur est survenue lors du paiement.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        showToast('Paiement réussi !', 'success');
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        showToast('Le paiement est en cours de traitement...', 'info');
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure en cours
        return;
      } else {
        setError('Le statut du paiement est inconnu. Veuillez vérifier votre email.');
      }
    } catch (err: any) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Erreur inattendue lors du paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Paiement sécurisé par Stripe
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
          Vos données bancaires sont cryptées et sécurisées. Nous ne stockons pas vos informations de carte.
        </p>
        <div className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Montant à payer: {amount.toLocaleString()} FCFA
        </div>
      </div>

      <PaymentElement 
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              name: '',
            },
          },
        }}
      />

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Payer {amount.toLocaleString()} FCFA
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface StripePaymentProps {
  clientSecret: string | null;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  errorMessage?: string;
}

export default function StripePayment({ clientSecret, amount, onSuccess, onCancel, errorMessage }: StripePaymentProps) {
  // Vérifier si Stripe est configuré
  if (!stripePublishableKey) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-600 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          Paiement par carte non disponible
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Le paiement par carte bancaire n'est pas encore configuré. Veuillez choisir un autre mode de paiement.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
        >
          Retour
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">Préparation du paiement...</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise!} options={options}>
      <CheckoutForm 
        clientSecret={clientSecret} 
        onSuccess={onSuccess} 
        onCancel={onCancel}
        amount={amount}
        errorMessage={errorMessage}
      />
    </Elements>
  );
}
