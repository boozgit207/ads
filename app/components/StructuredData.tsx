import { CONTACT, COMPANY } from '@/lib/config';

export default function StructuredData() {
  // Organization Schema
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": COMPANY.name,
    "alternateName": "ADS",
    "description": "Votre partenaire de confiance pour la distribution de réactifs de laboratoire et solutions diagnostiques en Afrique",
    "url": COMPANY.siteUrl,
    "logo": `${COMPANY.siteUrl}/images/logo.png`,
    "telephone": CONTACT.phone,
    "email": CONTACT.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address,
      "addressLocality": "Douala",
      "addressRegion": "Littoral",
      "addressCountry": "CM"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "4.0511",
      "longitude": "9.7679"
    },
    "sameAs": [
      "https://www.facebook.com/ads-diagnostics",
      "https://www.linkedin.com/company/ads-diagnostics"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": CONTACT.phone,
      "contactType": "customer service",
      "availableLanguage": ["French", "English"],
      "areaServed": "CM"
    }
  };

  // LocalBusiness Schema
  const localBusinessData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": COMPANY.name,
    "description": "Distribution de réactifs de laboratoire et solutions diagnostiques",
    "url": COMPANY.siteUrl,
    "telephone": CONTACT.phone,
    "email": CONTACT.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT.address,
      "addressLocality": "Douala",
      "addressRegion": "Littoral",
      "addressCountry": "CM"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "4.0511",
      "longitude": "9.7679"
    },
    "openingHours": ["Mo-Fr 08:00-18:00", "Sa 09:00-14:00"],
    "priceRange": "$$",
    "currenciesAccepted": "XAF, EUR, USD",
    "paymentAccepted": "Cash, Credit Card, Mobile Money",
    "areaServed": {
      "@type": "Country",
      "name": "Cameroon"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Réactifs de laboratoire",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Tests rapides",
            "description": "Tests COVID-19, HIV, Malaria, Hépatite"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Biochimie",
            "description": "Réactifs pour analyses biochimiques"
          }
        }
      ]
    }
  };

  // Website Schema
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": COMPANY.name,
    "url": COMPANY.siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${COMPANY.siteUrl}/products?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}
