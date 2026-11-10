import React, { useState, useEffect } from 'react';
import { Order } from '../types/index.ts';
import { formatShortDay } from '../utils/format.ts';
import { PLACES } from '../data/initialCatalog.ts';
import { ChefHat, Clock, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export const KitchenView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchKitchenOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        // Kitchen cares about active orders
        const active = (data.orders || []).filter((o: Order) =>
          ['confirmee', 'preparation', 'prete'].includes(o.status)
        );
        // Sort chronologically by date and time
        active.sort((a: Order, b: Order) => (a.date + a.time).localeCompare(b.date + b.time));
        setOrders(active);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 10000); // Polling every 10s for kitchen
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, operator: 'Cheikh Sarr (Chef Cuisine)' })
      });
      if (res.ok) {
        setToastMessage(`Commande ${orderId} passée à : ${newStatus}`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchKitchenOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toPrepare = orders.filter(o => o.status === 'confirmee');
  const inPreparation = orders.filter(o => o.status === 'preparation');
  const ready = orders.filter(o => o.status === 'prete');

  const renderOrderCard = (order: Order, actionButton: React.ReactNode) => {
    const place = PLACES.find(p => p.id === order.place);
    const allergens = Array.from(new Set(order.lines.flatMap(l => l.al || [])));

    return (
      <article
        key={order.id}
        className="bg-white rounded-2xl p-4 border border-[#e8ded1] shadow-xs space-y-3 flex flex-col justify-between transition-all"
      >
        <div className="space-y-2">
          <div className="flex justify-between items-baseline gap-2">
            <span className="font-display font-extrabold text-lg text-[#2e1810]">
              {order.id}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#faf7f3] text-[#d4652a] border border-[#ede2d6] tabular-nums">
              {order.time}
            </span>
          </div>

          <div className="text-[11px] text-[#8c6b5d]">
            {formatShortDay(order.date)} · {place?.name} {order.example && '· (Démo)'}
          </div>

          {/* Dishes list */}
          <ul className="divide-y divide-[#f5ede4] text-xs">
            {order.lines.map((l, i) => (
              <li key={i} className="py-1.5 flex items-start gap-2">
                <span className="font-extrabold font-display text-sm text-[#b8462e] tabular-nums shrink-0">
                  {l.qty}×
                </span>
                <div className="leading-snug">
                  <span className="font-bold text-[#2e1810]">{l.name}</span>
                  {l.opts.length > 0 && (
                    <span className="text-[11px] text-[#735144] block font-medium">
                      {l.opts.join(', ')}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Allergens warning */}
          {allergens.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1">
              {allergens.map((al, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200"
                >
                  Allergène : {al}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-[#f0e8df] flex justify-end">
          {actionButton}
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2e1810] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#e3a72f]/40 animate-in fade-in duration-200 text-xs font-semibold">
          <Check className="w-4 h-4 text-[#e3a72f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8ded1]">
          <div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-[#d4652a]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2e1810]">
                Écran Cuisine (KDS)
              </h1>
            </div>
            <p className="text-xs text-[#735144] mt-1">
              File de préparation chronologique. Affiche les plats, options d’assaisonnement et restrictions d’allergènes.
            </p>
          </div>

          <button
            onClick={fetchKitchenOrders}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e8ded1] text-xs font-bold text-[#5c3e34] hover:bg-[#faf7f3] transition-colors flex items-center gap-1.5 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* 3 Columns: À préparer / En préparation / Prêtes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: À préparer */}
          <div className="space-y-4">
            <div className="p-3 bg-[#faf7f3] rounded-xl border border-[#ede2d6] flex justify-between items-center">
              <span className="font-bold font-display text-sm text-[#2e1810]">
                À préparer
              </span>
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                {toPrepare.length}
              </span>
            </div>

            <div className="space-y-3">
              {toPrepare.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8c6b5d] border border-dashed border-[#e8ded1] rounded-2xl">
                  Aucune commande en attente.
                </div>
              ) : (
                toPrepare.map(o =>
                  renderOrderCard(
                    o,
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'preparation')}
                      className="w-full py-2 px-3 rounded-xl bg-[#d4652a] text-white text-xs font-bold hover:bg-[#b8462e] transition-colors"
                    >
                      Commencer préparation
                    </button>
                  )
                )
              )}
            </div>
          </div>

          {/* Column 2: En préparation */}
          <div className="space-y-4">
            <div className="p-3 bg-[#fdf8f4] rounded-xl border border-[#ede2d6] flex justify-between items-center">
              <span className="font-bold font-display text-sm text-[#2e1810]">
                En cours de cuisson
              </span>
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-900 text-xs font-bold flex items-center justify-center">
                {inPreparation.length}
              </span>
            </div>

            <div className="space-y-3">
              {inPreparation.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8c6b5d] border border-dashed border-[#e8ded1] rounded-2xl">
                  Rien en cours.
                </div>
              ) : (
                inPreparation.map(o =>
                  renderOrderCard(
                    o,
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'prete')}
                      className="w-full py-2 px-3 rounded-xl bg-[#1f6b42] text-white text-xs font-bold hover:bg-[#185333] transition-colors"
                    >
                      Marquer prête à servir
                    </button>
                  )
                )
              )}
            </div>
          </div>

          {/* Column 3: Prêtes */}
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex justify-between items-center">
              <span className="font-bold font-display text-sm text-emerald-950">
                Prêtes à partir
              </span>
              <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center">
                {ready.length}
              </span>
            </div>

            <div className="space-y-3">
              {ready.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8c6b5d] border border-dashed border-[#e8ded1] rounded-2xl">
                  Aucune commande prête en attente.
                </div>
              ) : (
                ready.map(o =>
                  renderOrderCard(
                    o,
                    <span className="text-xs font-bold text-emerald-700">
                      En attente du livreur / client
                    </span>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
