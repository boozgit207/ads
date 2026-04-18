'use client';

import { useState } from 'react';
import { CreditCard, Lock, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { showToast } from './Toast';

interface FlutterwavePaymentProps {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FlutterwavePayment({
  amount,
  email,
  name,
  phone,
  orderId,
  onSuccess,
  onCancel,
}: FlutterwavePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);

  const initializePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          email,
          name,
          phone,
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement');
      }

      // Rediriger vers le lien de paiement Flutterwave
      if (data.data?.link) {
        setPaymentLink(data.data.link);
        // Ouvrir dans un nouvel onglet ou rediriger
        window.open(data.data.link, '_blank');
        showToast('Page de paiement ouverte. Complétez votre paiement.', 'info');
      } else {
        throw new Error('Lien de paiement non disponible');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Une erreur est survenue');
      showToast(error.message || 'Erreur de paiement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/flutterwave/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: orderId }),
      });

      const data = await response.json();

      if (data.success && data.data?.status === 'successful') {
        showToast('Paiement confirmé !', 'success');
        onSuccess();
      } else {
        showToast('Paiement en attente ou non complété', 'info');
      }
    } catch (error) {
      showToast('Erreur lors de la vérification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">Paiement par Carte</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Via Flutterwave (sécurisé)</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <Lock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-700 dark:text-green-400">
          Paiement sécurisé par Flutterwave. Vos données bancaires ne sont pas stockées.
        </p>
      </div>

      {/* Résumé du paiement */}
      <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-600 dark:text-zinc-400">Montant:</span>
          <span className="font-bold text-zinc-900 dark:text-white text-xl">
            {amount.toLocaleString()} FCFA
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-600 dark:text-zinc-400">Client:</span>
          <span className="text-zinc-900 dark:text-white">{name}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {paymentLink ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            La page de paiement a été ouverte dans un nouvel onglet.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.open(paymentLink, '_blank')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir le paiement
            </button>
            <button
              onClick={checkPaymentStatus}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Vérifier'
              )}
            </button>
          </div>
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
          >
            Annuler
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={initializePayment}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-bold shadow-lg shadow-blue-500/30 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Procéder au paiement sécurisé
              </>
            )}
          </button>
          
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
          >
            Changer de mode de paiement
          </button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
          <div className="w-8 h-5 bg-gray-300 rounded"></div>
          <div className="w-8 h-5 bg-gray-200 rounded"></div>
        </div>
        <span className="text-xs text-zinc-400">Visa • Mastercard • Mobile Money</span>
      </div>
    </div>
  );
}
