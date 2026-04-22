'use client';

import { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, BarChart3, LineChart } from 'lucide-react';

interface WipeEffectProps {
  data: {
    label: string;
    value: number;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
  }[];
  className?: string;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export default function WipeEffect({ 
  data, 
  className = '',
  direction = 'left'
}: WipeEffectProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getWipeAnimation = () => {
    switch (direction) {
      case 'left':
        return 'translate-x-0 opacity-100';
      case 'right':
        return 'translate-x-0 opacity-100';
      case 'up':
        return 'translate-y-0 opacity-100';
      case 'down':
        return 'translate-y-0 opacity-100';
      default:
        return 'translate-x-0 opacity-100';
    }
  };

  const getInitialTransform = () => {
    switch (direction) {
      case 'left':
        return '-translate-x-full opacity-0';
      case 'right':
        return 'translate-x-full opacity-0';
      case 'up':
        return '-translate-y-full opacity-0';
      case 'down':
        return 'translate-y-full opacity-0';
      default:
        return '-translate-x-full opacity-0';
    }
  };

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((item, index) => {
          const Icon = item.icon || Activity;
          return (
            <div
              key={index}
              className={`relative p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-700 ease-out ${
                isVisible ? getWipeAnimation() : getInitialTransform()
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Scan Line Effect */}
              <div 
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-0 ${
                  isVisible ? 'animate-scan' : ''
                }`}
                style={{ animationDelay: `${index * 150 + 300}ms` }}
              />

              <div className="flex items-start gap-4">
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.color || 'bg-sky-100 dark:bg-sky-900/30'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${item.color?.replace('bg-', 'text-') || 'text-sky-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    {item.label}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.value.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    item.color || 'bg-sky-500'
                  }`}
                  style={{ 
                    width: isVisible ? `${Math.min(item.value / 10, 100)}%` : '0%',
                    transitionDelay: `${index * 150 + 500}ms`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 1.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
