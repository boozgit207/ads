'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

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

function GoogleAnalyticsPageViews({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return;
    const query = searchParams?.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;
    gtag('config', measurementId, { page_path });
  }, [pathname, searchParams, measurementId]);

  return null;
}

/** Charge Google Analytics après consentement + suit les changements de page (App Router). */
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
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true, send_page_view: true });
        `}
      </Script>
      <Suspense fallback={null}>
        <GoogleAnalyticsPageViews measurementId={measurementId} />
      </Suspense>
    </>
  );
}
