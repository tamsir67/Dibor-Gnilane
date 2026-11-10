import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { ClientView } from './views/ClientView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { OrderConfirmationView } from './views/OrderConfirmationView.tsx';
import { MemberPortalView } from './views/MemberPortalView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { KitchenView } from './views/KitchenView.tsx';
import { DeliveryView } from './views/DeliveryView.tsx';
import { DeliveryTrackingView } from './views/DeliveryTrackingView.tsx';
import { CateringView } from './views/CateringView.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { OfflineIndicator } from './components/pwa/OfflineIndicator.tsx';
import { Order } from './types/index.ts';
import { BrandLogo } from './assets/logo.tsx';

function MainApp() {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  const [currentTab, setCurrentTab] = useState<string>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentTab('confirmation');
  };

  const handleReorder = (order: Order) => {
    order.lines.forEach(line => {
      addToCart(
        {
          id: line.pid,
          cat: 'plats',
          name: line.name,
          desc: '',
          price: line.unit
        },
        line.opts,
        line.qty,
        line.uses,
        line.unit,
        line.al
      );
    });
    setIsCartOpen(true);
  };

  const handleNavigateToTracking = (orderId?: string) => {
    if (orderId) setTrackingOrderId(orderId);
    setCurrentTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f3] text-[#2c1810]">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab: string) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCurrentTab('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Customer Identification & Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Network Offline Status Indicator */}
      <OfflineIndicator />

      {/* Main View Body */}
      <main className="flex-1">
        {currentTab === 'menu' && (
          <ClientView
            onOpenCart={() => setIsCartOpen(true)}
            onNavigateToCatering={() => setCurrentTab('catering')}
            onNavigateToCheckout={() => setCurrentTab('checkout')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToTracking={handleNavigateToTracking}
          />
        )}

        {currentTab === 'scolaire' && (
          <ClientView
            onOpenCart={() => setIsCartOpen(true)}
            onNavigateToCatering={() => setCurrentTab('catering')}
            onNavigateToCheckout={() => setCurrentTab('checkout')}
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigateToTracking={handleNavigateToTracking}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutView
            onBack={() => setCurrentTab('menu')}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentTab === 'confirmation' && confirmedOrder && (
          <OrderConfirmationView
            order={confirmedOrder}
            onNewOrder={() => {
              setConfirmedOrder(null);
              setCurrentTab('menu');
            }}
            onGoToMember={() => setCurrentTab('member')}
            onGoToTracking={handleNavigateToTracking}
          />
        )}

        {currentTab === 'tracking' && (
          <DeliveryTrackingView
            initialOrderId={trackingOrderId}
            onNavigateToMenu={() => {
              setCurrentTab('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'member' && (
          <MemberPortalView
            onReorder={handleReorder}
            onNavigateToMenu={() => setCurrentTab('menu')}
          />
        )}

        {currentTab === 'admin' && <AdminDashboardView />}

        {currentTab === 'cuisine' && <KitchenView />}

        {currentTab === 'livreur' && <DeliveryView />}

        {currentTab === 'catering' && (
          <CateringView onBackToMenu={() => setCurrentTab('menu')} />
        )}
      </main>

      {/* Elegant Footer */}
      <footer className="bg-[#2e1810] text-[#deb8a0] border-t border-[#45281e] pt-12 pb-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#45281e]">
          {/* Column 1: Brand & Bio with prominent logo */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center gap-3.5">
              <BrandLogo className="w-13 h-13 sm:w-16 sm:h-16 shadow-xs" />
              <div>
                <span className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight block leading-none">
                  DIBOR <span className="text-[#e3a72f]">&amp;</span> GNILANE
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#e3a72f] mt-1 block">
                  — FOOD —
                </span>
              </div>
            </div>
            <p className="text-xs text-[#bfa293] leading-relaxed max-w-sm">
              Le goût de l’Afrique, livré à l’heure. Spécialités sénégalaises authentiques cuisinées avec amour chaque matin à La Celle-Saint-Cloud.
            </p>
            <div className="text-xs text-[#ebd7c8] space-y-1 pt-1">
              <p className="flex items-center gap-1.5 text-[#e3a72f]">
                <span>📍</span> 2G avenue des Étangs, 78170 La Celle-Saint-Cloud
              </p>
              <p className="text-[11px] text-[#967769]">
                Zone de livraison : La Celle-St-Cloud, Vaucresson, Bougival, Rueil, Versailles.
              </p>
            </div>

            {/* Social Media Channels */}
            <div className="pt-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white block mb-2.5">
                Suivez-nous sur les réseaux
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all group"
                  aria-label="Instagram Dibor & Gnilane"
                >
                  <svg className="w-4 h-4 text-[#e3a72f] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  <span>@dibor_gnilane</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all group"
                  aria-label="TikTok Dibor & Gnilane"
                >
                  <svg className="w-4 h-4 text-[#d4652a] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 10.74 4.54 6.27 6.27 0 0 0 1.95-4.54V8.71a8.18 8.18 0 0 0 4.79 1.54V6.8a4.87 4.87 0 0 1-.89-.11z"/>
                  </svg>
                  <span>TikTok</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all group"
                  aria-label="Facebook Dibor & Gnilane"
                >
                  <svg className="w-4 h-4 text-[#1da1f2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/33611223344"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-semibold transition-all group"
                  aria-label="WhatsApp Dibor & Gnilane"
                >
                  <svg className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.16 8.16 0 0 1-1.25-4.47c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.19-.48-.31z"/>
                  </svg>
                  <span>WhatsApp Traiteur</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Horaires */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Horaires d’ouverture
            </h4>
            <p>Du mardi au samedi :</p>
            <p className="font-semibold text-white">Midi : 11h30 – 14h00</p>
            <p className="font-semibold text-white">Soir : 18h30 – 21h30</p>
            <p className="text-[11px] text-[#bfa293] pt-1">
              Fermé dimanche &amp; lundi pour approvisionnement frais.
            </p>
          </div>

          {/* Column 3: Transparence & Engagements */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Engagements Teranga
            </h4>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1f6b42]"></span>
              Viandes 100% Halal certifiées
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e3a72f]"></span>
              Allergènes signalés sur chaque plat
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4652a]"></span>
              Chaîne du chaud garantie jusqu’au client
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Programme fidélité : 1 € = 1 point
            </p>
          </div>

          {/* Column 4: Navigation Rapide */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Espaces &amp; Rôles
            </h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setCurrentTab('menu')}
                className="text-left text-[#deb8a0] hover:text-[#e3a72f] transition-colors"
              >
                Commander en ligne
              </button>
              <button
                onClick={() => setCurrentTab('scolaire')}
                className="text-left text-[#deb8a0] hover:text-[#e3a72f] transition-colors"
              >
                Formules Pause Scolaire
              </button>
              <button
                onClick={() => setCurrentTab('catering')}
                className="text-left text-[#deb8a0] hover:text-[#e3a72f] transition-colors"
              >
                Traiteur Groupes 20+ pers.
              </button>
              <button
                onClick={() => setCurrentTab('member')}
                className="text-left text-[#deb8a0] hover:text-[#e3a72f] transition-colors"
              >
                Espace Membre Client
              </button>
              <button
                onClick={() => setCurrentTab('admin')}
                className="text-left text-[#deb8a0] hover:text-[#e3a72f] transition-colors"
              >
                Tableau de bord Admin
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods Section (Modèles de paiement acceptés) */}
        <div className="py-6 border-b border-[#45281e]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-center lg:text-left">
              <span className="text-[11px] uppercase font-bold tracking-wider text-white block">
                Moyens de paiement sécurisés acceptés
              </span>
              <p className="text-[11px] text-[#bfa293] mt-0.5">
                Transactions 100% chiffrées SSL 256-bit · 3D-Secure · Zéro stockage de coordonnées bancaires
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Carte Bancaire (CB) */}
              <div className="px-2.5 py-1.5 rounded-lg bg-white/90 text-[#002f6c] font-black text-xs tracking-tighter shadow-xs border border-white" title="Carte Bancaire CB">
                <span className="text-[10px] font-extrabold bg-[#008060] text-white px-1 py-0.2 rounded mr-1">CB</span>
                <span>CARTE</span>
              </div>

              {/* VISA */}
              <div className="px-3 py-1.5 rounded-lg bg-white text-[#1a1f71] font-black text-xs italic tracking-wider shadow-xs border border-white" title="Visa">
                VISA
              </div>

              {/* MasterCard */}
              <div className="px-2.5 py-1.5 rounded-lg bg-[#252525] text-white font-bold text-xs flex items-center gap-1 shadow-xs border border-white/20" title="Mastercard">
                <div className="flex -space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#eb001b] inline-block opacity-90"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-[#f79e1b] inline-block opacity-90"></span>
                </div>
                <span className="text-[10px] tracking-tight">Mastercard</span>
              </div>

              {/* Apple Pay */}
              <div className="px-2.5 py-1.5 rounded-lg bg-black text-white font-semibold text-xs flex items-center gap-1 shadow-xs border border-white/20" title="Apple Pay">
                <svg className="w-3.5 h-3.5" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.96-14.42-6.52-10.12-11.66-21.5-15.41-34.14-3.75-12.63-5.63-24.32-5.63-35.08 0-14.79 3.65-26.79 10.96-36 7.3-9.22 16.52-13.9 27.65-14.04 4.58 0 9.87 1.25 15.86 3.75 5.99 2.5 9.77 3.82 11.34 3.96 1.34-.14 5.37-1.57 12.1-4.29 6.72-2.72 12.44-3.9 17.15-3.54 12.64.67 22.84 5.45 30.6 14.33-11.07 6.74-16.48 16-16.23 27.79.25 9.38 3.84 17.18 10.77 23.41 6.93 6.23 15.17 9.84 24.71 10.84-2.12 6.53-4.76 13.55-7.91 21.08zM119.22 33.15c0-7.39 2.66-14.41 7.98-21.07 5.32-6.66 11.98-10.98 19.98-12.98.53 1.07.8 2.24.8 3.52 0 7.39-2.73 14.38-8.19 20.97-5.46 6.59-12.28 10.74-20.47 12.45-.07-.94-.1-1.9-.1-2.89z"/>
                </svg>
                <span className="text-[10px]">Pay</span>
              </div>

              {/* Google Pay */}
              <div className="px-2.5 py-1.5 rounded-lg bg-white text-[#3c4043] font-bold text-xs flex items-center gap-1 shadow-xs border border-white" title="Google Pay">
                <span className="text-blue-500 font-extrabold text-[13px] leading-none">G</span>
                <span className="text-[10px] text-gray-700">Pay</span>
              </div>

              {/* Wave (Mobile Money) */}
              <div className="px-2.5 py-1.5 rounded-lg bg-[#1da1f2] text-white font-extrabold text-xs flex items-center gap-1 shadow-xs border border-[#1a8cd8]" title="Wave Mobile Money">
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                <span className="tracking-wide">wave</span>
              </div>

              {/* Orange Money */}
              <div className="px-2.5 py-1.5 rounded-lg bg-[#ff6600] text-white font-extrabold text-xs flex items-center gap-1 shadow-xs border border-[#e65c00]" title="Orange Money">
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                <span className="tracking-wide">orange money</span>
              </div>

              {/* SSL 256-Bit */}
              <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#deb8a0] text-[10px] font-semibold flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#967769] gap-4">
          <p>© 2026 Dibor &amp; Gnilane Food — La Celle-Saint-Cloud. Tous droits réservés.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="hover:text-white cursor-pointer transition-colors">Mentions légales</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">Conditions Générales de Vente (CGV)</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">Protection des données (RGPD)</span>
            <span>·</span>
            <span className="hover:text-white cursor-pointer transition-colors">Charte Allergènes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
