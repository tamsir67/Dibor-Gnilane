import React from 'react';

export const OFFICIAL_LOGO_PATH = '/assets/aistudio/image_b012f474.png';

export function BrandLogo({
  className = 'w-14 h-14 sm:w-16 sm:h-16',
  variant = 'emblem'
}: {
  className?: string;
  variant?: 'emblem' | 'full';
}) {
  if (variant === 'full') {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={OFFICIAL_LOGO_PATH}
          alt="Dibor & Gnilane Food"
          className="w-full h-full object-contain filter drop-shadow-xs"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white shadow-sm flex items-center justify-center p-1.5 border border-[#e8ded1] shrink-0 transition-all ${className}`}
    >
      <img
        src={OFFICIAL_LOGO_PATH}
        alt="Logo Dibor & Gnilane Food"
        className="w-full h-full object-contain filter contrast-105"
        loading="eager"
      />
    </div>
  );
}

export function BrandFullLogo({ className = 'h-16 sm:h-20 w-auto' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={OFFICIAL_LOGO_PATH}
        alt="Dibor & Gnilane Food"
        className="h-full w-auto object-contain max-h-full"
        loading="eager"
      />
    </div>
  );
}
