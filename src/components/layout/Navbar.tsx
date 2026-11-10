import React, { useState } from 'react';
import { BrandLogo } from '../../assets/logo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { ShoppingBag, UserCheck, Shield, ChefHat, Bike, ChevronDown, Sparkles } from 'lucide-react';
import { formatEuro } from '../../utils/format.ts';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenCart, onOpenAuth }) => {
  const { currentUser, switchRole } = useAuth();
  const { cartCount, total } = useCart();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roleLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    client: { label: 'Espace Client', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'text-amber-800 bg-amber-50 border-amber-200' },
    admin: { label: 'Administration', icon: <Shield className="w-3.5 h-3.5" />, color: 'text-red-800 bg-red-50 border-red-200' },
    cuisine: { label: 'Écran Cuisine', icon: <ChefHat className="w-3.5 h-3.5" />, color: 'text-orange-800 bg-orange-50 border-orange-200' },
    livreur: { label: 'Livreur / Remise', icon: <Bike className="w-3.5 h-3.5" />, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' }
  };

  const currentRoleInfo = roleLabels[currentUser?.role || 'client'];

  return (
    <header className="sticky top-0 z-40 bg-[#faf7f3]/95 backdrop-blur-md border-b border-[#e8ded1] transition-all">
      {/* Top Banner Notice for Quality & Teranga Experience */}
      <div className="bg-[#2e1810] text-[#f7ece1] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-[#e3a72f]"></span>
            <span className="font-medium text-[#e3a72f]">Fast-Food &amp; Traiteur Sénégalais</span>
            <span className="text-[#c8b7a6] hidden sm:inline">· 2G avenue des Étangs, La Celle-Saint-Cloud · Ouvert du mardi au samedi</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#decbc0]">
            <button
              onClick={() => onTabChange('tracking')}
              className="text-[#e3a72f] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Bike className="w-3 h-3" />
              <span>Suivre ma commande en direct</span>
            </button>
            <span className="hidden sm:inline">·</span>
            <span className="text-[#ebd7c8] hidden md:inline">Paiement 100% Sécurisé</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 sm:gap-8 h-20">
          {/* Zone 1: Single element brand wordmark with prominent enlarged logo */}
          <button
            onClick={() => onTabChange('menu')}
            className="flex items-center gap-3.5 text-left focus:outline-none group shrink-0"
          >
            <BrandLogo className="w-13 h-13 sm:w-16 sm:h-16 transition-transform group-hover:scale-105 shadow-xs" />
            <div>
              <span className="text-xl sm:text-2xl font-bold font-display tracking-tight text-[#2e1810] block leading-none">
                DIBOR <span className="text-[#d4652a]">&amp;</span> GNILANE
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c6b5d] block mt-1">
                Gastronomie Sénégalaise
              </span>
            </div>
          </button>

          {/* Zone 2: Single-line clean navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#5c3e34]">
            <button
              onClick={() => onTabChange('menu')}
              className={`hover:text-[#d4652a] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                currentTab === 'menu' ? 'border-[#d4652a] text-[#d4652a]' : 'border-transparent'
              }`}
            >
              La Carte
            </button>
            <button
              onClick={() => {
                onTabChange('menu');
                setTimeout(() => {
                  const el = document.getElementById('quick-dropdown-order');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-[#d4652a] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent flex items-center gap-1 text-[#d4652a]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e3a72f]" />
              <span>Commande Liste Déroulante</span>
            </button>
            <button
              onClick={() => onTabChange('scolaire')}
              className={`hover:text-[#d4652a] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                currentTab === 'scolaire' ? 'border-[#d4652a] text-[#d4652a]' : 'border-transparent'
              }`}
            >
              Pause Scolaire
            </button>
            <button
              onClick={() => onTabChange('tracking')}
              className={`hover:text-[#d4652a] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'tracking' ? 'border-[#d4652a] text-[#d4652a]' : 'border-transparent'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-[#1f6b42]" />
              <span>Suivi Livraison</span>
            </button>
            <button
              onClick={() => onTabChange('catering')}
              className={`hover:text-[#d4652a] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                currentTab === 'catering' ? 'border-[#d4652a] text-[#d4652a]' : 'border-transparent'
              }`}
            >
              Traiteur 20+ Pers.
            </button>
          </nav>

          {/* Zone 3: Customer Identification + Role Switcher + Shopping Bag */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Customer Identification Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e8ded1] bg-white hover:bg-[#faf7f3] text-xs font-semibold text-[#2e1810] shadow-2xs transition-all active:scale-95"
              title="S'identifier ou créer un compte client"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#d4652a]" />
              <div className="text-left hidden sm:block">
                <span className="block leading-tight text-[11px] font-bold">
                  {currentUser ? currentUser.name.split(' ')[0] : "S'identifier"}
                </span>
                <span className="block text-[10px] text-[#8c6b5d] leading-none">
                  {currentUser ? `${currentUser.loyaltyPoints} pts Teranga` : 'Mon compte'}
                </span>
              </div>
            </button>

            {/* Quick Role Switcher for seamless testing */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors ${currentRoleInfo.color}`}
                title="Changer de vue ou de rôle utilisateur pour tester l'application"
              >
                {currentRoleInfo.icon}
                <span className="hidden md:inline">{currentRoleInfo.label}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e8ded1] py-2 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#8c6b5d] uppercase border-b border-[#f0e8df]">
                    Changer d’espace / rôle
                  </div>
                  <button
                    onClick={() => {
                      switchRole('client');
                      onTabChange('menu');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#faf7f3]"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-700" />
                      <div>
                        <p className="font-semibold text-[#2e1810]">Espace Client</p>
                        <p className="text-[11px] text-[#8c6b5d]">Commander, fidélité, suivi</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('tracking');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#faf7f3]"
                  >
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="font-semibold text-[#2e1810]">Suivi Livraison en Direct</p>
                        <p className="text-[11px] text-[#8c6b5d]">Localisation, étape &amp; code</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      onTabChange('admin');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#faf7f3]"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-700" />
                      <div>
                        <p className="font-semibold text-[#2e1810]">Tableau de Bord Admin</p>
                        <p className="text-[11px] text-[#8c6b5d]">CRUD Plats, Utilisateurs, Stats</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('cuisine');
                      onTabChange('cuisine');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#faf7f3]"
                  >
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-orange-700" />
                      <div>
                        <p className="font-semibold text-[#2e1810]">Écran Cuisine (KDS)</p>
                        <p className="text-[11px] text-[#8c6b5d]">Préparation &amp; allergènes</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('livreur');
                      onTabChange('livreur');
                      setRoleMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#faf7f3]"
                  >
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-emerald-700" />
                      <div>
                        <p className="font-semibold text-[#2e1810]">Remise &amp; Livraison</p>
                        <p className="text-[11px] text-[#8c6b5d]">Code client &amp; dérogation</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Bag CTA */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#2e1810] text-[#f7ece1] hover:bg-[#432317] active:scale-95 transition-all shadow-sm"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-4 h-4 text-[#e3a72f]" />
              <span className="text-xs font-bold tabular-nums">
                {cartCount > 0 ? formatEuro(total) : 'Panier'}
              </span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#d4652a] text-white text-[11px] font-extrabold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-[#ede2d6] bg-[#faf7f3] px-2 py-1.5 flex items-center justify-around text-xs font-semibold text-[#735144]">
        <button
          onClick={() => onTabChange('menu')}
          className={`px-2.5 py-1 rounded-md ${currentTab === 'menu' ? 'bg-[#2e1810] text-white' : ''}`}
        >
          Carte
        </button>
        <button
          onClick={() => onTabChange('tracking')}
          className={`px-2.5 py-1 rounded-md ${currentTab === 'tracking' ? 'bg-[#2e1810] text-white' : ''}`}
        >
          Suivi 🛵
        </button>
        <button
          onClick={() => onTabChange('scolaire')}
          className={`px-2.5 py-1 rounded-md ${currentTab === 'scolaire' ? 'bg-[#2e1810] text-white' : ''}`}
        >
          Scolaire
        </button>
        <button
          onClick={onOpenAuth}
          className="px-2.5 py-1 rounded-md text-[#d4652a] font-bold"
        >
          Compte 👤
        </button>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => onTabChange('admin')}
            className={`px-2.5 py-1 rounded-md ${currentTab === 'admin' ? 'bg-[#b8462e] text-white' : ''}`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};


