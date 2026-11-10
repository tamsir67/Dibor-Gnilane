import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { Order, User, UserAddress } from '../types/index.ts';
import { formatEuro, formatDateFrench } from '../utils/format.ts';
import {
  UserCheck,
  Sparkles,
  ShoppingBag,
  MapPin,
  Clock,
  Shield,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  QrCode,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface MemberPortalViewProps {
  onReorder: (order: Order) => void;
  onNavigateToMenu: () => void;
}

export const MemberPortalView: React.FC<MemberPortalViewProps> = ({
  onReorder,
  onNavigateToMenu
}) => {
  const { currentUser, updateProfile, allUsers, login, register } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'loyalty'>('orders');

  // Profile edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(currentUser?.allergies || []);
  const [preferences, setPreferences] = useState<string[]>(currentUser?.preferences || []);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // New address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Domicile');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('La Celle-Saint-Cloud');
  const [newAddrZip, setNewAddrZip] = useState('78170');
  const [newAddrInstructions, setNewAddrInstructions] = useState('');

  // Sign in / Switch user states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  const fetchUserOrders = async () => {
    if (!currentUser) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone);
      setSelectedAllergies(currentUser.allergies || []);
      setPreferences(currentUser.preferences || []);
      fetchUserOrders();
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      name,
      phone,
      allergies: selectedAllergies,
      preferences
    });
    if (success) {
      setSaveToast('Profil mis à jour avec succès');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet) return;

    const newAddress: UserAddress = {
      id: 'addr_' + Date.now(),
      label: newAddrLabel,
      street: newAddrStreet,
      city: newAddrCity,
      zip: newAddrZip,
      instructions: newAddrInstructions,
      isDefault: (currentUser?.addresses || []).length === 0
    };

    const updated = [...(currentUser?.addresses || []), newAddress];
    await updateProfile({ addresses: updated });
    setShowAddAddress(false);
    setNewAddrStreet('');
    setNewAddrInstructions('');
    setSaveToast('Nouvelle adresse enregistrée');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = (currentUser?.addresses || []).filter(a => a.id !== id);
    await updateProfile({ addresses: updated });
    setSaveToast('Adresse supprimée');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleQuickSwitch = async (userId: string) => {
    await login(userId);
    setShowLoginModal(false);
  };

  const handleRegisterNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPhone) return;
    const user = await register({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone
    });
    if (user) {
      setShowLoginModal(false);
      setSaveToast('Bienvenue ! Votre compte a été créé avec 20 points offerts.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const statusBadges: Record<string, { label: string; bg: string }> = {
    confirmee: { label: 'Confirmée · En attente', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
    preparation: { label: 'En préparation cuisine', bg: 'bg-orange-100 text-orange-900 border-orange-300' },
    prete: { label: 'Prête à récupérer', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    livraison: { label: 'En cours de livraison', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
    incident: { label: 'Information de retard', bg: 'bg-red-100 text-red-900 border-red-300' },
    livree: { label: 'Remise terminée', bg: 'bg-gray-100 text-gray-800 border-gray-300' },
    annulee: { label: 'Annulée / Remboursée', bg: 'bg-gray-200 text-gray-700 border-gray-400' }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-[#e8ded1] shadow-xl space-y-4">
          <UserCheck className="w-12 h-12 text-[#d4652a] mx-auto" />
          <h2 className="text-2xl font-bold font-display text-[#2e1810]">Espace Membre</h2>
          <p className="text-xs text-[#735144]">
            Connectez-vous pour retrouver vos commandes, vos points de fidélité Teranga et vos adresses de livraison.
          </p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#2e1810] text-[#f7ece1] text-xs font-bold hover:bg-[#432317] transition-all"
          >
            Se connecter / Créer un compte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#2e1810] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#e3a72f]/40 animate-in fade-in duration-200 text-xs font-semibold">
          <Check className="w-4 h-4 text-[#e3a72f]" />
          <span>{saveToast}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Profile & Loyalty Points Banner */}
        <div className="bg-gradient-to-r from-[#2e1810] to-[#432317] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#e3a72f] text-[#2e1810] flex items-center justify-center font-display text-2xl font-black shrink-0 shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
                  {currentUser.name}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-[#e3a72f]">
                  Membre Teranga
                </span>
              </div>
              <p className="text-xs text-[#d6c5b6] mt-1">
                {currentUser.email} · {currentUser.phone}
              </p>
            </div>
          </div>

          {/* Loyalty Score Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:px-6 border border-white/15 flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#e3a72f] block">
                Solde Points Fidélité
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-black font-display text-white tabular-nums">
                  {currentUser.loyaltyPoints}
                </span>
                <span className="text-xs text-[#ebd7c8]">pts</span>
              </div>
              <span className="text-[11px] text-[#decbc0]">
                Soit {formatEuro(currentUser.loyaltyPoints * 10)} de réduction
              </span>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white"
            >
              Changer de compte
            </button>
          </div>
        </div>

        {/* Member Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e8ded1] pb-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#2e1810] text-white shadow-xs'
                : 'text-[#5c3e34] hover:bg-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#e3a72f]" />
            <span>Mes Commandes ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'loyalty'
                ? 'bg-[#2e1810] text-white shadow-xs'
                : 'text-[#5c3e34] hover:bg-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#e3a72f]" />
            <span>Programme Teranga VIP</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-[#2e1810] text-white shadow-xs'
                : 'text-[#5c3e34] hover:bg-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#e3a72f]" />
            <span>Mes Adresses ({currentUser.addresses?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#2e1810] text-white shadow-xs'
                : 'text-[#5c3e34] hover:bg-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#e3a72f]" />
            <span>Préférences &amp; Allergènes</span>
          </button>
        </div>

        {/* TAB 1: Mes Commandes */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-display text-[#2e1810]">
                Historique des commandes
              </h2>
              <button
                onClick={fetchUserOrders}
                className="text-xs font-semibold text-[#8c6b5d] hover:text-[#2e1810] flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualiser</span>
              </button>
            </div>

            {isLoadingOrders ? (
              <div className="p-12 text-center text-xs text-[#8c6b5d]">
                Chargement de vos commandes...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e8ded1] shadow-xs space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#d4652a] mx-auto" />
                <h3 className="font-bold text-base text-[#2e1810]">Aucune commande pour le moment</h3>
                <p className="text-xs text-[#6b4c40] max-w-sm mx-auto">
                  Découvrez nos délicieux plats sénégalais et passez votre première commande.
                </p>
                <button
                  onClick={onNavigateToMenu}
                  className="px-5 py-2.5 rounded-xl bg-[#d4652a] text-white text-xs font-bold shadow-md hover:bg-[#b8462e] transition-colors"
                >
                  Voir la carte
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map(order => {
                  const badge = statusBadges[order.status] || statusBadges.confirmee;
                  const isActive = ['confirmee', 'preparation', 'prete', 'livraison'].includes(order.status);

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl p-6 border transition-all shadow-xs space-y-4 ${
                        isActive ? 'border-[#e3a72f] ring-2 ring-[#e3a72f]/20' : 'border-[#e8ded1]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0e8df]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-base text-[#2e1810]">
                              Commande {order.id}
                            </span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                          <span className="text-xs text-[#8c6b5d]">
                            Passée le {formatDateFrench(order.date)} à {order.time} · {order.place === 'domicile' ? 'Livraison' : 'Retrait'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg font-extrabold text-[#b8462e] tabular-nums">
                            {formatEuro(order.total)}
                          </span>
                          <button
                            onClick={() => onReorder(order)}
                            className="px-3 py-1.5 rounded-lg bg-[#2e1810] hover:bg-[#432317] text-[#f7ece1] text-xs font-bold transition-all shadow-xs"
                          >
                            Commander à nouveau
                          </button>
                        </div>
                      </div>

                      {/* Security code for active order */}
                      {isActive && (
                        <div className="p-4 rounded-xl bg-[#fdf9f0] border border-[#e3a72f]/50 flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <QrCode className="w-8 h-8 text-[#d4652a] shrink-0" />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#8c6b5d] block">
                                Code secret pour le livreur / comptoir
                              </span>
                              <span className="font-display text-2xl font-extrabold text-[#b8462e] tracking-widest tabular-nums">
                                {order.code}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-[#735144] max-w-xs">
                            Présentez ce code lors de la remise pour déverrouiller la commande en toute sécurité.
                          </p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-1.5 text-xs text-[#5c3e34]">
                        {order.lines.map((l, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              <strong>{l.qty}×</strong> {l.name}
                              {l.opts.length > 0 && (
                                <span className="text-[#8c6b5d] ml-1">({l.opts.join(', ')})</span>
                              )}
                            </span>
                            <span className="tabular-nums font-semibold">
                              {formatEuro(l.unit * l.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Address or pickup location */}
                      {order.addr && (
                        <div className="text-[11px] text-[#8c6b5d] pt-2 border-t border-[#f0e8df] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#d4652a]" />
                          <span>Adresse de livraison : {order.addr}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Programme Teranga */}
        {activeTab === 'loyalty' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#d4652a] block">
                Fidélité &amp; Récompenses
              </span>
              <h2 className="text-2xl font-bold font-display text-[#2e1810]">
                Le Club Gastronomique Teranga
              </h2>
              <p className="text-xs text-[#735144] mt-1 max-w-xl">
                À chaque commande passée sur la plateforme Dibor &amp; Gnilane, vous cumulez des points échangeables contre des remises immédiates ou des desserts offerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[#faf7f3] border border-[#ede2d6] space-y-2">
                <span className="text-2xl font-bold font-display text-[#d4652a]">1 € = 1 Point</span>
                <h4 className="font-bold text-sm text-[#2e1810]">Cumul automatique</h4>
                <p className="text-xs text-[#735144]">
                  Chaque euro réglé par carte bancaire ou Wave crédite directement votre cagnotte.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf7f3] border border-[#ede2d6] space-y-2">
                <span className="text-2xl font-bold font-display text-[#e3a72f]">10 Pts = 1,00 €</span>
                <h4 className="font-bold text-sm text-[#2e1810]">Remise sans minimum</h4>
                <p className="text-xs text-[#735144]">
                  Déduisez vos points directement dans votre panier lors du paiement en 1 clic.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#faf7f3] border border-[#ede2d6] space-y-2">
                <span className="text-2xl font-bold font-display text-[#1f6b42]">Pastels offerts</span>
                <h4 className="font-bold text-sm text-[#2e1810]">Cadeau d’anniversaire</h4>
                <p className="text-xs text-[#735144]">
                  Une boîte de 4 pastels thon ou poulet offerte le mois de votre anniversaire.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm block">Votre solde actuel : {currentUser.loyaltyPoints} points</span>
                <span>Équivalent à {formatEuro(currentUser.loyaltyPoints * 10)} de réduction immédiate utilisable au panier.</span>
              </div>
              <button
                onClick={onNavigateToMenu}
                className="px-4 py-2 rounded-xl bg-[#2e1810] text-white font-bold text-xs shrink-0"
              >
                Utiliser sur une commande
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Mes Adresses */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-xs space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-[#2e1810]">
                  Adresses de livraison enregistrées
                </h2>
                <p className="text-xs text-[#735144]">
                  Vos adresses habituelles pour la livraison à domicile ou au bureau.
                </p>
              </div>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="px-4 py-2 rounded-xl bg-[#2e1810] text-white text-xs font-bold hover:bg-[#432317] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une adresse</span>
              </button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="p-5 rounded-2xl bg-[#faf7f3] border border-[#ede2d6] space-y-3 text-xs">
                <h3 className="font-bold text-sm text-[#2e1810]">Nouvelle adresse</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#5c3e34] block mb-1">Nom du lieu (Ex: Domicile, Bureau)</label>
                    <input
                      type="text"
                      value={newAddrLabel}
                      onChange={e => setNewAddrLabel(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#5c3e34] block mb-1">Rue et numéro</label>
                    <input
                      type="text"
                      value={newAddrStreet}
                      onChange={e => setNewAddrStreet(e.target.value)}
                      required
                      placeholder="Ex: 12 rue des Lilas"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#5c3e34] block mb-1">Code postal</label>
                    <input
                      type="text"
                      value={newAddrZip}
                      onChange={e => setNewAddrZip(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#5c3e34] block mb-1">Ville</label>
                    <input
                      type="text"
                      value={newAddrCity}
                      onChange={e => setNewAddrCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-[#5c3e34] block mb-1">Instructions livreur (digicode, bâtiment, étage)</label>
                    <input
                      type="text"
                      value={newAddrInstructions}
                      onChange={e => setNewAddrInstructions(e.target.value)}
                      placeholder="Ex: Bâtiment B, Interphone 204, 3e étage sans ascenseur"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#e8ded1]"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#e8ded1] text-[#735144]"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#d4652a] text-white font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(currentUser.addresses || []).map(addr => (
                <div key={addr.id} className="p-4 rounded-2xl border border-[#ede2d6] bg-[#faf7f3] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-[#2e1810] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d4652a]" />
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          Par défaut
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5c3e34]">{addr.street}</p>
                    <p className="text-xs text-[#8c6b5d]">{addr.zip} {addr.city}</p>
                    {addr.instructions && (
                      <p className="text-[11px] text-[#735144] mt-2 italic bg-white p-2 rounded-lg border border-[#e8ded1]">
                        Note : {addr.instructions}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#f0e8df] flex justify-end">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Préférences & Allergènes */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold font-display text-[#2e1810]">
                Coordonnées &amp; Préférences alimentaires
              </h2>
              <p className="text-xs text-[#735144]">
                Ces réglages permettent à la cuisine d’adapter la préparation de vos plats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-[#5c3e34] block mb-2">
                Allergènes connus (information transmise à la cuisine)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {['Arachide', 'Poisson / Crustacés', 'Gluten', 'Lactose'].map(al => {
                  const checked = selectedAllergies.includes(al);
                  return (
                    <label
                      key={al}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2 ${
                        checked ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'border-[#e8ded1] text-[#735144]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => {
                          if (e.target.checked) setSelectedAllergies([...selectedAllergies, al]);
                          else setSelectedAllergies(selectedAllergies.filter(x => x !== al));
                        }}
                        className="w-4 h-4 rounded text-[#d4652a]"
                      />
                      <span>{al}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#f0e8df]">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#d4652a] hover:bg-[#b8462e] text-white text-xs font-bold shadow-md transition-colors"
              >
                Enregistrer mes modifications
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Switch User / Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e8ded1] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#f0e8df]">
              <h3 className="font-bold font-display text-lg text-[#2e1810]">
                Changer de compte utilisateur
              </h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-xs text-[#8c6b5d] hover:text-[#2e1810]"
              >
                Fermer
              </button>
            </div>

            {/* Existing demo accounts */}
            <div>
              <span className="text-[11px] uppercase font-bold text-[#8c6b5d] block mb-2">
                Sélectionner un compte existant
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {allUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSwitch(user.id)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex justify-between items-center transition-colors ${
                      currentUser?.id === user.id
                        ? 'border-[#d4652a] bg-[#fbf5ee]'
                        : 'border-[#ede2d6] hover:bg-[#faf7f3]'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[#2e1810]">{user.name}</p>
                      <p className="text-[11px] text-[#8c6b5d]">{user.email} · Rôle : {user.role}</p>
                    </div>
                    {user.loyaltyPoints > 0 && (
                      <span className="text-[11px] bg-[#e3a72f]/20 text-[#8c5912] px-2 py-0.5 rounded font-bold">
                        {user.loyaltyPoints} pts
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick register */}
            <form onSubmit={handleRegisterNew} className="pt-2 border-t border-[#f0e8df] space-y-2 text-xs">
              <span className="text-[11px] uppercase font-bold text-[#8c6b5d] block">
                Ou créer un nouveau profil client
              </span>
              <input
                type="text"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                placeholder="Nom complet"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                placeholder="Adresse e-mail"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
              <input
                type="tel"
                value={newUserPhone}
                onChange={e => setNewUserPhone(e.target.value)}
                placeholder="Numéro de téléphone"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#2e1810] text-white font-bold text-xs hover:bg-[#432317]"
              >
                Créer et se connecter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
