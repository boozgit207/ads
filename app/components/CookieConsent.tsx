'use client';

import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

const translations = {
  fr: {
    title: 'Cookies',
    description: 'Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. En continuant, vous acceptez notre politique de confidentialité.',
    accept: 'Accepter tout',
    customize: 'Personnaliser',
    reject: 'Refuser',
    necessary: 'Nécessaires',
    analytics: 'Analytiques',
    marketing: 'Marketing',
    necessaryDesc: 'Cookies essentiels pour le fonctionnement du site',
    analyticsDesc: 'Cookies pour analyser le trafic',
    marketingDesc: 'Cookies pour le marketing personnalisé',
    save: 'Enregistrer',
    close: 'Fermer'
  },
  en: {
    title: 'Cookies',
    description: 'We use cookies to improve your experience and analyze traffic. By continuing, you accept our privacy policy.',
    accept: 'Accept all',
    customize: 'Customize',
    reject: 'Reject',
    necessary: 'Necessary',
    analytics: 'Analytics',
    marketing: 'Marketing',
    necessaryDesc: 'Essential cookies for site functionality',
    analyticsDesc: 'Cookies for traffic analysis',
    marketingDesc: 'Cookies for personalized marketing',
    save: 'Save',
    close: 'Close'
  }
};

export default function CookieConsent() {
  const { locale } = useI18n();
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true
    }));
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-preferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false
    }));
    setShow(false);
  };

  const handleSave = () => {
    localStorage.setItem('cookie-consent', 'customized');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShow(false);
    setShowCustomize(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  const t = translations[locale];

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg">
      {!showCustomize ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{t.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{t.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowCustomize(true)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Personnaliser les cookies"
              >
                {t.customize}
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label="Rejeter les cookies"
              >
                {t.reject}
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Accepter les cookies"
              >
                {t.accept}
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cookie className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{t.title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="necessary"
                checked={preferences.necessary}
                disabled
                className="mt-1 w-4 h-4 text-blue-600 rounded border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700 cursor-not-allowed"
              />
              <div className="flex-1">
                <label htmlFor="necessary" className="font-medium text-zinc-900 dark:text-white">{t.necessary}</label>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{t.necessaryDesc}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="analytics"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="analytics" className="font-medium text-zinc-900 dark:text-white">{t.analytics}</label>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{t.analyticsDesc}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <input
                type="checkbox"
                id="marketing"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-700 cursor-pointer"
              />
              <div className="flex-1">
                <label htmlFor="marketing" className="font-medium text-zinc-900 dark:text-white">{t.marketing}</label>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{t.marketingDesc}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCustomize(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              aria-label="Fermer la personnalisation"
            >
              {t.close}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Sauvegarder les préférences"
            >
              {t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
