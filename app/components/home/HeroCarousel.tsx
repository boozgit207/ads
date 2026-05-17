'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Microscope, FlaskConical, Truck, ArrowRight, ChevronDown } from 'lucide-react';
import { SITE_IMAGES, imageAlt, type Locale } from '@/lib/image-seo';

interface HeroTranslations {
  title1: string;
  subtitle1: string;
  cta1: string;
  title2: string;
  subtitle2: string;
  cta2: string;
  title3: string;
  subtitle3: string;
  cta3: string;
  contact?: string;
}

interface HeroCarouselProps {
  translations: HeroTranslations;
  isDark: boolean;
  locale?: Locale;
  badge?: string;
}

const slides = [
  {
    id: 1,
    icon: Microscope,
    bgColor: 'from-sky-600 via-blue-700 to-indigo-900',
    image: SITE_IMAGES.heroLab.path,
    altKey: 'heroLab' as const,
  },
  {
    id: 2,
    icon: FlaskConical,
    bgColor: 'from-emerald-600 via-teal-700 to-cyan-900',
    image: SITE_IMAGES.heroQuality.path,
    altKey: 'heroQuality' as const,
  },
  {
    id: 3,
    icon: Truck,
    bgColor: 'from-violet-600 via-purple-700 to-fuchsia-900',
    image: SITE_IMAGES.heroDelivery.path,
    altKey: 'heroDelivery' as const,
  },
];

const SLIDE_MS = 6000;

export default function HeroCarousel({ translations, locale = 'fr', badge }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, SLIDE_MS);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / SLIDE_MS) * 100));
    }, 50);
    return () => clearInterval(tick);
  }, [currentSlide, isAutoPlaying]);

  const getSlideContent = (index: number) => {
    switch (index) {
      case 0:
        return { title: translations.title1, subtitle: translations.subtitle1, cta: translations.cta1 };
      case 1:
        return { title: translations.title2, subtitle: translations.subtitle2, cta: translations.cta2 };
      case 2:
        return { title: translations.title3, subtitle: translations.subtitle3, cta: translations.cta3 };
      default:
        return { title: translations.title1, subtitle: translations.subtitle1, cta: translations.cta1 };
    }
  };

  const contactLabel = translations.contact || (locale === 'fr' ? 'Nous contacter' : 'Contact us');

  return (
    <section className="relative h-[min(92vh,820px)] min-h-[560px] overflow-hidden bg-slate-950">
      {/* Fond animé */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].bgColor} home-gradient-animate opacity-20`} />

      {slides.map((slide, index) => {
        const content = getSlideContent(index);
        const Icon = slide.icon;
        const isActive = index === currentSlide;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.image && (
              <div
                className={`absolute inset-0 ${isActive ? 'home-hero-ken-burns' : 'scale-100'}`}
              >
                <Image
                  src={slide.image}
                  alt={imageAlt(slide.altKey, locale)}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  quality={index === 0 ? 85 : 75}
                  sizes="100vw"
                />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/30 via-slate-900/10 to-slate-950/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
          </div>
        );
      })}

      {/* Orbes décoratifs */}
      <div
        className="absolute top-[15%] right-[8%] w-64 h-64 rounded-full bg-sky-400/20 blur-3xl home-float pointer-events-none z-[2]"
        aria-hidden
      />
      <div
        className="absolute bottom-[25%] left-[5%] w-48 h-48 rounded-full bg-indigo-500/25 blur-3xl home-float-delay pointer-events-none z-[2]"
        aria-hidden
      />

      {/* Contenu */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {slides.map((slide, index) => {
            const content = getSlideContent(index);
            const Icon = slide.icon;
            const isActive = index === currentSlide;

            return (
              <div
                key={`content-${slide.id}`}
                className={`max-w-3xl transition-all duration-700 ${
                  isActive
                    ? 'opacity-100 translate-y-0 relative'
                    : 'opacity-0 translate-y-8 absolute inset-x-4 sm:inset-x-6 lg:inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none'
                }`}
              >
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 mb-6 home-shine ${
                    isActive ? 'home-anim-fade-in' : ''
                  }`}
                  style={{ animationDelay: '100ms' }}
                >
                  <Icon className="w-5 h-5 text-sky-200" />
                  <span className="text-sm font-semibold tracking-wide text-white/95">
                    {badge || 'ADS — Réactifs de laboratoire'}
                  </span>
                </div>

                {index === 0 ? (
                  <h1
                    className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.08] text-white drop-shadow-lg ${
                      isActive ? 'home-anim-fade-up' : ''
                    }`}
                    style={{ animationDelay: '200ms' }}
                  >
                    {content.title}
                  </h1>
                ) : (
                  <h2
                    className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.08] text-white drop-shadow-lg ${
                      isActive ? 'home-anim-fade-up' : ''
                    }`}
                    style={{ animationDelay: '200ms' }}
                  >
                    {content.title}
                  </h2>
                )}

                <p
                  className={`text-lg sm:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed ${
                    isActive ? 'home-anim-fade-up' : ''
                  }`}
                  style={{ animationDelay: '350ms' }}
                >
                  {content.subtitle}
                </p>

                <div
                  className={`flex flex-col sm:flex-row gap-4 ${isActive ? 'home-anim-fade-up' : ''}`}
                  style={{ animationDelay: '480ms' }}
                >
                  <Link
                    href="/products"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-sky-50 transition-all duration-300 hover:scale-[1.03] shadow-xl shadow-black/20"
                  >
                    {content.cta}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white/40 text-white font-semibold hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03]"
                  >
                    {contactLabel}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <button
        type="button"
        onClick={() => {
          prevSlide();
          setIsAutoPlaying(false);
          setTimeout(() => setIsAutoPlaying(true), 10000);
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 hover:scale-110 transition-all duration-300"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={() => {
          nextSlide();
          setIsAutoPlaying(false);
          setTimeout(() => setIsAutoPlaying(true), 10000);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 hover:scale-110 transition-all duration-300"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicateurs + barre de progression */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-xs px-4">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className="min-h-11 min-w-11 rounded-full flex items-center justify-center"
              aria-label={`Slide ${index + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'bg-white h-2.5 w-10' : 'bg-white/40 hover:bg-white/70 h-2 w-2'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="w-full h-0.5 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-white/90 rounded-full transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <a
        href="#accueil-contenu"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/70 hover:text-white transition-colors"
        aria-label={locale === 'fr' ? 'Défiler vers le contenu' : 'Scroll to content'}
      >
        <ChevronDown className="w-6 h-6 animate-[bounceSoft_2s_ease-in-out_infinite]" />
      </a>
    </section>
  );
}
