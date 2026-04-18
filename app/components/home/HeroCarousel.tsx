'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Microscope, FlaskConical, Truck } from 'lucide-react';

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
}

interface HeroCarouselProps {
  translations: HeroTranslations;
  isDark: boolean;
}

const slides = [
  {
    id: 1,
    icon: Microscope,
    bgColor: 'from-blue-600 via-blue-700 to-indigo-800',
    image: '/images/hero/lab-1.jpg'
  },
  {
    id: 2,
    icon: FlaskConical,
    bgColor: 'from-emerald-600 via-emerald-700 to-teal-800',
    image: '/images/hero/lab-2.jpg'
  },
  {
    id: 3,
    icon: Truck,
    bgColor: 'from-purple-600 via-purple-700 to-pink-800',
    image: '/images/hero/delivery.jpg'
  }
];

export default function HeroCarousel({ translations, isDark }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const getSlideContent = (index: number) => {
    switch (index) {
      case 0:
        return {
          title: translations.title1,
          subtitle: translations.subtitle1,
          cta: translations.cta1
        };
      case 1:
        return {
          title: translations.title2,
          subtitle: translations.subtitle2,
          cta: translations.cta2
        };
      case 2:
        return {
          title: translations.title3,
          subtitle: translations.subtitle3,
          cta: translations.cta3
        };
      default:
        return {
          title: translations.title1,
          subtitle: translations.subtitle1,
          cta: translations.cta1
        };
    }
  };

  return (
    <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden">
      {slides.map((slide, index) => {
        const content = getSlideContent(index);
        const Icon = slide.icon;
        const isActive = index === currentSlide;
        
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive 
                ? 'opacity-100 translate-x-0' 
                : index < currentSlide 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image */}
            {slide.image && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
            )}
            {/* Background Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgColor} opacity-10`} />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Text Content */}
                  <div className={`text-white transition-all duration-1000 delay-300 ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">ADS, pour un diagnostics de précision</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                      {content.title}
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
                      {content.subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-zinc-900 font-semibold hover:bg-zinc-100 transition-all hover:scale-105 shadow-lg"
                      >
                        {content.cta}
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-white text-white font-semibold hover:bg-white/10 transition-all"
                      >
                        Nous contacter
                      </Link>
                    </div>
                  </div>

                  {/* Visual Element */}
                  <div className={`hidden lg:flex justify-center transition-all duration-1000 delay-500 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl" />
                      <div className="relative w-80 h-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Icon className="w-32 h-32 text-white/80" />
                      </div>
                      {/* Floating badges */}
                      <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-white text-zinc-900 font-bold text-sm shadow-lg">
                        Qualité garantie
                      </div>
                      <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full bg-zinc-900 text-white font-bold text-sm shadow-lg">
                        Livraison rapide
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          prevSlide();
          setIsAutoPlaying(false);
          setTimeout(() => setIsAutoPlaying(true), 10000);
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
        aria-label="Slide précédent"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => {
          nextSlide();
          setIsAutoPlaying(false);
          setTimeout(() => setIsAutoPlaying(true), 10000);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
        aria-label="Slide suivant"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/40 hover:bg-white/60 w-2'
            }`}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
