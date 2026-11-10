import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { formatEuro } from '../../utils/format.ts';
import { X, Trash2, ArrowRight, ShieldCheck, Sparkles, MapPin, Clock } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const {
    cart,
    selectedPlace,
    selectedDate,
    selectedTime,
    subtotal,
    deliveryFee,
    appliedDiscount,
    total,
    pointsToRedeem,
    updateQty,
    removeFromCart,
    clearCart,
    applyLoyaltyDiscount
  } = useCart();
  const { currentUser } = useAuth();
  const [pointsInput, setPointsInput] = useState<number>(pointsToRedeem);

  if (!isOpen) return null;

  // Validation rules
  const isDelivery = selectedPlace.addr;
  const deliveryMin = selectedPlace.min || 0;
  const isBelowMin = isDelivery && subtotal < deliveryMin;
  const canCheckout = cart.length > 0 && selectedTime !== null && !isBelowMin;

  const maxPointsAvailable = currentUser?.loyaltyPoints || 0;

  const handleApplyPoints = (pts: number) => {
    const valid = Math.min(pts, maxPointsAvailable, Math.floor(subtotal / 10));
    setPointsInput(valid);
    applyLoyaltyDiscount(valid);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white shadow-2xl flex flex-col border-l border-[#e8ded1]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#f0e8df] bg-[#faf7f3] flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-[#2e1810]">
                Votre Panier Teranga
              </h2>
              <span className="text-xs text-[#8c6b5d]">
                {cart.length} référence{cart.length > 1 ? 's' : ''} sélectionnée{cart.length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#e8ded1] flex items-center justify-center text-[#735144] hover:bg-[#f0e8df] transition-colors cursor-pointer"
              aria-label="Fermer le panier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Delivery & Slot badge */}
          <div className="p-3 bg-[#fdfaf6] border-b border-[#f0e8df] text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#5c3e34]">
              <MapPin className="w-3.5 h-3.5 text-[#d4652a]" />
              <span className="font-semibold truncate max-w-[190px]">{selectedPlace.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[#8c6b5d]">
              <Clock className="w-3.5 h-3.5 text-[#e3a72f]" />
              <span>{selectedTime ? `${selectedTime}` : 'Créneau non choisi'}</span>
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-[#8c6b5d]">
                <div className="w-16 h-16 rounded-2xl bg-[#faf7f3] flex items-center justify-center mb-3 text-[#d4652a]">
                  🛒
                </div>
                <h3 className="font-bold text-base text-[#2e1810]">Votre panier est vide</h3>
                <p className="text-xs max-w-xs mt-1 text-[#6b4c40]">
                  Découvrez nos plats signatures : Yassa au poulet mariné, Mafé onctueux, ou nos pastels croustillants.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 rounded-xl bg-[#2e1810] text-white text-xs font-bold hover:bg-[#432317] transition-colors"
                >
                  Découvrir la carte
                </button>
              </div>
            ) : (
              cart.map(line => (
                <div
                  key={line.key}
                  className="p-3.5 rounded-xl border border-[#ede2d6] bg-[#faf7f3] flex flex-col gap-2 relative group"
                >
                  <div className="flex justify-between items-start gap-2 pr-6">
                    <div>
                      <h4 className="font-bold text-sm text-[#2e1810]">{line.name}</h4>
                      {line.opts.length > 0 && (
                        <p className="text-xs text-[#8c6b5d] mt-0.5 leading-snug">
                          {line.opts.join(' · ')}
                        </p>
                      )}
                      <span className="text-xs font-semibold text-[#b8462e] tabular-nums mt-1 inline-block">
                        {formatEuro(line.unit)} l’unité
                      </span>
                    </div>
                    <span className="font-bold text-sm text-[#2e1810] tabular-nums">
                      {formatEuro(line.unit * line.qty)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f0e8df]">
                    <div className="flex items-center border border-[#e8ded1] bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQty(line.key, -1)}
                        className="w-7 h-7 flex items-center justify-center font-bold text-[#5c3e34] hover:bg-[#f5ede4] active:bg-[#e8ded1] transition-colors"
                        aria-label="Diminuer"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#2e1810] tabular-nums">
                        {line.qty}
                      </span>
                      <button
                        onClick={() => updateQty(line.key, 1)}
                        className="w-7 h-7 flex items-center justify-center font-bold text-[#5c3e34] hover:bg-[#f5ede4] active:bg-[#e8ded1] transition-colors"
                        aria-label="Augmenter"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(line.key)}
                      className="text-xs text-[#a63b24] hover:underline flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Retirer</span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Loyalty points redemption card */}
            {currentUser && maxPointsAvailable > 0 && cart.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#fdf9f0] border border-[#e3a72f]/40">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8c5912]">
                    <Sparkles className="w-3.5 h-3.5 text-[#e3a72f]" />
                    <span>Points Teranga ({maxPointsAvailable} pts disponibles)</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      -{formatEuro(appliedDiscount)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#735144] mb-2.5">
                  Échangez vos points fidélité contre une réduction immédiate (10 points = 1,00 €).
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPoints(20)}
                    disabled={maxPointsAvailable < 20}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-semibold ${
                      pointsInput === 20
                        ? 'bg-[#e3a72f] text-[#2e1810] border-[#c98e21]'
                        : 'bg-white border-[#e8ded1] text-[#5c3e34] disabled:opacity-40'
                    }`}
                  >
                    20 pts (-2 €)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPoints(50)}
                    disabled={maxPointsAvailable < 50}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-semibold ${
                      pointsInput === 50
                        ? 'bg-[#e3a72f] text-[#2e1810] border-[#c98e21]'
                        : 'bg-white border-[#e8ded1] text-[#5c3e34] disabled:opacity-40'
                    }`}
                  >
                    50 pts (-5 €)
                  </button>
                  {pointsInput > 0 && (
                    <button
                      type="button"
                      onClick={() => handleApplyPoints(0)}
                      className="text-xs text-[#8c6b5d] hover:underline ml-auto"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery threshold warning */}
          {isBelowMin && (
            <div className="px-5 py-2.5 bg-red-50 border-t border-red-200 text-xs text-red-800">
              Minimum de commande en livraison : {formatEuro(deliveryMin)} (actuel : {formatEuro(subtotal)}). Veuillez ajouter {formatEuro(deliveryMin - subtotal)}.
            </div>
          )}

          {/* Footer calculation & checkout button */}
          <div className="p-5 border-t border-[#f0e8df] bg-[#faf7f3] space-y-3">
            <div className="space-y-1.5 text-xs text-[#5c3e34] tabular-nums">
              <div className="flex justify-between">
                <span>Sous-total repas</span>
                <span>{formatEuro(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedPlace.addr ? 'Frais de livraison' : 'Mode de remise'}</span>
                <span>{deliveryFee > 0 ? formatEuro(deliveryFee) : 'Offert'}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Réduction fidélité Teranga</span>
                  <span>-{formatEuro(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#2e1810] pt-2 border-t border-[#e8ded1]">
                <span>Total TTC</span>
                <span className="font-display text-lg text-[#b8462e]">
                  {formatEuro(total)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#8c6b5d] justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paiement crypté SSL 256-bit &amp; 3DSecure</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              disabled={!canCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-[#d4652a] hover:bg-[#b8462e] disabled:bg-[#d6cbbf] disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Valider et Passer au paiement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
