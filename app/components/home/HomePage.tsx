'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../Header';
import Footer from '../Footer';
import HeroCarousel from './HeroCarousel';
import { 
  ChevronRight, 
  FlaskConical, 
  TestTube, 
  ArrowRight,
  TrendingUp,
  Users,
  Package,
  Zap,
  Heart,
  ShoppingCart,
  Sparkles,
  Shield,
  Truck,
  Headphones,
  Search,
  Activity,
  BadgeCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HomePageProps {
  categories: { id: string; nom: string; description?: string | null }[];
}

// Données des laboratoires
const laboratories = [
  {
    id: 'fortress',
    name: 'Fortress Diagnostics',
    description: 'Tests diagnostiques de pointe',
    image: '/images/labs/fortress.jpg',
    color: 'from-blue-600 to-blue-800',
    icon: FlaskConical
  },
  {
    id: 'bioline',
    name: 'Bioline',
    description: 'Solutions de sérologie',
    image: '/images/labs/bioline.jpg',
    color: 'from-green-600 to-green-800',
    icon: TestTube
  },
  {
    id: 'hightop',
    name: 'Hightop',
    description: 'Tests rapides et ELISA',
    image: '/images/labs/hightop.jpg',
    color: 'from-purple-600 to-purple-800',
    icon: Activity
  },
  {
    id: 'consommables',
    name: 'Consommables',
    description: 'Matériel de laboratoire',
    image: '/images/labs/consommables.jpg',
    color: 'from-orange-600 to-orange-800',
    icon: Package
  }
];

// Icônes simples pour les catégories
const getCategoryIcon = (index: number) => {
  const icons = [
    Package,
    Shield,
    Activity,
    Heart,
    Truck,
    Headphones
  ];
  return icons[index % icons.length];
};

// Produits vedettes
const featuredProducts = [
  {
    id: 1,
    name: 'COVID-19 Ag Test',
    laboratory: 'Fortress Diagnostics',
    category: 'Tests Rapides',
    price: 12500,
    image: '/images/products/covid-test.jpg'
  },
  {
    id: 2,
    name: 'HIV 1/2 Rapid Test',
    laboratory: 'Bioline',
    category: 'Sérologie',
    price: 8500,
    image: '/images/products/hiv-test.jpg'
  },
  {
    id: 3,
    name: 'Malaria Pf/Pv Ag',
    laboratory: 'Hightop',
    category: 'Tests Rapides',
    price: 6200,
    image: '/images/products/malaria-test.jpg'
  },
  {
    id: 4,
    name: 'Glucose Kit',
    laboratory: 'Fortress Diagnostics',
    category: 'Biochimie',
    price: 45000,
    image: '/images/products/glucose-kit.jpg'
  }
];

export default function HomePage({ categories }: HomePageProps) {
  const { user } = useAuth();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ products: 0, labs: 0, satisfiedClients: 0, orders: 0 });
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const savedLang = localStorage.getItem('ads-language') as 'fr' | 'en';
    if (savedLang) setLang(savedLang);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    const savedDarkMode = localStorage.getItem('ads-dark-mode');
    const isDarkMode = savedDarkMode === 'true' || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animateCounters = () => {
    const targets = { products: 500, labs: 20, satisfiedClients: 150, orders: 300 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let current = { products: 0, labs: 0, satisfiedClients: 0, orders: 0 };
    const increment = {
      products: targets.products / steps,
      labs: targets.labs / steps,
      satisfiedClients: targets.satisfiedClients / steps,
      orders: targets.orders / steps
    };

    const timer = setInterval(() => {
      current = {
        products: Math.min(current.products + increment.products, targets.products),
        labs: Math.min(current.labs + increment.labs, targets.labs),
        satisfiedClients: Math.min(current.satisfiedClients + increment.satisfiedClients, targets.satisfiedClients),
        orders: Math.min(current.orders + increment.orders, targets.orders)
      };

      setCounters({
        products: Math.floor(current.products),
        labs: Math.floor(current.labs),
        satisfiedClients: Math.floor(current.satisfiedClients),
        orders: Math.floor(current.orders)
      });

      if (current.products >= targets.products && 
          current.labs >= targets.labs && 
          current.satisfiedClients >= targets.satisfiedClients && 
          current.orders >= targets.orders) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  };

  const t = {
    fr: {
      hero: {
        title1: 'Réactifs de Laboratoire',
        subtitle1: 'Solutions diagnostiques de haute qualité',
        cta1: 'Voir les produits',
        title2: 'Livraison Rapide',
        subtitle2: 'Stock disponible et livraison express',
        cta2: 'Commander maintenant',
        title3: 'Service Client',
        subtitle3: 'Support technique disponible 7j/7',
        cta3: 'Nous contacter'
      },
      laboratories: 'Nos Laboratoires - Produits de Qualité',
      categories: 'Nos Catégories de Réactifs',
      featured: 'Produits Vedettes - Les Plus Demandés',
      viewAll: 'Voir tout',
      viewDetails: 'Voir détails',
      addToCart: 'Ajouter au panier',
      stats: {
        products: '+500 Produits',
        labs: '+20 Laboratoires',
        satisfiedClients: '+150 Clients Satisfaits',
        orders: '+300 Commandes'
      },
      features: {
        quality: 'Qualité Garantie',
        delivery: 'Livraison Express',
        support: 'Support 24/7',
        price: 'Prix Compétitifs'
      },
      categoryDescriptions: {
        latex: 'Tests de précision pour diagnostics rapides',
        biochimie: 'Analyse sanguine complète et enzymes',
        hormones: 'Dosage hormonal et endocrinologie',
        serologie: 'Tests d\'anticorps et maladies infectieuses',
        elisa: 'Tests enzymatiques de haute sensibilité',
        tdr: 'Résultats en minutes pour diagnostics immédiats'
      }
    },
    en: {
      hero: {
        title1: 'Laboratory Reagents',
        subtitle1: 'High-quality diagnostic solutions',
        cta1: 'View products',
        title2: 'Fast Delivery',
        subtitle2: 'Available stock and express delivery',
        cta2: 'Order now',
        title3: 'Customer Service',
        subtitle3: 'Technical support available 24/7',
        cta3: 'Contact us'
      },
      laboratories: 'Our Laboratories - Quality Products',
      categories: 'Our Reagent Categories',
      featured: 'Featured Products - Most Popular',
      viewAll: 'View all',
      viewDetails: 'View details',
      addToCart: 'Add to cart',
      stats: {
        products: '+500 Products',
        labs: '+20 Laboratories',
        satisfiedClients: '+150 Satisfied Clients',
        orders: '+300 Orders'
      },
      features: {
        quality: 'Quality Guaranteed',
        delivery: 'Express Delivery',
        support: '24/7 Support',
        price: 'Competitive Prices'
      },
      categoryDescriptions: {
        latex: 'Precision tests for rapid diagnostics',
        biochimie: 'Complete blood analysis and enzymes',
        hormones: 'Hormonal dosage and endocrinology',
        serologie: 'Antibody tests and infectious diseases',
        elisa: 'High-sensitivity enzymatic tests',
        tdr: 'Results in minutes for immediate diagnostics'
      }
    }
  }[lang];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      
      {/* Hero Carousel */}
      <HeroCarousel translations={t.hero} isDark={isDark} />

      {/* Statistics Section */}
      <section ref={sectionRef} className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Package, value: counters.products, label: t.stats.products },
              { icon: BadgeCheck, value: counters.labs, label: t.stats.labs },
              { icon: Users, value: counters.satisfiedClients, label: t.stats.satisfiedClients },
              { icon: TrendingUp, value: counters.orders, label: t.stats.orders }
            ].map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center transition-all duration-500 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm transform hover:rotate-12 transition-transform duration-300">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold mb-1">{stat.value}+</div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BadgeCheck, title: t.features.quality, color: 'from-green-500 to-green-600' },
              { icon: Zap, title: t.features.delivery, color: 'from-orange-500 to-orange-600' },
              { icon: Heart, title: t.features.support, color: 'from-blue-500 to-blue-600' },
              { icon: ShoppingCart, title: t.features.price, color: 'from-purple-500 to-purple-600' }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Laboratories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white animate-fade-in-up">
              {lang === 'fr' ? 'Nos Laboratoires' : 'Our Laboratories'}
            </h2>
            <Link 
              href="/products"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {laboratories.map((lab, index) => {
              const LabIcon = lab.icon;
              return (
                <Link
                  key={lab.id}
                  href={`/products?lab=${encodeURIComponent(lab.id)}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-slide-in-left"
                  style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${lab.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative p-6 h-48 flex flex-col justify-between text-white">
                    <div className="transform group-hover:translate-x-2 transition-transform duration-300">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                        <LabIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{lab.name}</h3>
                      <p className="text-sm text-white/80">{lab.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {t.viewDetails} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white animate-fade-in-up">
              {t.categories}
            </h2>
            <Link 
              href="/products"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((cat, index) => {
              const CategoryIcon = getCategoryIcon(index);
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${encodeURIComponent(cat.id)}`}
                  className="group flex flex-col p-6 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cat.nom}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {cat.description || t.viewDetails}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {t.viewDetails} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white animate-fade-in-up">
              {t.featured}
            </h2>
            <Link 
              href="/products" 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {t.viewAll} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-48 bg-zinc-200 dark:bg-zinc-700 rounded-t-2xl"></div>
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-b-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded mb-3"></div>
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  <Link href={`/product/${product.id}`} className="block relative h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform duration-300">
                        <FlaskConical className="w-16 h-16" />
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-medium mb-1 group-hover:text-blue-700 transition-colors">
                      {product.laboratory || product.laboratoires?.nom}
                    </p>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {product.nom}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                      {product.category || product.categories?.nom}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/product/${product.id}`}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                      >
                        Détails
                      </Link>
                      <button
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          const cart = JSON.parse(localStorage.getItem('ads-cart') || '[]');
                          const existingItem = cart.find((item: any) => item.id === product.id);
                          if (existingItem) {
                            existingItem.quantity += 1;
                          } else {
                            cart.push({ id: product.id, nom: product.nom, prix: product.prix, quantity: 1 });
                          }
                          localStorage.setItem('ads-cart', JSON.stringify(cart));
                          window.dispatchEvent(new Event('cartUpdated'));
                        }}
                        aria-label={`Ajouter ${product.nom} au panier`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Panier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      <Footer />
    </div>
  );
}
