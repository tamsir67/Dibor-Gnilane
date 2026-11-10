import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';
import { WifiOff, AlertTriangle } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-2xl bg-[#2e1810] text-[#f7ece1] px-4 py-3 shadow-2xl border border-amber-500/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4" />
      </div>
      <div className="text-xs">
        <span className="font-bold text-white block">Mode hors ligne activé</span>
        <span className="text-[11px] text-[#deb8a0]">
          Connexion interrompue. Vos données et votre panier sont conservés en local (Service Worker).
        </span>
      </div>
    </div>
  );
};
