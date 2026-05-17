'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../Header';
import HeroCarousel from './HeroCarousel';
import AnimateInView from './AnimateInView';
import SectionHeading from './SectionHeading';
import Footer from '../Footer';
import StarRating from '../StarRating';
import AuthRedirect from '../AuthRedirect';
import {
  FlaskConical,
  TestTube,
  Activity,
  Package,
  Shield,
  Truck,
  Headphones,
  Star,
  ArrowRight,
  CheckCircle2,
  Award,
  Users,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { useCart } from '../../context/CartContext';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary-image';
import {
  SITE_IMAGES,
  imageAlt,
  getProductDisplayName,
  getProductImageAlt,
} from '@/lib/image-seo';
import { getHomeContent } from '@/lib/home-content';
import { PARTNER_LABS } from '@/lib/lab-logos';
import LabLogo from '../LabLogo';
import ProductCardActions from '../products/ProductCardActions';

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


const featureMeta = [
  { icon: Shield, color: 'text-sky-500', bgColor: 'bg-sky-50' },
  { icon: Truck, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  { icon: Headphones, color: 'text-violet-500', bgColor: 'bg-violet-50' },
  { icon: Award, color: 'text-orange-500', bgColor: 'bg-orange-50' },
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

  const copy = getHomeContent(locale);

  const statsData = [
    { icon: Package, value: 500, suffix: '+', label: copy.stats.products },
    { icon: Award, value: 20, suffix: '+', label: copy.stats.labs },
    { icon: Users, value: 150, suffix: '+', label: copy.stats.clients },
    { icon: TrendingUp, value: 300, suffix: '+', label: copy.stats.orders },
  ];

  const laboratories = PARTNER_LABS;

  const features = featureMeta.map((meta, i) => ({
    ...meta,
    title: copy.features.items[i].title,
    description: copy.features.items[i].description,
  }));

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

  return (
    <AuthRedirect>
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Header />

      {/* Hero Carousel */}
      <HeroCarousel
        badge={copy.heroBadge}
        translations={{
          title1: copy.hero.slide1.title,
          subtitle1: copy.hero.slide1.subtitle,
          cta1: copy.hero.slide1.cta,
          title2: copy.hero.slide2.title,
          subtitle2: copy.hero.slide2.subtitle,
          cta2: copy.hero.slide2.cta,
          title3: copy.hero.slide3.title,
          subtitle3: copy.hero.slide3.subtitle,
          cta3: copy.hero.slide3.cta,
          contact: locale === 'fr' ? 'Nous contacter' : 'Contact us',
        }}
        isDark={isDark}
        locale={locale}
      />

      <div id="accueil-contenu" className="scroll-mt-20" aria-hidden />

      {/* À propos de nous */}
      <section className="py-24 home-mesh relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimateInView animation="slide-right" className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">ADS</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                {copy.about.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.about.p1}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.about.p2}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/15">
                  <CheckCircle2 className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{copy.about.badge1}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/15">
                  <CheckCircle2 className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{copy.about.badge2}</span>
                </div>
              </div>
            </AnimateInView>
            <AnimateInView animation="slide-left" delay={150} className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-sky-400/30 to-blue-600/20 rounded-[2rem] blur-2xl home-float pointer-events-none" aria-hidden />
              <div className="relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border border-white/50 dark:border-slate-700 home-card-glow">
                <div className="w-full aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={SITE_IMAGES.aboutTeam.path}
                    alt={imageAlt('aboutTeam', locale)}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 480px"
                    quality={75}
                    loading="lazy"
                  />
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Notre Mission */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimateInView animation="slide-right" delay={100} className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl transform -rotate-3 opacity-20"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="w-full aspect-square bg-gradient-to-br from-emerald-100 to-green-100 dark:from-slate-700 dark:to-slate-600 rounded-3xl overflow-hidden">
                  <Image
                    src={SITE_IMAGES.aboutMission.path}
                    alt={imageAlt('aboutMission', locale)}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 1024px) 100vw, 480px"
                    quality={75}
                    loading="lazy"
                  />
                </div>
              </div>
            </AnimateInView>
            <AnimateInView animation="slide-left" delay={200} className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {copy.mission.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.mission.p1}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.mission.p2}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-sky-50 dark:bg-slate-800 p-4 rounded-xl">
                  <Shield className="w-8 h-8 text-sky-500 mb-2" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">{copy.mission.card1}</h3>
                </div>
                <div className="bg-emerald-50 dark:bg-slate-800 p-4 rounded-xl">
                  <Headphones className="w-8 h-8 text-emerald-500 mb-2" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">{copy.mission.card2}</h3>
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Nos Solutions */}
      <section className="py-20 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimateInView animation="slide-right" className="space-y-6">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {copy.offer.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.offer.p1}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                {copy.offer.p2}
              </p>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg mt-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">{copy.offer.listTitle}</h3>
                <ul className="space-y-2">
                  {copy.offer.list.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimateInView>
            <AnimateInView animation="slide-left" delay={150} className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-500 rounded-3xl transform rotate-3 opacity-20"></div>
              <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="w-full aspect-square bg-gradient-to-br from-violet-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 rounded-3xl overflow-hidden">
                  <Image
                    src={SITE_IMAGES.aboutSolutions.path}
                    alt={imageAlt('aboutSolutions', locale)}
                    width={600}
                    height={600}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 1024px) 100vw, 480px"
                    quality={75}
                    loading="lazy"
                  />
                </div>
              </div>
            </AnimateInView>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 home-gradient-animate" aria-hidden />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-white">
          <SectionHeading title={copy.stats.title} subtitle={copy.stats.subtitle} dark align="center" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" ref={statsRef}>
            {statsData.map((stat, index) => (
              <AnimateInView
                key={index}
                animation="scale-up"
                delay={index * 100}
                className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 home-card-glow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/15 flex items-center justify-center">
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold mb-2 tabular-nums">
                  {isStatsVisible ? `${animatedStats[index]}${stat.suffix}` : `0${stat.suffix}`}
                </div>
                <div className="text-sky-100/90 text-sm font-medium">{stat.label}</div>
              </AnimateInView>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={copy.features.title}
            subtitle={copy.features.subtitle}
            label={locale === 'fr' ? 'Services' : 'Services'}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <AnimateInView
                key={index}
                animation="fade-up"
                delay={index * 80}
                className="group p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700 home-card-glow"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </AnimateInView>
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
                {copy.partnerLabs.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                {copy.partnerLabs.subtitle}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-semibold mt-4 md:mt-0"
            >
              {copy.sectionTitles.viewAll}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" ref={labsRef}>
            {laboratories.map((lab, index) => (
              <Link
                key={lab.id}
                href={`/products/${lab.slug}`}
                title={lab.name}
                aria-label={lab.name}
                className={`group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] border border-slate-200/80 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 ${
                  isLabsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <LabLogo slug={lab.slug} nom={lab.name} size="lg" className="w-full h-full min-h-[10rem] p-6 sm:p-8" />
              </Link>
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
                {copy.featured.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
                {copy.featured.subtitle}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sky-700 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-semibold mt-4 md:mt-0"
            >
              {copy.sectionTitles.viewAll}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 bg-slate-700 h-64 rounded-2xl" />
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
                  <Link href={`/product/${product.slug || product.id}`} className="block relative h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                    {product.image ? (
                      <img
                        src={optimizeCloudinaryUrl(product.image, 400)}
                        alt={getProductImageAlt(product, locale)}
                        width={400}
                        height={300}
                        loading="lazy"
                        decoding="async"
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
                    <div className="text-xs font-medium text-sky-700 dark:text-sky-400 mb-1">
                      {product.laboratory}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                      {getProductDisplayName(product, locale)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {product.category || copy.featured.fallbackCategory}
                    </p>
                    <div className="mb-3">
                      <StarRating rating={product.averageRating || 0} size={14} />
                    </div>
                    <ProductCardActions
                      href={`/product/${product.slug || product.id}`}
                      price={product.price || 0}
                      inStock={(product.stock ?? 0) > 0}
                      onAddToCart={() => {
                        if (product.price && product.price > 0) {
                          addToCart(product);
                        }
                      }}
                      locale={locale}
                      priceOnRequest={locale === 'fr' ? 'Prix sur demande' : 'Price on request'}
                    />
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
          <AnimateInView animation="scale-up" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 home-gradient-animate p-12 lg:p-16 home-shine border border-white/10 shadow-2xl shadow-sky-500/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {copy.cta.title}
                </h2>
                <p className="text-lg text-sky-100 mb-8">
                  {copy.cta.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-sky-600 font-semibold hover:bg-sky-50 transition-all"
                  >
                    {copy.cta.primary}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    {copy.cta.secondary}
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {copy.cta.bullets.map((text, index) => {
                  const icons = [CheckCircle2, Truck, Headphones, Shield];
                  const Icon = icons[index] || CheckCircle2;
                  return { icon: Icon, text };
                }).map((item, index) => (
                  <AnimateInView key={index} animation="fade-up" delay={200 + index * 80} className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 hover:bg-white/15 transition-colors">
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-white font-medium">{item.text}</span>
                  </AnimateInView>
                ))}
              </div>
            </div>
          </AnimateInView>
        </div>
      </section>

      <Footer />
      </div>
    </AuthRedirect>
  );
}
