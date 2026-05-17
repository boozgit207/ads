import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientExtras from "./components/ClientExtras";
import ToastContainer from "./components/Toast";
import StructuredData from "./components/StructuredData";
import GoogleAnalytics from "./components/GoogleAnalytics";
import CookieConsent from "./components/CookieConsent";
import LoadingScreen from "./components/LoadingScreen";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { I18nProvider } from "./context/I18nContext";
import { defaultOgImage, siteUrl } from "@/lib/seo";
import Script from "next/script";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ADS - Angela Diagnostics et Services | Réactifs de Laboratoire",
    template: "%s | ADS - Angela Diagnostics et Services"
  },
  description: "Distributeur de réactifs de laboratoire au Cameroun — Fortress Diagnostics, Bioline, latex, ELISA, biochimie. Stock à Yaoundé, livraison nationale.",
  keywords: "réactifs laboratoire Cameroun, Fortress Diagnostics, Bioline, latex RPR CRP, ELISA, biochimie, réactifs Yaoundé, réactifs Douala, distributeur laboratoire",
  authors: [{ name: "ADS - Angela Diagnostics et Services" }],
  creator: "ADS - Angela Diagnostics et Services",
  publisher: "ADS - Angela Diagnostics et Services",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "ADS - Angela Diagnostics et Services",
    title: "ADS - Angela Diagnostics et Services | Réactifs de Laboratoire",
    description: "Distribution de réactifs de laboratoire et solutions diagnostiques en Afrique",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "ADS - Angela Diagnostics et Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ADS - Angela Diagnostics et Services | Réactifs de Laboratoire",
    description: "Distribution de réactifs de laboratoire et solutions diagnostiques en Afrique",
    images: [defaultOgImage],
    creator: "@ads_diagnostics",
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/logo_1.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo_1.svg" />
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          id="dark-mode-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedDarkMode = localStorage.getItem('ads-dark-mode');
                  const isDarkMode = savedDarkMode === 'true';
                  if (savedDarkMode === null) {
                    try { localStorage.setItem('ads-dark-mode', 'false'); } catch (e) {}
                  }
                  if (isDarkMode) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {
                  console.warn('Dark mode script error:', e);
                }
              })();
            `,
          }}
        />
        <LoadingScreen />
        <StructuredData />
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider initialUser={null}>
              <CartProvider>
                {children}
                <ClientExtras />
                <ToastContainer />
                <CookieConsent />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
