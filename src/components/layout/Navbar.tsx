import React, { useEffect, useRef, useState } from 'react';
import { BrandLogo } from '../../assets/logo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { ShoppingBag, UserCheck, Shield, ChefHat, Bike, ChevronDown, Sparkles, Utensils, Clock, Users } from 'lucide-react';
import { formatEuro } from '../../utils/format.ts';
import { PWAInstallButton } from '../pwa/PWAInstallButton.tsx';
import type { Role } from '../../types/index.ts';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

/** Écran d'accueil de chaque profil. */
export const ROLE_HOME: Record<Role, string> = { client: 'menu', admin: 'admin', cuisine: 'cuisine', livreur: 'livreur' };

const ROLES: { role: Role; label: string; hint: string; icon: React.ReactNode; color: string }[] = [
  { role: 'client', label: 'Espace Client', hint: 'Commander, fidélité, suivi', icon: <UserCheck className="w-4 h-4" />, color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { role: 'admin', label: 'Administration', hint: 'Plats, utilisateurs, statistiques', icon: <Shield className="w-4 h-4" />, color: 'text-red-800 bg-red-50 border-red-200' },
  { role: 'cuisine', label: 'Écran Cuisine', hint: 'Préparation et allergènes', icon: <ChefHat className="w-4 h-4" />, color: 'text-orange-800 bg-orange-50 border-orange-200' },
  { role: 'livreur', label: 'Livreur / Remise', hint: 'Code client et dérogation', icon: <Bike className="w-4 h-4" />, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenCart, onOpenAuth }) => {
  const { currentUser, switchRole } = useAuth();
  const { cartCount, total } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const role: Role = currentUser?.role ?? 'client';
  const current = ROLES.find((r) => r.role === role)!;

  // Fermer le menu des profils en cliquant ailleurs ou avec Échap.
  useEffect(() => {
    if (!roleMenuOpen) return;
    const onDown = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setRoleMenuOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setRoleMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [roleMenuOpen]);

  const activate = async (r: Role) => {
    setRoleMenuOpen(false);
    setSwitchError(null);
    const ok = await switchRole(r);
    if (ok) onTabChange(ROLE_HOME[r]);
    else setSwitchError('Impossible de charger ce profil : le serveur ne répond pas.');
  };

  const desktopLink = (tab: string, label: React.ReactNode, onClick?: () => void) => (
    <button
      onClick={onClick ?? (() => onTabChange(tab))}
      className={`hover:text-[#d4652a] transition-colors whitespace-nowrap pb-1 border-b-2 flex items-center gap-1.5 ${
        currentTab === tab ? 'border-[#d4652a] text-[#d4652a]' : 'border-transparent'
      }`}
    >
      {label}
    </button>
  );

  // Le 5e bouton de la barre mobile mène à l'écran du profil actif (ou au traiteur pour un client).
  const staffTab = role === 'client' ? null : ROLES.find((r) => r.role === role)!;
  const mobileItems: { tab: string; label: string; icon: React.ReactNode; onClick?: () => void }[] = [
    { tab: 'menu', label: 'Carte', icon: <Utensils className="w-4 h-4" /> },
    { tab: 'tracking', label: 'Suivi', icon: <Bike className="w-4 h-4" /> },
    { tab: 'scolaire', label: 'Scolaire', icon: <Clock className="w-4 h-4" /> },
    { tab: 'member', label: 'Compte', icon: <UserCheck className="w-4 h-4" />, onClick: currentUser ? undefined : onOpenAuth },
    staffTab
      ? { tab: ROLE_HOME[role], label: staffTab.role === 'admin' ? 'Admin' : staffTab.role === 'cuisine' ? 'Cuisine' : 'Livreur', icon: staffTab.icon }
      : { tab: 'catering', label: 'Traiteur', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f3]/95 backdrop-blur-md border-b border-[#e8ded1]">
      {/* Bandeau d'information, une seule ligne */}
      <div className="bg-[#2e1810] text-[#f7ece1] text-[11px] leading-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-7 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e3a72f] shrink-0" />
            <span className="font-semibold text-[#e3a72f] truncate">Fast-food &amp; traiteur sénégalais</span>
            <span className="text-[#c8b7a6] hidden md:inline truncate">· 2G avenue des Étangs, La Celle-Saint-Cloud</span>
          </p>
          <button onClick={() => onTabChange('tracking')} className="text-[#e3a72f] hover:underline flex items-center gap-1 font-semibold shrink-0">
            <Bike className="w-3 h-3" /> Suivi direct
          </button>
        </div>
      </div>

      {/* Barre principale : marque · navigation (grand écran) · actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:gap-6 h-14 sm:h-16">
          <button onClick={() => onTabChange('menu')} className="flex items-center gap-2.5 text-left shrink-0 min-w-0" aria-label="Accueil Dibor & Gnilane">
            <BrandLogo className="w-10 h-10 sm:w-11 sm:h-11" />
            <span className="hidden min-[400px]:block leading-none">
              <span className="block font-display font-bold text-[15px] sm:text-lg text-[#2e1810] whitespace-nowrap">
                DIBOR <span className="text-[#d4652a]">&amp;</span> GNILANE
              </span>
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] text-[#8c6b5d] mt-1">Food</span>
            </span>
          </button>

          <nav aria-label="Navigation principale" className="hidden xl:flex items-center gap-4 text-sm font-semibold text-[#5c3e34] min-w-0">
            {desktopLink('menu', 'La carte')}
            {desktopLink('quick', <><Sparkles className="w-3.5 h-3.5 text-[#e3a72f]" />Commande rapide</>, () => {
              onTabChange('menu');
              setTimeout(() => document.getElementById('quick-dropdown-order')?.scrollIntoView({ behavior: 'smooth' }), 120);
            })}
            {desktopLink('scolaire', 'Pause scolaire')}
            {desktopLink('tracking', <><Bike className="w-3.5 h-3.5 text-[#1f6b42]" />Suivi</>)}
            {desktopLink('catering', 'Traiteur 20+')}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
            <PWAInstallButton variant="nav" />

            <button
              onClick={currentUser ? () => onTabChange('member') : onOpenAuth}
              className="flex items-center gap-1.5 h-10 px-2.5 rounded-xl border border-[#e8ded1] bg-white hover:bg-[#faf7f3] text-xs font-semibold text-[#2e1810]"
              title={currentUser ? 'Mon espace membre' : "S'identifier ou créer un compte"}
            >
              <UserCheck className="w-4 h-4 text-[#d4652a] shrink-0" />
              <span className="hidden lg:block text-left leading-tight">
                <span className="block text-[11px] font-bold max-w-[110px] truncate">{currentUser ? currentUser.name.split(' ')[0] : "S'identifier"}</span>
                <span className="block text-[10px] text-[#8c6b5d]">{currentUser ? `${currentUser.loyaltyPoints} pts Teranga` : 'Mon compte'}</span>
              </span>
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setRoleMenuOpen((o) => !o)}
                aria-expanded={roleMenuOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1 h-10 px-2.5 rounded-xl border text-xs font-semibold ${current.color}`}
                title="Changer de profil"
              >
                {current.icon}
                <span className="hidden lg:inline whitespace-nowrap">{current.label}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
              {roleMenuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white rounded-xl shadow-xl border border-[#e8ded1] py-2 z-50">
                  <p className="px-3 py-1.5 text-[11px] font-bold text-[#8c6b5d] uppercase border-b border-[#f0e8df]">Changer de profil</p>
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      role="menuitem"
                      onClick={() => activate(r.role)}
                      className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 hover:bg-[#faf7f3] ${r.role === role ? 'bg-[#faf7f3]' : ''}`}
                    >
                      <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${r.color}`}>{r.icon}</span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#2e1810]">{r.label}{r.role === role && ' · actif'}</span>
                        <span className="block text-[11px] text-[#8c6b5d]">{r.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 h-10 px-3 rounded-xl bg-[#2e1810] text-[#f7ece1] hover:bg-[#432317] shadow-sm"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#e3a72f]" />
              <span className="hidden sm:inline text-xs font-bold tabular-nums">{cartCount > 0 ? formatEuro(total) : 'Panier'}</span>
              {cartCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-[#d4652a] text-white text-[11px] font-extrabold flex items-center justify-center tabular-nums">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {switchError && (
        <p role="alert" className="bg-red-50 text-red-800 text-xs text-center py-1.5 px-3 border-t border-red-200">{switchError}</p>
      )}

      {/* Barre d'onglets tactile (téléphone, tablette et petits écrans) */}
      <nav aria-label="Navigation mobile" className="xl:hidden border-t border-[#ede2d6] px-2 py-1 grid grid-cols-5 gap-1 max-w-3xl mx-auto text-[11px] font-bold text-[#735144]">
        {mobileItems.map((it) => (
          <button
            key={it.label}
            onClick={it.onClick ?? (() => onTabChange(it.tab))}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
              currentTab === it.tab ? 'bg-[#2e1810] text-white' : 'hover:bg-[#f0e8df]'
            }`}
          >
            {it.icon}
            <span className="truncate max-w-full">{it.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
};
