import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Product, ProductCategory, PlaceOption } from '../types/index.ts';
import { PLACES } from '../data/initialCatalog.ts';
import { formatEuro, formatDateFrench, formatShortDay, getUpcomingDays } from '../utils/format.ts';
import { DishModal } from '../components/menu/DishModal.tsx';
import {
  MapPin,
  Clock,
  Calendar,
  Check,
  Info,
  Flame,
  AlertTriangle,
  ArrowRight,
  Utensils,
  HeartHandshake,
  UserCheck,
  Bike,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';

interface ClientViewProps {
  onOpenCart: () => void;
  onNavigateToCatering: () => void;
  onNavigateToCheckout: () => void;
  onOpenAuth?: () => void;
  onNavigateToTracking?: (orderId?: string) => void;
}


interface SlotState {
  time: string;
  used: number;
  cap: number;
  remaining: number;
  available: boolean;
}

export const ClientView: React.FC<ClientViewProps> = ({
  onOpenCart,
  onNavigateToCatering,
  onNavigateToCheckout,
  onOpenAuth,
  onNavigateToTracking
}) => {
  const { currentUser } = useAuth();
  const {
    selectedPlace,
    setSelectedPlace,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    addToCart,
    cartCount,
    total
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [offMap, setOffMap] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('plats');
  const [slots, setSlots] = useState<SlotState[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Dropdown list quick-order state
  const [dropdownProductId, setDropdownProductId] = useState<string>('');
  const [dropdownQty, setDropdownQty] = useState<number>(1);
  const [dropdownOption, setDropdownOption] = useState<string>('Piment doux / séparé');

  const upcomingDays = getUpcomingDays(7);

  // Categories list
  const categories: { id: ProductCategory; name: string }[] = [
    { id: 'plats', name: 'Plats Authentiques' },
    { id: 'formules', name: 'Formules Déjeuner' },
    { id: 'scolaire', name: 'Pause Scolaire' },
    { id: 'snacks', name: 'Snacks & Pastels' },
    { id: 'boissons', name: 'Boissons Artisanales' },
    { id: 'desserts', name: 'Desserts Africains' }
  ];

  // Fetch products and stock
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const prods = data.products || [];
        setProducts(prods);
        setStockMap(data.stock || {});
        setOffMap(data.off || {});
        if (prods.length > 0) {
          setDropdownProductId(prev => prev || prods[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch slots for selected date and place
  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`/api/slots?date=${selectedDate}&place=${selectedPlace.id}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.slots || []);
        // Reset selected time if not available
        if (selectedTime) {
          const slot = data.slots.find((s: SlotState) => s.time === selectedTime);
          if (!slot || !slot.available) {
            setSelectedTime(null);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, selectedPlace]);

  // Check if product is available for selected date
  const isProductAvailable = (p: Product) => {
    if (offMap[p.id]) return { ok: false, reason: 'Momentanément indisponible' };

    // Check specific day
    if (Array.isArray(p.days)) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay();
      if (!p.days.includes(dayOfWeek)) {
        const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        return { ok: false, reason: `Plat du jour (${p.days.map(d => dayNames[d]).join(', ')})` };
      }
    }

    // Check pre-order requirement
    const today = new Date().toISOString().split('T')[0];
    if (p.preco && selectedDate === today) {
      return { ok: false, reason: 'Sur précommande (la veille)' };
    }

    // Check stock
    const deps = p.uses || (stockMap[p.id] !== undefined ? [p.id] : []);
    for (const dep of deps) {
      if (stockMap[dep] !== undefined && stockMap[dep] <= 0) {
        return { ok: false, reason: 'Épuisé pour ce jour' };
      }
    }

    return { ok: true };
  };

  const handleAddConfirmed = (
    product: Product,
    options: string[],
    quantity: number,
    customUses?: Record<string, number>,
    customPrice?: number,
    allergens?: string[]
  ) => {
    addToCart(product, options, quantity, customUses, customPrice, allergens);
    setAddedToast(`${quantity}× ${product.name} ajouté au panier`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'scolaire') return p.cat === 'scolaire';
    return p.cat === activeCategory;
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Toast notification */}
      {addedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2e1810] text-[#f7ece1] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#e3a72f]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-[#e3a72f]" />
          <span className="text-xs font-semibold">{addedToast}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-[#2e1810] text-[#faf7f3] overflow-hidden">
        <div className="absolute inset-0 opacity-35 mix-blend-overlay pointer-events-none">
          <img
            src="/src/assets/images/hero_african_feast_1794320926518.jpg"
            alt="Festin africain Dibor & Gnilane"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 mb-4 shadow-sm">
              <img
                src="/assets/aistudio/image_b012f474.png"
                alt="Logo Dibor & Gnilane"
                className="w-11 h-11 sm:w-13 sm:h-13 object-contain rounded-xl bg-white p-1 shadow-xs"
              />
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#e3a72f] block leading-tight">
                  Dibor &amp; Gnilane Food
                </span>
                <span className="text-[11px] text-[#f7ece1] block">
                  Restaurant &amp; Traiteur Sénégalais · 2G av. des Étangs, La Celle-Saint-Cloud
                </span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.08] text-white tracking-tight">
              Le goût de l’Afrique, <br />
              <span className="text-[#e3a72f]">livré à l’heure.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#deb8a0] leading-relaxed">
              Recettes ancestrales cuisinées chaque matin avec des ingrédients frais. Poulet mariné au citron vert, sauces arachides fondantes et beignets dorés.
            </p>

            {/* 3 Trust Markers */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-[#ebd7c8]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1f6b42]" />
                <span className="font-semibold">Viandes 100% Halal certifiées</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e3a72f]" />
                <span className="font-semibold">Fait maison &amp; produits frais</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d4652a]" />
                <span className="font-semibold">Livraison respectant la chaîne du chaud</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Quick Top Access Banners: Identification & Delivery Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Card 1: Customer Identification & Loyalty status */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded1] shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-[#d4652a]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#2e1810]">
                    {currentUser ? `Bonjour, ${currentUser.name}` : 'Espace Client Teranga'}
                  </span>
                  {currentUser?.loyaltyPoints ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e3a72f]/20 text-[#8c5912]">
                      {currentUser.loyaltyPoints} pts
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-[#8c6b5d] mt-0.5">
                  {currentUser
                    ? `${formatEuro(currentUser.loyaltyPoints * 0.1)} de remise disponible sur vos commandes.`
                    : 'Identifiez-vous pour cumuler vos points ou créer un compte (+20 pts).'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl bg-[#2e1810] hover:bg-[#432317] text-[#f7ece1] text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer"
            >
              {currentUser ? 'Changer de compte' : "S'identifier"}
            </button>
          </div>

          {/* Card 2: Real-time Delivery Tracking Banner */}
          <div className="bg-gradient-to-r from-[#fdfaf6] to-[#f8f1e7] rounded-2xl p-4 sm:p-5 border border-[#e8ded1] shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <Bike className="w-5 h-5 text-emerald-600 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-sm text-[#2e1810] block">
                  Suivre ma commande en direct
                </span>
                <p className="text-xs text-[#8c6b5d] mt-0.5">
                  Cuisine, départ du livreur et code secret de remise à 4 chiffres.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTracking && onNavigateToTracking()}
              className="px-3.5 py-2 rounded-xl bg-[#1f6b42] hover:bg-[#185534] text-white text-xs font-bold shrink-0 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Suivre</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Ordering Stepper & Menu */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Mode de remise */}
            <section className="bg-white rounded-2xl p-6 border border-[#e8ded1] shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#d4652a] text-white text-xs font-bold font-display flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-bold font-display text-[#2e1810]">
                  Où récupérer votre repas ?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLACES.map((place: PlaceOption) => {
                  const isSelected = selectedPlace.id === place.id;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#2e1810] bg-[#2e1810] text-white shadow-md'
                          : 'border-[#e8ded1] bg-[#faf7f3] hover:border-[#d4652a]/40 text-[#5c3e34]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#2e1810]'}`}>
                            {place.name}
                          </span>
                          {place.fee === 0 ? (
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-white/20 text-[#e3a72f]' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              Offert
                            </span>
                          ) : (
                            <span className={`text-xs font-bold tabular-nums ${
                              isSelected ? 'text-[#e3a72f]' : 'text-[#b8462e]'
                            }`}>
                              +{formatEuro(place.fee)}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs leading-snug ${isSelected ? 'text-white/80' : 'text-[#8c6b5d]'}`}>
                          {place.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Date & Créneau horaire */}
            <section className="bg-white rounded-2xl p-6 border border-[#e8ded1] shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-full bg-[#d4652a] text-white text-xs font-bold font-display flex items-center justify-center">
                  2
                </span>
                <div className="flex-1 flex items-baseline justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-bold font-display text-[#2e1810]">
                    Quel jour et à quelle heure ?
                  </h2>
                  <span className="text-xs text-[#8c6b5d]">
                    Capacité max. : 15 commandes par créneau
                  </span>
                </div>
              </div>

              {/* Day selection */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
                {upcomingDays.map((dateStr: string) => {
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedDate(dateStr)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'border-[#d4652a] bg-[#d4652a] text-white shadow-sm'
                          : 'border-[#e8ded1] bg-[#faf7f3] text-[#5c3e34] hover:bg-white'
                      }`}
                    >
                      {formatShortDay(dateStr)}
                    </button>
                  );
                })}
              </div>

              {/* Slots grid */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#8c6b5d] block mb-2">
                  Créneaux disponibles le {formatDateFrench(selectedDate)}
                </label>
                {isLoadingSlots ? (
                  <div className="py-6 text-center text-xs text-[#8c6b5d]">
                    Chargement des créneaux en direct...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {slots.map((slot: SlotState) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'border-[#2e1810] bg-[#2e1810] text-white shadow-sm'
                              : slot.available
                              ? 'border-[#e8ded1] bg-[#faf7f3] hover:border-[#d4652a] text-[#2e1810]'
                              : 'border-[#ede2d6] bg-[#f5ede4] text-[#b39b8e] cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span className="block text-sm font-bold font-display tabular-nums">
                            {slot.time}
                          </span>
                          <span className={`block text-[10px] mt-0.5 truncate ${
                            isSelected
                              ? 'text-[#e3a72f]'
                              : slot.available
                              ? 'text-[#1f6b42]'
                              : 'text-red-600'
                          }`}>
                            {slot.available ? `${slot.remaining} place${slot.remaining > 1 ? 's' : ''}` : 'Complet'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-[11px] text-[#8c6b5d] mt-3">
                  {selectedPlace.school
                    ? 'Pour les écoles et entreprises, les commandes sont préparées pour le service de 12:00. Clôture la veille à 20h.'
                    : 'Les réservations de créneaux sont limitées pour garantir la fraîcheur et la ponctualité de chaque commande.'}
                </p>
              </div>
            </section>

            {/* Step 3: Menu Categories & Dishes */}
            <section id="menu-section">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#d4652a] text-white text-xs font-bold font-display flex items-center justify-center">
                    3
                  </span>
                  <h2 className="text-xl font-bold font-display text-[#2e1810]">
                    La Carte &amp; Spécialités
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToCatering}
                  className="text-xs font-bold text-[#d4652a] hover:text-[#b8462e] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Grand groupe (20+ personnes) ? Demander un devis</span>
                </button>
              </div>

              {/* Quick Dropdown Order Box (Commander avec liste déroulante) */}
              <div id="quick-dropdown-order" className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#e3a72f]/50 shadow-xs mb-6 scroll-mt-24">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#f0e8df]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#e3a72f]/20 text-[#8c5912] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#d4652a]" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-[#2e1810]">
                        Commander par liste déroulante
                      </h3>
                      <p className="text-xs text-[#8c6b5d]">
                        Sélectionnez directement votre plat parmi tous les mets disponibles au menu
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                    Choix express ⚡
                  </span>
                </div>

                {/* Dropdown Select Element */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="dish-dropdown" className="block text-xs font-bold uppercase tracking-wider text-[#735144] mb-1.5">
                      Choisir un plat ou une formule dans la liste :
                    </label>
                    <select
                      id="dish-dropdown"
                      value={dropdownProductId}
                      onChange={(e) => {
                        setDropdownProductId(e.target.value);
                        setDropdownQty(1);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-[#d4652a]/40 bg-[#faf7f3] text-sm font-semibold text-[#2e1810] focus:ring-2 focus:ring-[#d4652a] focus:outline-none cursor-pointer shadow-2xs"
                    >
                      {categories.map(cat => {
                        const catProducts = products.filter(p => p.cat === cat.id);
                        if (catProducts.length === 0) return null;
                        return (
                          <optgroup key={cat.id} label={`— ${cat.name} —`}>
                            {catProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({formatEuro(p.price)})
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                  </div>

                  {/* Selected Dish Interactive Card Preview */}
                  {(() => {
                    const selectedProd = products.find(p => p.id === dropdownProductId) || products[0];
                    if (!selectedProd) return null;
                    const availability = isProductAvailable(selectedProd);

                    return (
                      <div className="p-4 rounded-xl bg-[#faf7f3] border border-[#ede2d6] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {selectedProd.image ? (
                              <img
                                src={selectedProd.image}
                                alt={selectedProd.name}
                                className="w-16 h-16 rounded-xl object-cover border border-[#e8ded1] shrink-0"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-[#f0e8df] flex items-center justify-center text-xs font-bold text-[#8c6b5d] shrink-0">
                                Plat
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-base text-[#2e1810]">
                                  {selectedProd.name}
                                </h4>
                                {selectedProd.veg && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    Veg
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#735144] line-clamp-1 mt-0.5">
                                {selectedProd.desc}
                              </p>
                              {selectedProd.al && selectedProd.al.length > 0 && (
                                <p className="text-[10px] text-amber-800 mt-0.5">
                                  Allergènes : {selectedProd.al.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right sm:text-right shrink-0">
                            <span className="text-xs text-[#8c6b5d] block">Prix unitaire</span>
                            <span className="font-display text-lg font-black text-[#b8462e] tabular-nums">
                              {formatEuro(selectedProd.price)}
                            </span>
                          </div>
                        </div>

                        {/* Customization controls for dropdown item */}
                        <div className="pt-3 border-t border-[#ebd7c5] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* Option select */}
                          <div className="sm:col-span-5">
                            <label className="text-[11px] font-bold text-[#735144] block mb-1">
                              Option de piment / assaisonnement :
                            </label>
                            <select
                              value={dropdownOption}
                              onChange={(e) => setDropdownOption(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-[#e8ded1] bg-white text-xs font-medium text-[#2e1810]"
                            >
                              <option value="Piment doux / séparé">Piment doux / sauce séparée</option>
                              <option value="Sans piment">Sans piment (Doux pour tous)</option>
                              <option value="Très pimenté (Sauce Kaani)">Très pimenté (Sauce Kaani)</option>
                              <option value="Sauce supplémentaire (+1€)">Sauce supplémentaire (+1,00 €)</option>
                            </select>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="sm:col-span-3 flex items-center justify-start sm:justify-center gap-2">
                            <span className="text-[11px] font-bold text-[#735144]">Quantité :</span>
                            <div className="flex items-center rounded-lg border border-[#e8ded1] bg-white overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => setDropdownQty(Math.max(1, dropdownQty - 1))}
                                className="px-2.5 py-1 text-xs hover:bg-[#faf7f3] text-[#735144] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-bold tabular-nums text-[#2e1810]">
                                {dropdownQty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setDropdownQty(dropdownQty + 1)}
                                className="px-2.5 py-1 text-xs hover:bg-[#faf7f3] text-[#735144] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* CTA Add to Cart */}
                          <div className="sm:col-span-4">
                            {availability.ok ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const extraPrice = dropdownOption.includes('+1€') ? 1 : 0;
                                  const unit = selectedProd.price + extraPrice;
                                  addToCart(
                                    selectedProd,
                                    dropdownOption ? [dropdownOption] : [],
                                    dropdownQty,
                                    undefined,
                                    unit
                                  );
                                  setAddedToast(`${dropdownQty}× ${selectedProd.name} ajouté au panier`);
                                  setTimeout(() => setAddedToast(null), 3000);
                                }}
                                className="w-full py-2.5 px-4 rounded-xl bg-[#d4652a] hover:bg-[#b8462e] text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Ajouter · {formatEuro((selectedProd.price + (dropdownOption.includes('+1€') ? 1 : 0)) * dropdownQty)}</span>
                              </button>
                            ) : (
                              <div className="text-center py-2 px-3 rounded-xl bg-[#f0e8df] text-xs font-medium text-[#8c6b5d] italic">
                                {availability.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 no-scrollbar">
                {categories.map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-[#e3a72f] text-[#2e1810] shadow-sm'
                          : 'bg-white border border-[#e8ded1] text-[#735144] hover:bg-[#faf7f3]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* School banner if in school category */}
              {activeCategory === 'scolaire' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-6 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Formules Pause Scolaire :</span>{' '}
                    Portions ajustées au format déjeuner d'école ou d'entreprise. Précommandes à valider la veille avant 20h. Livraison groupée offerte à partir de 10 repas au même point.
                  </div>
                </div>
              )}

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => {
                  const availability = isProductAvailable(product);
                  const stockRemaining = stockMap[product.id];

                  return (
                    <article
                      key={product.id}
                      className="bg-white rounded-2xl border border-[#e8ded1] overflow-hidden flex flex-col justify-between hover:border-[#d4652a]/40 hover:shadow-md transition-all group"
                    >
                      {product.image && (
                        <div className="relative h-44 overflow-hidden bg-[#f3ece4]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                            {product.veg && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                                Végétarien
                              </span>
                            )}
                            {product.preco && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                                Précommande
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold font-display text-base text-[#2e1810] leading-snug">
                              {product.name}
                            </h3>
                            <span className="text-sm font-extrabold text-[#b8462e] tabular-nums shrink-0">
                              {formatEuro(product.price)}
                            </span>
                          </div>

                          <p className="text-xs text-[#735144] line-clamp-2 leading-relaxed">
                            {product.desc}
                          </p>

                          {/* Allergens warning badge */}
                          {product.al && product.al.length > 0 && (
                            <div className="mt-2 text-[11px] text-amber-800">
                              <span className="font-medium">Allergènes :</span> {product.al.join(', ')}
                            </div>
                          )}

                          {availability.ok && stockRemaining !== undefined && stockRemaining <= 5 && (
                            <div className="mt-2 text-[11px] font-semibold text-red-600 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Plus que {stockRemaining} portion{stockRemaining > 1 ? 's' : ''} disponible{stockRemaining > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#f0e8df] flex items-center justify-between">
                          <span className="text-xs text-[#8c6b5d]">
                            Prix net TTC
                          </span>
                          {availability.ok ? (
                            <button
                              type="button"
                              onClick={() => setActiveModalProduct(product)}
                              className="px-4 py-2 rounded-xl bg-[#d4652a] hover:bg-[#b8462e] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                            >
                              Ajouter
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-[#8c6b5d] italic">
                              {availability.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Cart Sidebar on Desktop */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#e8ded1] p-6 shadow-xs">
              <h3 className="text-lg font-bold font-display text-[#2e1810] mb-4">
                Récapitulatif de commande
              </h3>

              <div className="space-y-3 mb-6 text-xs text-[#5c3e34]">
                <div className="p-3 rounded-xl bg-[#faf7f3] border border-[#ede2d6] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2e1810] font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[#d4652a]" />
                    <span>{selectedPlace.name}</span>
                  </div>
                  <p className="text-[11px] text-[#8c6b5d] pl-5">{selectedPlace.sub}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#faf7f3] border border-[#ede2d6] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2e1810] font-bold">
                    <Calendar className="w-3.5 h-3.5 text-[#e3a72f]" />
                    <span>{formatDateFrench(selectedDate)}</span>
                  </div>
                  <p className="text-[11px] text-[#8c6b5d] pl-5">
                    Créneau horaire : <strong className="text-[#2e1810]">{selectedTime || 'À choisir à l’étape 2'}</strong>
                  </p>
                </div>
              </div>

              <div className="border-t border-[#f0e8df] pt-4 space-y-2 text-xs text-[#5c3e34] tabular-nums">
                <div className="flex justify-between">
                  <span>Repas au panier ({cartCount})</span>
                  <span className="font-semibold">{formatEuro(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de service / remise</span>
                  <span>{selectedPlace.addr ? formatEuro(selectedPlace.fee) : 'Offert'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCart}
                className="w-full mt-6 py-3 px-4 rounded-xl bg-[#2e1810] hover:bg-[#432317] text-[#f7ece1] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Voir mon panier ({cartCount})</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e3a72f]" />
              </button>

              <div className="mt-4 pt-4 border-t border-[#f0e8df] text-[11px] text-[#8c6b5d] text-center">
                Paiement sécurisé par carte bancaire, Apple Pay ou Wave lors de la validation.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Cart Bar (Sticky Bottom Cap <= 15%) */}
      {cartCount > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40">
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#2e1810] text-white shadow-2xl flex items-center justify-between border border-[#e3a72f]/40 active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#d4652a] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
              <span className="text-xs font-bold">Voir mon panier</span>
            </div>
            <div className="flex items-center gap-2 font-display text-base text-[#e3a72f] tabular-nums">
              <span>{formatEuro(total)}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Modal for product customization */}
      {activeModalProduct && (
        <DishModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onConfirm={handleAddConfirmed}
        />
      )}
    </div>
  );
};
