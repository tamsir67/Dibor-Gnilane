import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types/index.ts';
import { formatEuro, formatDateFrench } from '../utils/format.ts';
import { PLACES } from '../data/initialCatalog.ts';
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  ArrowRight,
  ChefHat,
  PackageCheck,
  Navigation
} from 'lucide-react';

interface DeliveryTrackingViewProps {
  initialOrderId?: string;
  onNavigateToMenu: () => void;
}

export const DeliveryTrackingView: React.FC<DeliveryTrackingViewProps> = ({
  initialOrderId,
  onNavigateToMenu
}) => {
  const [searchId, setSearchId] = useState(initialOrderId || 'DG-1042');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [allRecentOrders, setAllRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchOrders = async (targetId?: string) => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const orders: Order[] = data.orders || [];
        setAllRecentOrders(orders);

        const idToFind = (targetId || searchId).trim().toUpperCase();
        const matched = orders.find(o => o.id.toUpperCase() === idToFind);

        if (matched) {
          setCurrentOrder(matched);
        } else if (orders.length > 0) {
          setCurrentOrder(orders[0]);
          setSearchId(orders[0].id);
        } else {
          setNotFound(true);
        }
      }
    } catch (e) {
      console.error(e);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(initialOrderId);
    const interval = setInterval(() => {
      fetchOrders(searchId);
    }, 8000); // Live poll updates every 8s
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchId);
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'confirmee':
        return 1;
      case 'preparation':
        return 2;
      case 'prete':
        return 3;
      case 'livraison':
      case 'incident':
        return 4;
      case 'livree':
        return 5;
      case 'annulee':
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = currentOrder ? getStepProgress(currentOrder.status) : 1;
  const placeInfo = currentOrder ? PLACES.find(p => p.id === currentOrder.place) : null;

  return (
    <div className="min-h-screen pb-24 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Suivi de commande &amp; Géolocalisation en direct</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-[#2e1810]">
            Où en est mon repas ?
          </h1>
          <p className="text-sm text-[#735144] max-w-lg mx-auto">
            Suivez la préparation en cuisine et la progression du livreur avec votre code secret de remise.
          </p>

          {/* Search bar for Order ID */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value.toUpperCase())}
                placeholder="Ex: DG-1042"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e8ded1] bg-white font-mono text-xs uppercase font-bold text-[#2e1810] focus:ring-2 focus:ring-[#d4652a] focus:outline-none shadow-xs"
              />
              <Search className="w-4 h-4 text-[#8c6b5d] absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2e1810] text-white text-xs font-bold hover:bg-[#432317] transition-all shadow-xs"
            >
              Suivre
            </button>
          </form>

          {/* Quick select from recent orders */}
          {allRecentOrders.length > 0 && (
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-[#8c6b5d] pt-2">
              <span>Commandes récentes :</span>
              {allRecentOrders.slice(0, 4).map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setSearchId(o.id);
                    fetchOrders(o.id);
                  }}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold border ${
                    currentOrder?.id === o.id
                      ? 'bg-[#d4652a] text-white border-[#d4652a]'
                      : 'bg-white text-[#5c3e34] border-[#e8ded1] hover:bg-[#faf7f3]'
                  }`}
                >
                  {o.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {notFound ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#e8ded1] shadow-xs space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-[#2e1810]">Commande non trouvée</h3>
            <p className="text-xs text-[#735144]">
              Vérifiez le numéro de commande saisi (Exemple : DG-1042) ou passez une commande sur la carte.
            </p>
            <button
              onClick={onNavigateToMenu}
              className="mt-3 px-5 py-2 rounded-xl bg-[#d4652a] text-white font-bold text-xs"
            >
              Commander maintenant
            </button>
          </div>
        ) : currentOrder ? (
          <div className="space-y-6">
            {/* Live Status Hero Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0e8df]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl font-black text-[#2e1810]">
                      Commande {currentOrder.id}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#faf7f3] text-[#d4652a] border border-[#ede2d6]">
                      {currentOrder.place === 'domicile' ? 'Livraison à domicile' : 'Retrait au restaurant'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8c6b5d] mt-1">
                    Prévue pour le {formatDateFrench(currentOrder.date)} à <strong className="text-[#2e1810]">{currentOrder.time}</strong>
                  </p>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-[11px] text-[#8c6b5d] block">Total réglé</span>
                  <span className="font-display text-xl font-extrabold text-[#b8462e] tabular-nums">
                    {formatEuro(currentOrder.total)}
                  </span>
                </div>
              </div>

              {/* Progress Stepper (5 steps) with responsive scaling */}
              <div className="py-2">
                <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center relative">
                  {/* Step 1: Confirmée */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep >= 1 ? 'bg-[#1f6b42] text-white shadow-xs' : 'bg-[#f0e8df] text-[#8c6b5d]'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="block text-[10px] sm:text-[11px] font-bold text-[#2e1810] leading-tight truncate">
                      Confirmée
                    </span>
                    <span className="hidden sm:block text-[10px] text-[#8c6b5d]">Paiement OK</span>
                  </div>

                  {/* Step 2: En Cuisine */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep >= 2 ? 'bg-[#d4652a] text-white shadow-xs animate-pulse' : 'bg-[#f0e8df] text-[#8c6b5d]'
                    }`}>
                      <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="block text-[10px] sm:text-[11px] font-bold text-[#2e1810] leading-tight truncate">
                      En cuisine
                    </span>
                    <span className="hidden sm:block text-[10px] text-[#8c6b5d]">Mijotage</span>
                  </div>

                  {/* Step 3: Prête */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep >= 3 ? 'bg-[#e3a72f] text-[#2e1810] shadow-xs' : 'bg-[#f0e8df] text-[#8c6b5d]'
                    }`}>
                      <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="block text-[10px] sm:text-[11px] font-bold text-[#2e1810] leading-tight truncate">
                      Prête
                    </span>
                    <span className="hidden sm:block text-[10px] text-[#8c6b5d]">Sous cloche</span>
                  </div>

                  {/* Step 4: En livraison */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep >= 4 ? 'bg-[#1da1f2] text-white shadow-xs animate-bounce' : 'bg-[#f0e8df] text-[#8c6b5d]'
                    }`}>
                      <Bike className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="block text-[10px] sm:text-[11px] font-bold text-[#2e1810] leading-tight truncate">
                      En route
                    </span>
                    <span className="hidden sm:block text-[10px] text-[#8c6b5d]">Livreur</span>
                  </div>

                  {/* Step 5: Livrée */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep >= 5 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[#f0e8df] text-[#8c6b5d]'
                    }`}>
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="block text-[10px] sm:text-[11px] font-bold text-[#2e1810] leading-tight truncate">
                      Remise
                    </span>
                    <span className="hidden sm:block text-[10px] text-[#8c6b5d]">Dégustation</span>
                  </div>
                </div>
              </div>

              {/* Secret 4-digit code reminder card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#fdfaf6] to-[#f7eee3] border-2 border-dashed border-[#e3a72f] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1 border border-[#e8ded1] flex items-center justify-center shadow-xs">
                    <QrCode className="w-8 h-8 text-[#2e1810]" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-[#8c6b5d] block">
                      Code secret à donner au livreur ou au comptoir
                    </span>
                    <span className="font-display text-4xl font-black tracking-widest text-[#b8462e] tabular-nums">
                      {currentOrder.code}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:text-right text-xs text-[#735144] max-w-xs">
                  <p>
                    Ce code garantit que personne d’autre ne peut récupérer votre commande à votre place.
                  </p>
                </div>
              </div>

              {/* Incident Alert if any */}
              {currentOrder.incident && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sm font-bold text-amber-900">
                      Message du livreur / Suivi trafic
                    </strong>
                    <p className="mt-0.5 leading-relaxed">{currentOrder.incident}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Courier & Route Simulation Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Courier info */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-4">
                <h3 className="font-display font-bold text-base text-[#2e1810] flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#d4652a]" />
                  <span>Détails du transport</span>
                </h3>

                <div className="space-y-3 text-xs text-[#5c3e34]">
                  <div className="flex items-start gap-3 p-3 bg-[#faf7f3] rounded-xl border border-[#ede2d6]">
                    <Bike className="w-5 h-5 text-[#1f6b42] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#2e1810] block">Coursier assigné : Fatou Sow</span>
                      <span className="text-[#8c6b5d]">Moto équipée d’un caisson isotherme certifié chaud 65°C.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#faf7f3] rounded-xl border border-[#ede2d6]">
                    <MapPin className="w-5 h-5 text-[#d4652a] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#2e1810] block">Destination</span>
                      <span className="text-[#735144]">
                        {currentOrder.addr || 'Retrait au restaurant 2G avenue des Étangs, La Celle-Saint-Cloud'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#faf7f3] rounded-xl border border-[#ede2d6]">
                    <Phone className="w-5 h-5 text-[#e3a72f] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#2e1810] block">Destinataire</span>
                      <span className="text-[#735144]">{currentOrder.name} · {currentOrder.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order contents recap */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-4">
                <h3 className="font-display font-bold text-base text-[#2e1810] flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-[#d4652a]" />
                  <span>Mets commandés</span>
                </h3>

                <div className="divide-y divide-[#f0e8df] text-xs">
                  {currentOrder.lines.map((l, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-start">
                      <div>
                        <span className="font-bold text-[#2e1810]">{l.qty}× {l.name}</span>
                        {l.opts.length > 0 && (
                          <p className="text-[11px] text-[#8c6b5d]">{l.opts.join(' · ')}</p>
                        )}
                      </div>
                      <span className="font-semibold tabular-nums text-[#2e1810]">
                        {formatEuro(l.unit * l.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* History events */}
                <div className="pt-3 border-t border-[#f0e8df] space-y-1 text-[11px] text-[#8c6b5d]">
                  <span className="font-bold text-[#2e1810] block mb-1">Journal de la commande :</span>
                  {currentOrder.hist?.map((h, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {h.what}</span>
                      <span className="tabular-nums font-mono">
                        {new Date(h.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
