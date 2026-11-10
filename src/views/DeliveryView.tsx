import React, { useState, useEffect } from 'react';
import { Order } from '../types/index.ts';
import { formatShortDay } from '../utils/format.ts';
import { PLACES } from '../data/initialCatalog.ts';
import { Bike, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Phone, RefreshCw, KeyRound } from 'lucide-react';

export const DeliveryView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handover modal state
  const [handoverOrder, setHandoverOrder] = useState<Order | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [handoverError, setHandoverError] = useState<string | null>(null);
  const [exemptionReason, setExemptionReason] = useState('');
  const [showExemption, setShowExemption] = useState(false);

  // Incident modal state
  const [incidentOrder, setIncidentOrder] = useState<Order | null>(null);
  const [incidentType, setIncidentType] = useState('Retard de circulation');
  const [incidentEta, setIncidentEta] = useState('13:15');
  const [incidentDetails, setIncidentDetails] = useState('Embouteillage dense avenue de la Jonchère');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDeliveryOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        // Orders ready for pickup or currently in transit
        const list = (data.orders || []).filter((o: Order) =>
          ['prete', 'livraison', 'incident'].includes(o.status)
        );
        setOrders(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
    const interval = setInterval(fetchDeliveryOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'livraison', operator: 'Fatou Sow (Livreur)' })
      });
      if (res.ok) {
        setToastMessage(`Commande ${orderId} en cours de livraison`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchDeliveryOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverOrder) return;

    try {
      const res = await fetch(`/api/orders/${handoverOrder.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          operator: 'Fatou Sow (Livreur / Comptoir)'
        })
      });

      if (res.ok) {
        setToastMessage(`Remise confirmée avec succès pour ${handoverOrder.id}`);
        setHandoverOrder(null);
        setInputCode('');
        setHandoverError(null);
        fetchDeliveryOrders();
      } else {
        const data = await res.json();
        setHandoverError(data.error || 'Code invalide');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExemptionHandover = async () => {
    if (!handoverOrder || !exemptionReason || exemptionReason.trim().length < 5) {
      setHandoverError('Veuillez préciser un motif de dérogation complet (au moins 5 caractères).');
      return;
    }

    try {
      const res = await fetch(`/api/orders/${handoverOrder.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exemptionReason: exemptionReason.trim(),
          operator: 'Fatou Sow (Dérogation Livreur)'
        })
      });

      if (res.ok) {
        setToastMessage(`Remise par dérogation enregistrée pour ${handoverOrder.id}`);
        setHandoverOrder(null);
        setInputCode('');
        setExemptionReason('');
        setShowExemption(false);
        setHandoverError(null);
        fetchDeliveryOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentOrder) return;

    const incidentText = `${incidentType} · Nouvelle heure estimée : ${incidentEta} · Détail : ${incidentDetails}`;
    try {
      const res = await fetch(`/api/orders/${incidentOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'incident',
          why: incidentText,
          operator: 'Fatou Sow (Livreur)'
        })
      });

      if (res.ok) {
        setToastMessage(`Incident signalé. Client notifié de la nouvelle heure.`);
        setIncidentOrder(null);
        fetchDeliveryOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pickups = orders.filter(o => o.place === 'retrait' && o.status === 'prete');
  const toDispatch = orders.filter(o => o.place !== 'retrait' && o.status === 'prete');
  const onRoad = orders.filter(o => ['livraison', 'incident'].includes(o.status));

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#2e1810] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#e3a72f]/40 animate-in fade-in duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#e3a72f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8ded1]">
          <div>
            <div className="flex items-center gap-2">
              <Bike className="w-6 h-6 text-[#1f6b42]" />
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2e1810]">
                Espace Remise &amp; Livraison
              </h1>
            </div>
            <p className="text-xs text-[#735144] mt-1">
              Validation sécurisée par code client à 4 chiffres ou dérogation motivée. Gestion des tournées de livraison.
            </p>
          </div>

          <button
            onClick={fetchDeliveryOrders}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e8ded1] text-xs font-bold text-[#5c3e34] hover:bg-[#faf7f3] transition-colors flex items-center gap-1.5 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* 3 Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: Retraits au comptoir */}
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-[#ede2d6] flex justify-between items-center">
              <span className="font-bold font-display text-sm text-[#2e1810]">
                Retraits au comptoir ({pickups.length})
              </span>
              <span className="text-xs font-bold text-[#d4652a]">À remettre</span>
            </div>

            <div className="space-y-3">
              {pickups.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8c6b5d] border border-dashed border-[#e8ded1] rounded-2xl bg-white">
                  Aucun client en attente au restaurant.
                </div>
              ) : (
                pickups.map(o => (
                  <article key={o.id} className="bg-white p-4 rounded-2xl border border-[#e8ded1] shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-display font-bold text-base text-[#2e1810] block">{o.id}</span>
                        <span className="text-xs text-[#8c6b5d] font-semibold">{o.name} · {o.phone}</span>
                      </div>
                      <span className="text-xs font-bold text-[#d4652a] tabular-nums">{o.time}</span>
                    </div>

                    <div className="text-xs text-[#5c3e34]">
                      {o.lines.map((l, i) => (
                        <div key={i}>{l.qty}× {l.name}</div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setHandoverOrder(o);
                        setInputCode('');
                        setHandoverError(null);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#1f6b42] hover:bg-[#185333] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <KeyRound className="w-4 h-4 text-[#e3a72f]" />
                      <span>Valider la remise (Code 4 chiffres)</span>
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Prêtes pour départ livraison */}
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-[#ede2d6] flex justify-between items-center">
              <span className="font-bold font-display text-sm text-[#2e1810]">
                À prendre en charge ({toDispatch.length})
              </span>
              <span className="text-xs font-bold text-[#1f6b42]">En cuisine</span>
            </div>

            <div className="space-y-3">
              {toDispatch.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8c6b5d] border border-dashed border-[#e8ded1] rounded-2xl bg-white">
                  Aucune livraison à charger.
                </div>
              ) : (
                toDispatch.map(o => (
                  <article key={o.id} className="bg-white p-4 rounded-2xl border border-[#e8ded1] shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-display font-bold text-base text-[#2e1810] block">{o.id}</span>
                        <span className="text-xs text-[#8c6b5d]">{o.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#1f6b42] tabular-nums">{o.time}</span>
                    </div>

                    <div className="text-xs text-[#5c3e34] bg-[#faf7f3] p-2.5 rounded-xl border border-[#ede2d6] space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#2e1810]">
                        <MapPin className="w-3.5 h-3.5 text-[#d4652a]" />
                        <span>{o.addr || 'Adresse client'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8c6b5d]">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{o.phone}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartDelivery(o.id)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#2e1810] hover:bg-[#432317] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Prendre en charge · Partir en livraison
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Section 3: En cours de tournée */}
          <div className="space-y-4">
            <div className="p-3 bg-white rounded-xl border border-[#ede2d6] flex justify-between items-center">
              <span className="font-bold font-display text-sm text-[#2e1810]">
                En cours de livraison ({onRoad.length})
              </span>
              <span className="text-xs font-bold text-blue-700">Sur la route</span>
            </div>

            <div className="space-y-3">
              {onRoad.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8c6b5d] border border-dashed border-[#e8ded1] rounded-2xl bg-white">
                  Aucun livreur sur la route actuellement.
                </div>
              ) : (
                onRoad.map(o => (
                  <article key={o.id} className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-display font-bold text-base text-[#2e1810] block">{o.id}</span>
                        <span className="text-xs font-semibold text-[#2e1810]">{o.name}</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                        En route
                      </span>
                    </div>

                    <div className="text-xs text-[#5c3e34] bg-[#fbf8f5] p-2.5 rounded-xl border border-[#ede2d6] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#2e1810]">
                        <MapPin className="w-3.5 h-3.5 text-[#d4652a]" />
                        <span>{o.addr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#8c6b5d]">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{o.phone}</span>
                      </div>
                    </div>

                    {o.incident && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
                        <span>{o.incident}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setHandoverOrder(o);
                          setInputCode('');
                          setHandoverError(null);
                        }}
                        className="py-2.5 px-2 rounded-xl bg-[#1f6b42] text-white text-xs font-bold hover:bg-[#185333]"
                      >
                        Valider remise
                      </button>
                      <button
                        onClick={() => setIncidentOrder(o)}
                        className="py-2.5 px-2 rounded-xl border border-[#e8ded1] text-[#735144] text-xs font-bold hover:bg-[#faf7f3]"
                      >
                        Retard / Problème
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Handover code verification */}
      {handoverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleVerifyCode} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#f0e8df]">
              <h3 className="font-bold font-display text-base text-[#2e1810]">
                Remise de la commande {handoverOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setHandoverOrder(null)}
                className="text-xs text-[#8c6b5d] hover:text-[#2e1810]"
              >
                Fermer
              </button>
            </div>

            <p className="text-[#735144]">
              Demandez au client le <strong>code à 4 chiffres</strong> affiché sur son ticket de commande ou son smartphone.
            </p>

            <div className="text-center py-2">
              <label className="text-[11px] uppercase font-bold text-[#8c6b5d] block mb-2">
                Code secret client
              </label>
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                placeholder="Ex: 4829"
                className="w-40 text-center text-3xl font-mono font-extrabold tracking-widest px-3 py-2 rounded-xl border-2 border-[#d4652a] focus:outline-none focus:ring-2 focus:ring-[#d4652a] mx-auto block"
              />
              <p className="text-[11px] text-[#8c6b5d] mt-2">
                (Pour la démo, le code généré est : <strong className="font-mono text-[#2e1810]">{handoverOrder.code}</strong>)
              </p>
            </div>

            {handoverError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {handoverError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#1f6b42] hover:bg-[#185333] text-white font-bold text-xs shadow-md transition-all"
            >
              Vérifier le code et Confirmer la remise
            </button>

            {/* Exemption accordion */}
            <div className="pt-2 border-t border-[#f0e8df]">
              <button
                type="button"
                onClick={() => setShowExemption(!showExemption)}
                className="text-xs text-[#d4652a] hover:underline font-semibold block mx-auto"
              >
                {showExemption ? 'Masquer la dérogation' : 'Le client n’a pas son code (Dérogation motivée)'}
              </button>

              {showExemption && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <p className="text-[11px] text-amber-900">
                    Une dérogation est exceptionnelle et fait l’objet d’un enregistrement nominatif dans le journal de sécurité.
                  </p>
                  <input
                    type="text"
                    value={exemptionReason}
                    onChange={e => setExemptionReason(e.target.value)}
                    placeholder="Motif : Pièce d’identité vérifiée, client régulier..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleExemptionHandover}
                    className="w-full py-2 rounded-xl bg-amber-800 text-white font-bold text-xs hover:bg-amber-900"
                  >
                    Valider la remise sous ma responsabilité
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Report incident */}
      {incidentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleReportIncident} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <h3 className="font-bold font-display text-base text-[#2e1810]">
              Signaler un retard ou incident sur {incidentOrder.id}
            </h3>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Type d’incident</label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              >
                <option value="Retard de circulation">Retard de circulation (embouteillages)</option>
                <option value="Client injoignable">Client injoignable à l’adresse</option>
                <option value="Accès bloqué / Digicode manquant">Accès bloqué / Digicode manquant</option>
                <option value="Problème véhicule">Problème technique véhicule</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Nouvelle heure estimée d’arrivée</label>
              <input
                type="time"
                value={incidentEta}
                onChange={e => setIncidentEta(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Détails explicatifs (transmis au client)</label>
              <input
                type="text"
                value={incidentDetails}
                onChange={e => setIncidentDetails(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIncidentOrder(null)}
                className="px-3 py-1.5 rounded-xl border border-[#e8ded1]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#d4652a] text-white font-bold"
              >
                Enregistrer et envoyer SMS
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
