import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { Download, Smartphone, Share, PlusSquare, X, Check, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'nav',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGeneralGuide, setShowGeneralGuide] = useState(false);

  // If already installed as standalone PWA, hide install affordances
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowGeneralGuide(true);
    }
  };

  const renderModal = () => {
    if (!showIOSModal && !showGeneralGuide) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e8ded1] text-[#2e1810] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0e8df]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#2e1810] text-[#e3a72f] flex items-center justify-center font-bold shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#2e1810]">
                  Installer Dibor &amp; Gnilane Food
                </h3>
                <p className="text-xs text-[#8c6b5d]">
                  {showIOSModal ? 'Sur votre iPhone / iPad (iOS)' : 'Sur votre appareil (Android / PC)'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowIOSModal(false);
                setShowGeneralGuide(false);
              }}
              className="w-8 h-8 rounded-full bg-[#faf7f3] border border-[#e8ded1] flex items-center justify-center text-[#735144] hover:bg-[#f0e8df] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {showIOSModal ? (
            /* iOS Safari Step-by-Step Guide */
            <div className="space-y-3.5 text-xs text-[#5c3e34]">
              <p className="text-[11px] text-[#735144] leading-relaxed">
                Sur Safari iOS, Apple nécessite deux étapes manuelles pour ajouter l'application à votre écran d'accueil comme une application de l'App Store :
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#faf7f3] border border-[#ede2d6]">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2e1810] block">1. Bouton Partager</span>
                    <span className="text-[11px] text-[#8c6b5d]">
                      Appuyez sur l'icône <strong>Partager</strong> en bas de votre écran dans Safari (carré avec flèche vers le haut).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#faf7f3] border border-[#ede2d6]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2e1810] block">2. Sur l'écran d'accueil</span>
                    <span className="text-[11px] text-[#8c6b5d]">
                      Faites défiler vers le bas et touchez <strong>"Sur l'écran d'accueil"</strong> (+).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#faf7f3] border border-[#ede2d6]">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2e1810] block">3. Valider "Ajouter"</span>
                    <span className="text-[11px] text-[#8c6b5d]">
                      Touchez <strong>Ajouter</strong> en haut à droite. L'icône de l'application apparaît sur votre iPhone !
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e3a72f] shrink-0" />
                <span>
                  Lancement instantané en plein écran sans barre d'adresse, notifications et accès rapide.
                </span>
              </div>
            </div>
          ) : (
            /* General Chrome / Android / Desktop Guide */
            <div className="space-y-3 text-xs text-[#5c3e34]">
              <p className="text-[11px] leading-relaxed">
                Pour installer l'application sur votre appareil :
              </p>
              <ul className="space-y-2 list-disc pl-5 text-[11px] text-[#735144]">
                <li>
                  <strong>Sur Android (Chrome) :</strong> Touchez le menu à 3 points en haut à droite, puis sélectionnez <em>"Installer l'application"</em> ou <em>"Ajouter à l'écran d'accueil"</em>.
                </li>
                <li>
                  <strong>Sur Ordinateur (Chrome / Edge) :</strong> Cliquez sur l'icône d'installation dans la barre d'adresse (à droite de l'URL).
                </li>
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              setShowIOSModal(false);
              setShowGeneralGuide(false);
            }}
            className="w-full py-2.5 rounded-xl bg-[#2e1810] text-[#f7ece1] text-xs font-bold hover:bg-[#432317] transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2e1810] to-[#432317] text-white shadow-md border border-[#e3a72f]/30 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#e3a72f] text-[#2e1810] flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white">
                  Installez l'application mobile Dibor &amp; Gnilane
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PWA Mobile
                </span>
              </div>
              <p className="text-xs text-[#deb8a0] mt-0.5">
                Disponible pour iPhone (iOS Safari) et smartphones Android (Chrome). Commandez en 1 clic sans passer par l'App Store.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#e3a72f] hover:bg-[#c98e21] text-[#2e1810] text-xs font-black shrink-0 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isIOS ? 'Installer sur iPhone (iOS)' : "Installer l'App (Android / PC)"}</span>
          </button>
        </div>
        {renderModal()}
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e3a72f]/15 hover:bg-[#e3a72f]/25 border border-[#e3a72f]/40 text-[#8c5912] text-xs font-bold transition-all cursor-pointer ${className}`}
          title="Installer l'application sur smartphone Android ou iPhone"
        >
          <Download className="w-3.5 h-3.5 text-[#d4652a]" />
          <span>App Mobile</span>
        </button>
        {renderModal()}
      </>
    );
  }

  // Default nav variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e3a72f]/20 hover:bg-[#e3a72f]/30 border border-[#e3a72f]/40 text-[#7a490d] text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer ${className}`}
        title="Installer l'application sur smartphone Android ou iPhone"
      >
        <Download className="w-3.5 h-3.5 text-[#d4652a]" />
        <span className="hidden sm:inline">Installer l'App</span>
        <span className="sm:hidden">App</span>
      </button>
      {renderModal()}
    </>
  );
};
