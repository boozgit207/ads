'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

export type HomeAnimation =
  | 'fade-up'
  | 'fade-in'
  | 'slide-left'
  | 'slide-right'
  | 'scale-up'
  | 'blur-in';

const animationClass: Record<HomeAnimation, string> = {
  'fade-up': 'home-anim-fade-up',
  'fade-in': 'home-anim-fade-in',
  'slide-left': 'home-anim-slide-left',
  'slide-right': 'home-anim-slide-right',
  'scale-up': 'home-anim-scale-up',
  'blur-in': 'home-anim-blur-in',
};

interface AnimateInViewProps {
  children: ReactNode;
  className?: string;
  animation?: HomeAnimation;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export default function AnimateInView({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration,
  once = true,
}: AnimateInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const style: CSSProperties = {
    animationDelay: `${delay}ms`,
    ...(duration ? { animationDuration: `${duration}ms` } : {}),
  };

  return (
    <div
      ref={ref}
      className={`home-anim-prep ${visible ? animationClass[animation] : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
