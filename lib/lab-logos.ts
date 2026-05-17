import { Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Chemins des logos (public/images/image laboratoires) */
export const LAB_LOGOS = {
  fortress: '/images/image laboratoires/fortress-diagnostics-logo2020.png',
  bioline: '/images/image laboratoires/Bioline_diagnostics.png',
  hightop: '/images/image laboratoires/hightop.jpg',
  liofilchem: '/images/image laboratoires/logo-liofilchem.jpg',
} as const;

export type PartnerLabId = 'fortress' | 'bioline' | 'hightop' | 'liofilchem';

export const PARTNER_LABS: {
  id: PartnerLabId;
  slug: string;
  name: string;
  logo: string;
}[] = [
  { id: 'fortress', slug: 'fortress-diagnostics', name: 'Fortress Diagnostics', logo: LAB_LOGOS.fortress },
  { id: 'bioline', slug: 'bioline', name: 'Bioline', logo: LAB_LOGOS.bioline },
  { id: 'hightop', slug: 'hightop', name: 'Hightop', logo: LAB_LOGOS.hightop },
  { id: 'liofilchem', slug: 'liofilchem', name: 'Liofilchem', logo: LAB_LOGOS.liofilchem },
];

function matchKey(slug?: string | null, nom?: string | null): string {
  return `${slug || ''} ${nom || ''}`.toLowerCase();
}

/** Consommables = pas de logo fichier, afficher une icône */
export function isLabIconOnly(slug?: string | null, nom?: string | null): boolean {
  const key = matchKey(slug, nom);
  return key.includes('consommable') || key.includes('consumable');
}

export function getLabLogoPath(slug?: string | null, nom?: string | null): string | null {
  if (isLabIconOnly(slug, nom)) return null;
  const key = matchKey(slug, nom);
  if (key.includes('fortress')) return LAB_LOGOS.fortress;
  if (key.includes('bioline')) return LAB_LOGOS.bioline;
  if (key.includes('hightop')) return LAB_LOGOS.hightop;
  if (key.includes('liofilchem') || key.includes('liofil')) return LAB_LOGOS.liofilchem;
  return null;
}

export function resolvePartnerLab(slug?: string | null, nom?: string | null) {
  const key = matchKey(slug, nom);
  return (
    PARTNER_LABS.find(
      (l) => key.includes(l.id) || key.includes(l.slug.replace(/-/g, ' ')) || key.includes(l.slug)
    ) ?? null
  );
}

export const CONSUMABLES_ICON: LucideIcon = Package;
