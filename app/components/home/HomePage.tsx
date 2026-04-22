'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../Header';
import Footer from '../Footer';
import HeroCarousel from './HeroCarousel';
import {
  FlaskConical,
  TestTube,
  Activity,
  Package,
  Heart,
  Shield,
  Truck,
  Headphones,
  ShoppingCart,
  Star,
  ArrowRight,
  CheckCircle2,
  Award,
  Users,
  TrendingUp,
  BarChart3,
  LineChart,
  Beaker,
  Droplets
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { useCart } from '../../context/CartContext';

interface HomePageProps {
  categories: { id: string; nom: string; description?: string | null }[];
}

// Palette de couleurs professionnelles médicales
const colors = {
  primary: '#0EA5E9', // Sky blue
  secondary: '#0284C7', // Darker blue
  accent: '#38BDF8', // Light blue
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  danger: '#EF4444', // Red
  dark: '#1E293B', // Slate dark
  light: '#F8FAFC', // Slate light
  white: '#FFFFFF',
};

const laboratories = [
  {
    id: 'fortress',
    name: 'Fortress Diagnostics',
    description: 'Tests diagnostiques de pointe',
    image: '/images/labs/fortress.jpg',
    color: 'from-sky-500 to-blue-600',
    icon: FlaskConical
  },
  {
    id: 'bioline',
    name: 'Bioline',
    description: 'Solutions de sérologie',
    image: '/images/labs/bioline.jpg',
    color: 'from-emerald-500 to-green-600',
    icon: TestTube
  },
  {
    id: 'hightop',
    name: 'Hightop',
    description: 'Tests rapides et ELISA',
    image: '/images/labs/hightop.jpg',
    color: 'from-violet-500 to-purple-600',
    icon: Activity
  },
  {
    id: 'consommables',
    name: 'Consommables',
    description: 'Matériel de laboratoire',
    image: '/images/labs/consommables.jpg',
    color: 'from-orange-500 to-red-600',
    icon: Package
  }
];

const features = [
  {
    icon: Shield,
    title: 'Qualité Certifiée',
    description: 'Tous nos produits sont certifiés et conformes aux normes internationales',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50'
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Livraison express dans toute l\'Afrique centrale',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50'
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    description: 'Équipe technique disponible à tout moment',
    color: 'text-violet-500',
    bgColor: 'bg-violet-50'
  },
  {
    icon: Award,
    title: 'Prix Compétitifs',
    description: 'Tarifs adaptés aux professionnels de santé',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  }
];

export default function HomePage({ categories }: HomePageProps) {
  const { user } = useAuth();
  const { locale } = useI18n();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const [isLabsVisible, setIsLabsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const labsRef = useRef<HTMLDivElement>(null);

  const statsData = [
    { icon: Package, value: 500, suffix: '+', label: 'Produits' },
    { icon: Award, value: 20, suffix: '+', label: 'Laboratoires' },
    { icon: Users, value: 150, suffix: '+', label: 'Clients' },
    { icon: TrendingUp, value: 300, suffix: '+', label: 'Commandes' }
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const savedDarkMode = localStorage.getItem('ads-dark-mode');
    const isDarkMode = savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !statsRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
          // Animate the numbers
          statsData.forEach((stat, index) => {
            const duration = 2000;
            const steps = 60;
            const increment = stat.value / steps;
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= stat.value) {
                current = stat.value;
                clearInterval(timer);
              }
              setAnimatedStats(prev => {
                const newStats = [...prev];
                newStats[index] = Math.floor(current);
                return newStats;
              });
            }, duration / steps);
          });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !labsRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLabsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(labsRef.current);

    return () => observer.disconnect();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const loadFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/featured-products');
        const data = await response.json();
        if (data.products) {
          setFeaturedProducts(data.products);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits vedettes:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadFeaturedProducts();
  }, [isMounted]);

  const t = {
    fr: {
      heroTitle: 'Solutions Diagnostiques de Pointe',
      heroSubtitle: 'Votre partenaire de confiance pour les réactifs de laboratoire et équipements médicaux en Afrique',
      heroCTA: 'Explorer nos produits',
      heroSecondary: 'Contacter nos experts',
      laboratories: 'Nos Laboratoires Partenaires',
      categories: 'Nos Catégories',
      featured: 'Produits Vedettes',
      viewAll: 'Voir tout',
      addToCart: 'Ajouter au panier',
      viewDetails: 'Voir détails',
      features: 'Pourquoi nous choisir ?',
      stats: 'Nos réalisations',
      trust: 'Ils nous font confiance'
    },
    en: {
      heroTitle: 'Cutting-Edge Diagnostic Solutions',
      heroSubtitle: 'Your trusted partner for laboratory reagents and medical equipment in Africa',
      heroCTA: 'Explore our products',
      heroSecondary: 'Contact our experts',
      laboratories: 'Our Partner Laboratories',
      categories: 'Our Categories',
      featured: 'Featured Products',
      viewAll: 'View all',
      addToCart: 'Add to cart',
      viewDetails: 'View details',
      features: 'Why choose us?',
      stats: 'Our achievements',
      trust: 'They trust us'
    }
  };

  const content = t[locale];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel
        translations={{
          title1: locale === 'fr' ? 'Solutions Diagnostiques de Pointe' : 'Cutting-Edge Diagnostic Solutions',
          subtitle1: locale === 'fr' ? 'Votre partenaire de confiance pour les réactifs de laboratoire et équipements médicaux en Afrique' : 'Your trusted partner for laboratory reagents and medical equipment in Africa',
          cta1: locale === 'fr' ? 'Explorer nos produits' : 'Explore our products',
          title2: locale === 'fr' ? 'Qualité et Précision Garanties' : 'Quality and Precision Guaranteed',
          subtitle2: locale === 'fr' ? 'Tests COVID-19, HIV, Malaria, Biochimie et plus - Certifié ISO 9001' : 'COVID-19, HIV, Malaria, Biochemistry tests and more - ISO 9001 Certified',
          cta2: locale === 'fr' ? 'En savoir plus' : 'Learn more',
          title3: locale === 'fr' ? 'Livraison Rapide et Fiable' : 'Fast and Reliable Delivery',
          subtitle3: locale === 'fr' ? 'Service de livraison à travers tout le pays avec suivi en temps réel' : 'Nationwide delivery service with real-time tracking',
          cta3: locale === 'fr' ? 'Commander maintenant' : 'Order now'
        }}
        isDark={isDark}
      />

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-sky-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {content.stats}
            </h2>
            <p className="text-lg text-sky-100 max-w-2xl mx-auto">
              Des chiffres qui parlent d'eux-mêmes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8" ref={statsRef}>
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold mb-2">
                  {isStatsVisible ? `${animatedStats[index]}${stat.suffix}` : `0${stat.suffix}`}
                </div>
                <div className="text-sky-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {content.features}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Des solutions adaptées aux besoins des professionnels de santé
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 transition-all hover:shadow-xl border border-slate-200 dark:border-slate-700"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} dark:bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Laboratories Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {content.laboratories}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Partenaires de confiance pour des produits de qualité
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 font-semibold mt-4 md:mt-0"
            >
              {content.viewAll}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" ref={labsRef}>
            {laboratories.map((lab, index) => (
              <div
                key={lab.id}
                className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border border-slate-200 dark:border-slate-700 ${
                  isLabsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="p-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <lab.icon className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {lab.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {lab.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {content.featured}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                Les produits les plus demandés par nos clients
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 font-semibold mt-4 md:mt-0"
            >
              {content.viewAll}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-700 h-64 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-500"
                >
                  {/* Image */}
                  <Link href={`/product/${product.id}`} className="block relative h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        En stock
                      </div>
                    </div>
                    {/* Quick actions overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        Voir détails
                      </span>
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="text-xs font-medium text-sky-500 mb-1">
                      {product.laboratory}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {product.name || product.nom}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                      {product.category || 'Produit de haute qualité pour diagnostics médicaux'}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold text-sky-500">
                        {product.price ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(product.price) : 'Contactez-nous'}
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (product.price && product.price > 0) {
                            addToCart(product);
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                    <Link
                      href={`/product/${product.slug || product.id}`}
                      className="block w-full text-center py-2 rounded-xl border-2 border-sky-500 text-sky-500 font-semibold hover:bg-sky-500 hover:text-white transition-colors text-sm"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-12 lg:p-16">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Prêt à commander ?
                </h2>
                <p className="text-lg text-sky-100 mb-8">
                  Contactez notre équipe d'experts pour une consultation personnalisée
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-sky-600 font-semibold hover:bg-sky-50 transition-all"
                  >
                    {content.heroSecondary}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    {content.heroCTA}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: CheckCircle2, text: 'Qualité certifiée' },
                  { icon: Truck, text: 'Livraison rapide' },
                  { icon: Headphones, text: 'Support 24/7' },
                  { icon: Shield, text: 'Garantie satisfait' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-white font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
