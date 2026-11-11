import React from 'react';
import { Order } from '../types/index.ts';
import { formatEuro, formatDateFrench } from '../utils/format.ts';
import { PLACES } from '../data/initialCatalog.ts';
import { CheckCircle2, QrCode, Printer, MapPin, Clock, ArrowRight, ShieldCheck, PhoneCall } from 'lucide-react';

interface OrderConfirmationViewProps {
  order: Order;
  onNewOrder: () => void;
  onGoToMember: () => void;
  onGoToTracking?: (orderId: string) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onNewOrder,
  onGoToMember,
  onGoToTracking
}) => {
  const placeInfo = PLACES.find(p => p.id === order.place) || PLACES[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4652a] block">
              Paiement confirmé · Reçu officiel
            </span>
            <h1 className="text-3xl font-extrabold font-display text-[#2e1810] mt-1">
              Merci, votre commande est validée !
            </h1>
            <p className="text-xs text-[#735144] mt-2 max-w-md mx-auto">
              Un e-mail de confirmation et un SMS vous ont été envoyés. La cuisine prépare vos mets avec soin.
            </p>
          </div>

          {/* Golden Ticket with 4-Digit Security Code */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#fdfbf7] to-[#f9f1e6] border-2 border-dashed border-[#e3a72f] my-6 text-center space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[#8c6b5d] pb-2 border-b border-[#ebd7c5]">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-embleme.png"
                  alt="Dibor & Gnilane"
                  className="w-6 h-6 object-contain rounded bg-white p-0.5"
                />
                <span className="font-bold">Commande {order.id}</span>
              </div>
              <span>{formatDateFrench(order.date)} à <strong>{order.time}</strong></span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8c6b5d] block">
                Votre Code Secret de Remise
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold font-display tracking-[0.25em] text-[#b8462e] my-2 select-all tabular-nums">
                {order.code}
              </div>
              <p className="text-xs text-[#6b4c40]">
                À présenter {order.place === 'domicile' ? 'au livreur lors de la livraison' : 'au comptoir du restaurant'} pour récupérer votre repas.
              </p>
            </div>

            {/* QR Code representation */}
            <div className="pt-3 border-t border-[#ebd7c5] flex items-center justify-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-[#e8ded1] inline-block">
                <QrCode className="w-16 h-16 text-[#2e1810]" />
              </div>
              <div className="text-left text-[11px] text-[#8c6b5d] max-w-[200px]">
                <p className="font-semibold text-[#2e1810]">Scan rapide sans contact</p>
                <p>Le livreur ou la caisse peut scanner ce code pour une remise instantanée.</p>
              </div>
            </div>
          </div>

          {/* Pickup & Destination recap */}
          <div className="p-4 rounded-xl bg-[#faf7f3] border border-[#ede2d6] text-xs text-left space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#d4652a] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#2e1810] block">{placeInfo.name}</span>
                <span className="text-[#735144]">
                  {order.addr || placeInfo.sub}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 pt-2 border-t border-[#f0e8df]">
              <Clock className="w-4 h-4 text-[#e3a72f] shrink-0" />
              <span className="text-[#5c3e34]">
                Créneau de préparation garanti : <strong>{order.time}</strong>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
            {onGoToTracking && (
              <button
                onClick={() => onGoToTracking(order.id)}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-[#1f6b42] hover:bg-[#185534] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Suivre ma livraison en direct</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto py-3 px-4 rounded-xl border border-[#e8ded1] bg-white hover:bg-[#faf7f3] text-[#2e1810] text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#735144]" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onGoToMember}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#2e1810] hover:bg-[#432317] text-[#f7ece1] text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Mon espace client</span>
            </button>
          </div>
        </div>

        {/* Detailed Itemized Receipt */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8ded1] shadow-xs text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-[#f0e8df] pb-3">
            <span className="font-bold font-display text-sm text-[#2e1810]">
              Détail des mets commandés
            </span>
            <span className="text-[#8c6b5d]">Paiement : {order.payMethod.toUpperCase()}</span>
          </div>

          <div className="divide-y divide-[#f5ede4]">
            {order.lines.map((l, i) => (
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

          <div className="border-t border-[#e8ded1] pt-3 space-y-1.5 tabular-nums text-[#5c3e34]">
            <div className="flex justify-between">
              <span>Total plats</span>
              <span>{formatEuro(order.total - order.fee + order.discount)}</span>
            </div>
            {order.fee > 0 && (
              <div className="flex justify-between">
                <span>Frais de livraison</span>
                <span>{formatEuro(order.fee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Remise fidélité Teranga</span>
                <span>-{formatEuro(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#2e1810] pt-2 border-t border-[#f0e8df]">
              <span>Total TTC payé</span>
              <span className="font-display text-base text-[#b8462e]">
                {formatEuro(order.total)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-[#8c6b5d]">
              <span>Dont TVA 10% sur la restauration</span>
              <span>{formatEuro(Math.round(order.total * 0.1))}</span>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={onNewOrder}
              className="text-xs font-bold text-[#d4652a] hover:underline"
            >
              Passer une autre commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
