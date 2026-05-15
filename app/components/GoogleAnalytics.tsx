'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const prefs = localStorage.getItem('cookie-preferences');
    if (prefs) {
      const parsed = JSON.parse(prefs) as { analytics?: boolean };
      return Boolean(parsed.analytics);
    }
    return localStorage.getItem('cookie-consent') === 'accepted';
  } catch {
    return false;
  }
}

/** Charge Google Analytics uniquement après consentement cookies (analytiques). */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    const sync = () => setEnabled(hasAnalyticsConsent());
    sync();

    window.addEventListener('storage', sync);
    window.addEventListener('ads-cookie-consent', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('ads-cookie-consent', sync);
    };
  }, [measurementId]);

  if (!measurementId || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
