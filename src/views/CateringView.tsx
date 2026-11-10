import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { formatEuro } from '../utils/format.ts';
import { Utensils, CheckCircle2, Calendar, Users, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

interface CateringViewProps {
  onBackToMenu: () => void;
}

export const CateringView: React.FC<CateringViewProps> = ({ onBackToMenu }) => {
  const { currentUser } = useAuth();

  const packages = [
    {
      id: 'essentiel',
      name: 'Plateau Essentiel',
      desc: 'Plat signature au choix (Yassa ou Mafé poulet copieux avec son riz parfumé), servi chaud en bacs isothermes ou plateaux individuels.',
      price: 1050
    },
    {
      id: 'convivial',
      name: 'Plateau Convivial',
      desc: '2 pastels dorés au thon/poulet + 1 plat chaud au choix (Yassa / Mafé) + 1 carafe/bouteille de jus de bissap artisanal frais 25 cl.',
      price: 1400
    },
    {
      id: 'festif',
      name: 'Plateau Festif Complet',
      desc: '2 pastels + 1 plat chaud au choix + bissap maison + 1 portion de Thiakry traditionnel onctueux ou beignets vanillés.',
      price: 1650
    },
    {
      id: 'sur_mesure',
      name: 'Prestation Buffet Sur-Mesure',
      desc: 'Buffet chaud complet avec réchauds bain-marie professionnels, service de poisson Thiéboudiène, alloco à volonté et service traiteur.',
      price: 0
    }
  ];

  const [selectedPackageIndex, setSelectedPackageIndex] = useState(1); // Default to Convivial
  const [guestsCount, setGuestsCount] = useState(35);
  const [eventDate, setEventDate] = useState('2026-11-28');
  const [eventPlace, setEventPlace] = useState('Salle des fêtes de La Celle-Saint-Cloud');
  const [contactName, setContactName] = useState(currentUser?.name || 'Marie Diop');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '06 12 34 56 78');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'marie.diop@gmail.com');
  const [eventNotes, setEventNotes] = useState('Installation buffet chaud avec réchauds et maintien au chaud. Prévoir 5 portions végétariennes.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuoteId, setSubmittedQuoteId] = useState<string | null>(null);

  const currentPkg = packages[selectedPackageIndex];
  const totalEstimate = currentPkg.price > 0 ? currentPkg.price * guestsCount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestsCount < 20) {
      alert('Les commandes événementielles démarrent à partir de 20 personnes.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/catering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer: currentPkg.name,
          unit: currentPkg.price,
          n: guestsCount,
          date: eventDate,
          place: eventPlace,
          contact: contactName,
          phone: contactPhone,
          email: contactEmail,
          notes: eventNotes,
          userId: currentUser?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedQuoteId(data.quote.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#d4652a]">
            Prestations Événements &amp; Banquets
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-[#2e1810]">
            Traiteur Africain Dès 20 Personnes
          </h1>
          <p className="text-sm text-[#735144] max-w-xl mx-auto leading-relaxed">
            Mariages, anniversaires, séminaires d’entreprise, fêtes associatives. Dibor &amp; Gnilane livre et installe des mets sénégalais d’exception.
          </p>
        </div>

        {submittedQuoteId ? (
          <div className="bg-white rounded-3xl p-8 border border-[#e8ded1] shadow-xl text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-[#2e1810]">
              Demande de devis {submittedQuoteId} enregistrée
            </h2>
            <p className="text-xs text-[#735144] max-w-md mx-auto">
              Notre cheffe étudie votre demande et vous transmettra un devis contractuel sous 24h ouvrées par e-mail et SMS.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={onBackToMenu}
                className="px-6 py-2.5 rounded-xl bg-[#2e1810] text-[#f7ece1] text-xs font-bold hover:bg-[#432317]"
              >
                Retourner à la carte individuelle
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-xs space-y-6">
            {/* Packages Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8c6b5d] block mb-3">
                1. Choisissez une formule pour votre groupe
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packages.map((pkg, idx) => (
                  <label
                    key={pkg.id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedPackageIndex === idx
                        ? 'border-[#d4652a] bg-[#fbf5ee] shadow-sm'
                        : 'border-[#ede2d6] hover:bg-[#faf7f3]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="font-bold text-sm text-[#2e1810] flex items-center gap-2">
                          <input
                            type="radio"
                            name="catering-pkg"
                            checked={selectedPackageIndex === idx}
                            onChange={() => setSelectedPackageIndex(idx)}
                            className="w-4 h-4 text-[#d4652a] focus:ring-[#d4652a]"
                          />
                          {pkg.name}
                        </span>
                        <span className="font-extrabold text-sm text-[#b8462e] tabular-nums shrink-0">
                          {pkg.price > 0 ? `${formatEuro(pkg.price)} / pers.` : 'Sur devis'}
                        </span>
                      </div>
                      <p className="text-xs text-[#735144] leading-relaxed pl-6">
                        {pkg.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 pt-4 border-t border-[#f0e8df]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8c6b5d] block">
                2. Détails de l’événement &amp; Convives
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Nombre de personnes (min. 20)</label>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    value={guestsCount}
                    onChange={e => setGuestsCount(Math.max(20, parseInt(e.target.value, 10) || 20))}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1] font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Date souhaitée</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Lieu / Commune</label>
                  <input
                    type="text"
                    value={eventPlace}
                    onChange={e => setEventPlace(e.target.value)}
                    required
                    placeholder="Ex: Versailles, Saint-Cloud..."
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-4 pt-4 border-t border-[#f0e8df]">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8c6b5d] block">
                3. Responsable ou Organisateur
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Nom du contact</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="font-semibold text-[#5c3e34] block mb-1">
                  Besoins spécifiques, horaires de service, allergies ou contraintes d’installation
                </label>
                <textarea
                  rows={3}
                  value={eventNotes}
                  onChange={e => setEventNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>
            </div>

            {/* Price estimate recap */}
            <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#ede2d6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-[#8c6b5d] block">Estimation indicative :</span>
                <span className="font-display text-2xl font-black text-[#b8462e] tabular-nums">
                  {totalEstimate ? formatEuro(totalEstimate) : 'Sur devis personnalisé'}
                </span>
                <span className="text-[11px] text-[#735144] block">
                  Hors options d’installation et transport selon la zone géographique
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-6 rounded-xl bg-[#d4652a] hover:bg-[#b8462e] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
              >
                <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande de devis'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
