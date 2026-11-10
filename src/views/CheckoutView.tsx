import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { formatEuro, formatDateFrench } from '../utils/format.ts';
import { Order, PaymentMethod } from '../types/index.ts';
import { ShieldCheck, Lock, CreditCard, Smartphone, Clock, AlertCircle, ArrowLeft, CheckCircle2, QrCode } from 'lucide-react';

interface CheckoutViewProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBack, onOrderSuccess }) => {
  const {
    cart,
    selectedPlace,
    selectedDate,
    selectedTime,
    subtotal,
    deliveryFee,
    appliedDiscount,
    total,
    createHoldReservation,
    releaseHoldReservation,
    activeHold,
    clearCart
  } = useCart();
  const { currentUser } = useAuth();

  // Form states
  const [name, setName] = useState(currentUser?.name || 'Marie Diop');
  const [email, setEmail] = useState(currentUser?.email || 'marie.diop@gmail.com');
  const [phone, setPhone] = useState(currentUser?.phone || '06 12 34 56 78');
  const [address, setAddress] = useState(
    currentUser?.addresses?.[0]?.street
      ? `${currentUser.addresses[0].street}, ${currentUser.addresses[0].zip} ${currentUser.addresses[0].city}`
      : '5 rue des Lilas, 78170 La Celle-Saint-Cloud'
  );
  const [cgvAccepted, setCgvAccepted] = useState(true);

  // Payment states
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cb');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8920');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('412');
  const [mobileNumber, setMobileNumber] = useState(phone);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600); // 10 minutes default

  // Initialize hold on checkout mount
  useEffect(() => {
    let isMounted = true;
    createHoldReservation().then(res => {
      if (!res.ok && isMounted) {
        setErrorMessage(res.error || 'Erreur de réservation');
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!activeHold) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((activeHold.exp - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setErrorMessage('La réservation temporaire de 10 minutes a expiré. Veuillez renouveler votre créneau.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeHold]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleProcessPayment = async () => {
    if (!cgvAccepted) {
      setErrorMessage('Veuillez accepter les conditions de vente pour continuer.');
      return;
    }
    if (!name || !phone || (selectedPlace.addr && !address)) {
      setErrorMessage('Veuillez remplir toutes les coordonnées requises.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Simulate 3DSecure / secure bank handshake
    setTimeout(async () => {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            holdId: activeHold?.id,
            userId: currentUser?.id,
            name,
            phone,
            email,
            place: selectedPlace.id,
            addr: selectedPlace.addr ? address : undefined,
            date: selectedDate,
            time: selectedTime,
            lines: cart,
            fee: deliveryFee,
            discount: appliedDiscount,
            total,
            payMethod
          })
        });

        if (!res.ok) {
          const err = await res.json();
          setErrorMessage(err.error || 'Échec de la validation de commande');
          setIsProcessing(false);
          return;
        }

        const data = await res.json();
        clearCart();
        onOrderSuccess(data.order);
      } catch (e) {
        console.error(e);
        setErrorMessage('Erreur réseau lors de la finalisation');
        setIsProcessing(false);
      }
    }, 1200);
  };

  const handleSimulateRefusal = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setErrorMessage('Paiement refusé par votre établissement bancaire (Code 05 : Échec authentification 3D-Secure). Aucune commande n’a été débitée.');
    }, 800);
  };

  const handleCancel = async () => {
    await releaseHoldReservation();
    onBack();
  };

  return (
    <div className="min-h-screen pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#5c3e34] hover:text-[#d4652a] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au panier</span>
        </button>

        {/* Hold Reservation Countdown Notice */}
        <div className="bg-[#fdf9f0] border border-[#e3a72f]/60 rounded-2xl p-4 mb-6 shadow-xs flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e3a72f]/20 flex items-center justify-center text-[#8c5912] shrink-0">
              <Clock className="w-5 h-5 text-[#d4652a]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#2e1810]">
                Créneau horaire et portions réservés en cuisine
              </p>
              <p className="text-[11px] text-[#735144]">
                {formatDateFrench(selectedDate)} à <strong className="text-[#2e1810]">{selectedTime}</strong> · {selectedPlace.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#8c6b5d] block">Temps restant</span>
            <span className="font-display text-xl font-extrabold text-[#b8462e] tabular-nums">
              {formatTimer(timeLeftSeconds)}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <div>{errorMessage}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Form: Details & Payment */}
          <div className="md:col-span-7 space-y-6">
            {/* 1. Coordonnées */}
            <div className="bg-white rounded-2xl p-6 border border-[#e8ded1] shadow-xs space-y-4">
              <h3 className="text-base font-bold font-display text-[#2e1810]">
                1. Coordonnées de contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Nom et Prénom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1] focus:ring-2 focus:ring-[#d4652a] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Téléphone (SMS de suivi)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1] focus:ring-2 focus:ring-[#d4652a] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#5c3e34] block mb-1">Adresse E-mail (Facture &amp; Reçu)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1] focus:ring-2 focus:ring-[#d4652a] focus:outline-none"
                  />
                </div>

                {selectedPlace.addr && (
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-[#5c3e34] block mb-1">Adresse de livraison (rue, digicode, étage)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                      placeholder="Ex: 5 rue des Lilas, Interphone Diop, 2e étage"
                      className="w-full px-3 py-2 rounded-xl border border-[#e8ded1] focus:ring-2 focus:ring-[#d4652a] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Moyen de Paiement Sécurisé */}
            <div className="bg-white rounded-2xl p-6 border border-[#e8ded1] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold font-display text-[#2e1810]">
                  2. Système de paiement sécurisé
                </h3>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PCI-DSS Conforme
                </span>
              </div>

              {/* Payment selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('cb')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    payMethod === 'cb'
                      ? 'border-[#d4652a] bg-[#fdfaf6] text-[#2e1810] shadow-xs'
                      : 'border-[#e8ded1] text-[#735144] hover:bg-[#faf7f3]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#d4652a]" />
                  <span>Carte Bancaire</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('apple_pay')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    payMethod === 'apple_pay'
                      ? 'border-[#2e1810] bg-[#2e1810] text-white shadow-xs'
                      : 'border-[#e8ded1] text-[#735144] hover:bg-[#faf7f3]'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('wave')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    payMethod === 'wave'
                      ? 'border-[#1da1f2] bg-blue-50 text-blue-950 shadow-xs'
                      : 'border-[#e8ded1] text-[#735144] hover:bg-[#faf7f3]'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#1da1f2]" />
                  <span>Wave / Orange</span>
                </button>
              </div>

              {/* Card inputs */}
              {payMethod === 'cb' && (
                <div className="p-4 rounded-xl bg-[#faf7f3] border border-[#ede2d6] space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#5c3e34] block mb-1">Numéro de carte de paiement</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#e8ded1] focus:ring-2 focus:ring-[#d4652a] focus:outline-none font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-[#8c6b5d] absolute left-3 top-2.5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-[#5c3e34] block mb-1">Date d’expiration</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={e => setCardExp(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1] font-mono text-center"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#5c3e34] block mb-1">Cryptogramme (CVV)</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1] font-mono text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Apple Pay / Google Pay container */}
              {payMethod === 'apple_pay' && (
                <div className="p-4 rounded-xl bg-[#faf7f3] border border-[#ede2d6] text-xs text-center space-y-2">
                  <p className="text-[#5c3e34]">
                    Autorisation biométrique Touch ID / Face ID prête pour le montant de{' '}
                    <strong className="text-[#2e1810]">{formatEuro(total)}</strong>.
                  </p>
                  <p className="text-[11px] text-[#8c6b5d]">
                    Aucune coordonnée bancaire n’est partagée avec le commerçant.
                  </p>
                </div>
              )}

              {/* Wave / Orange Money */}
              {payMethod === 'wave' && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-3">
                  <p className="text-blue-950 font-medium">
                    Paiement Mobile Money direct sans frais supplémentaires (Wave ou Orange Money).
                  </p>
                  <div>
                    <label className="font-semibold text-blue-950 block mb-1">Numéro de téléphone mobile</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={e => setMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* CGV Checkbox */}
              <label className="flex items-start gap-2.5 text-xs text-[#5c3e34] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={cgvAccepted}
                  onChange={e => setCgvAccepted(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d4652a] focus:ring-[#d4652a] mt-0.5"
                />
                <span>
                  J’accepte les Conditions Générales de Vente et d’annulation (annulation gratuite jusqu’à 1h avant le créneau horaire prévu).
                </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  disabled={isProcessing || timeLeftSeconds <= 0}
                  onClick={handleProcessPayment}
                  className="w-full py-4 px-6 rounded-xl bg-[#1f6b42] hover:bg-[#185333] disabled:bg-[#d6cbbf] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#e3a72f]" />
                  <span>
                    {isProcessing
                      ? 'Vérification sécurisée en cours...'
                      : `Confirmer et Régler ${formatEuro(total)}`}
                  </span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleSimulateRefusal}
                    className="text-[#8c6b5d] hover:text-red-700 underline text-[11px]"
                  >
                    Simuler un refus bancaire (Test)
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-[#8c6b5d] hover:text-[#2e1810] text-[11px]"
                  >
                    Abandonner la réservation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary: Order Ticket */}
          <div className="md:col-span-5 bg-white rounded-2xl p-6 border border-[#e8ded1] shadow-xs space-y-4">
            <h3 className="text-base font-bold font-display text-[#2e1810]">
              Récapitulatif de paiement
            </h3>

            <div className="divide-y divide-[#f0e8df] text-xs">
              {cart.map(line => (
                <div key={line.key} className="py-2.5 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#2e1810]">{line.qty}× {line.name}</span>
                    {line.opts.length > 0 && (
                      <p className="text-[11px] text-[#8c6b5d] mt-0.5">{line.opts.join(' · ')}</p>
                    )}
                  </div>
                  <span className="font-semibold tabular-nums text-[#2e1810]">
                    {formatEuro(line.unit * line.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e8ded1] pt-3 space-y-2 text-xs text-[#5c3e34] tabular-nums">
              <div className="flex justify-between">
                <span>Sous-total plats</span>
                <span>{formatEuro(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{selectedPlace.addr ? 'Frais de livraison' : 'Remise au comptoir'}</span>
                <span>{deliveryFee > 0 ? formatEuro(deliveryFee) : 'Offert'}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Réduction fidélité Teranga</span>
                  <span>-{formatEuro(appliedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#2e1810] pt-2 border-t border-[#e8ded1]">
                <span>Total débité</span>
                <span className="font-display text-xl text-[#b8462e]">
                  {formatEuro(total)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#faf7f3] rounded-xl border border-[#ede2d6] text-[11px] text-[#8c6b5d] space-y-1">
              <p>
                <strong>Garantie Dibor &amp; Gnilane :</strong> Un code secret à 4 chiffres vous sera délivré immédiatement après confirmation.
              </p>
              <p>
                Il sera exigé par le livreur ou au comptoir pour vous remettre vos plats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
