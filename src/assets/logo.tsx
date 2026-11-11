import React from 'react';

/** Emblème (bol fumant) : lisible même en petit, pour la barre de menu et les icônes. */
export const LOGO_EMBLEM_PATH = '/logo-embleme.png';
/** Logo complet avec le nom : pour les grands formats (pied de page, écrans d'accueil). */
export const LOGO_FULL_PATH = '/logo-complet.png';
export const OFFICIAL_LOGO_PATH = LOGO_FULL_PATH;

export function BrandLogo({
  className = 'w-12 h-12',
  variant = 'emblem'
}: {
  className?: string;
  variant?: 'emblem' | 'full';
}) {
  return (
    <span
      className={`relative overflow-hidden rounded-xl bg-white flex items-center justify-center border border-[#e8ded1] shrink-0 ${className}`}
    >
      <img
        src={variant === 'full' ? LOGO_FULL_PATH : LOGO_EMBLEM_PATH}
        alt="Logo Dibor & Gnilane Food"
        width={256}
        height={256}
        className="w-full h-full object-contain"
        loading="eager"
        decoding="async"
      />
    </span>
  );
}

export function BrandFullLogo({ className = 'h-16 sm:h-20 w-auto' }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center ${className}`}>
      <img src={LOGO_FULL_PATH} alt="Dibor & Gnilane Food" className="h-full w-auto object-contain max-h-full" loading="eager" />
    </span>
  );
}
