'use client';

import {
  CONSUMABLES_ICON,
  getLabLogoPath,
  isLabIconOnly,
} from '@/lib/lab-logos';

type LabLogoProps = {
  slug?: string | null;
  nom?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

const sizeClasses = {
  sm: { box: 'h-8 w-16', img: 'max-h-7 max-w-[4rem] w-auto h-auto object-contain', icon: 'w-5 h-5' },
  md: { box: 'h-16 w-32', img: 'max-h-14 max-w-[7.5rem] w-auto h-auto object-contain', icon: 'w-9 h-9' },
  lg: { box: 'w-full h-full p-4 sm:p-6', img: 'w-full h-full max-h-[7.5rem] object-contain object-center', icon: 'w-14 h-14' },
  xl: { box: 'h-28 w-full max-w-[10rem]', img: 'max-h-24 w-full object-contain object-center', icon: 'w-16 h-16' },
};

export default function LabLogo({ slug, nom, size = 'md', className = '' }: LabLogoProps) {
  const logo = getLabLogoPath(slug, nom);
  const iconOnly = isLabIconOnly(slug, nom) || !logo;
  const s = sizeClasses[size];
  const Icon = CONSUMABLES_ICON;
  const label = nom || slug || 'Laboratoire';

  if (iconOnly) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ${s.box} ${className}`}
        aria-hidden
      >
        <Icon className={s.icon} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${s.box} ${className}`}>
      <img src={logo} alt={label} className={s.img} />
    </div>
  );
}

