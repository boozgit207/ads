'use client';

import AnimateInView from './AnimateInView';

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export default function SectionHeading({
  label,
  title,
  subtitle,
  align = 'center',
  dark = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`mb-12 md:mb-16 max-w-3xl ${alignClass}`}>
      {label && (
        <AnimateInView animation="fade-in" delay={0}>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-4 ${
              dark
                ? 'bg-white/15 text-sky-100 border border-white/20'
                : 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {label}
          </span>
        </AnimateInView>
      )}
      <AnimateInView animation="fade-up" delay={80}>
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${
            dark ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          {title}
        </h2>
      </AnimateInView>
      {subtitle && (
        <AnimateInView animation="fade-up" delay={160}>
          <p
            className={`mt-4 text-lg leading-relaxed ${
              dark ? 'text-sky-100/90' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {subtitle}
          </p>
        </AnimateInView>
      )}
    </div>
  );
}
