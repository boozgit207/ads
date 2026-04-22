import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatBot from "./components/chatbot/ChatBot";
import ToastContainer from "./components/Toast";
import StructuredData from "./components/StructuredData";
import CookieConsent from "./components/CookieConsent";
import LoadingScreen from "./components/LoadingScreen";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { I18nProvider } from "./context/I18nContext";
import { createServerSupabaseClient, Profile } from "@/lib/supabase";
import Script from "next/script";

function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              const savedDarkMode = localStorage.getItem('ads-dark-mode');
              const isDarkMode = savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
              if (isDarkMode) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {
              console.warn('Dark mode script error:', e);
            }
          })();
        `,
      }}
    />
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ADS - Angela Diagnostics et Services | Réactifs de Laboratoire",
    template: "%s | ADS - Angela Diagnostics et Services"
  },
  description: "Votre partenaire de confiance pour la distribution de réactifs de laboratoire et solutions diagnostiques en Afrique. Tests COVID-19, HIV, Malaria, Biochimie et plus.",
  keywords: "réactifs laboratoire, tests diagnostiques, COVID-19, HIV, malaria, biochimie, Fortress Diagnostics, Bioline, Hightop, Cameroun, Afrique, diagnostics médicaux, équipements laboratoire, Elisa, test rapide, chlamydia",
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
    url: "https://ads-diagnostics.com",
    siteName: "ADS - Angela Diagnostics et Services",
    title: "ADS - Angela Diagnostics et Services | Réactifs de Laboratoire",
    description: "Distribution de réactifs de laboratoire et solutions diagnostiques en Afrique",
    images: [
      {
        url: "/images/og-image.jpg",
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
    images: ["/images/og-image.jpg"],
    creator: "@ads_diagnostics",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
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
  const supabase = await createServerSupabaseClient();
  
  let initialUser: Profile | null = null;
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authUser && !authError) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      initialUser = profile as Profile | null;
    }
  } catch (error) {
    console.error('Layout: Error fetching user:', error);
    initialUser = null;
  }

  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <DarkModeScript />
        <link rel="icon" href="/logo_1.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo_1.svg" />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
        )}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <LoadingScreen />
        <StructuredData />
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider initialUser={initialUser}>
              <CartProvider>
                {children}
                <ChatBot />
                <ToastContainer />
                <CookieConsent />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
