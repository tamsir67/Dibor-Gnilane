import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { X, UserCheck, Sparkles, LogIn, UserPlus, Phone, Mail, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { allUsers, currentUser, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regCity, setRegCity] = useState('La Celle-Saint-Cloud');
  const [regZip, setRegZip] = useState('78170');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const term = loginIdentifier.trim().toLowerCase();
    const matched = allUsers.find(
      u => u.email.toLowerCase() === term || u.phone.replace(/\s+/g, '') === term.replace(/\s+/g, '')
    );

    if (matched) {
      await login(matched.id);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setIsSubmitting(false);
      setLoginError("Aucun compte client trouvé avec cette adresse e-mail ou ce numéro. Vous pouvez créer un compte en 30 secondes.");
    }
  };

  const handleQuickSelect = async (userId: string) => {
    await login(userId);
    onClose();
    if (onSuccess) onSuccess();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    const created = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      street: regStreet,
      city: regCity,
      zip: regZip
    });

    setIsSubmitting(false);
    if (created) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setLoginError("Une erreur est survenue ou l'e-mail est déjà utilisé.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#e8ded1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#f0e8df] bg-[#faf7f3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2e1810] text-[#e3a72f] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-[#2e1810]">
                Espace Client Teranga
              </h3>
              <p className="text-xs text-[#8c6b5d]">
                Identifiez-vous pour commander et suivre vos repas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#e8ded1] flex items-center justify-center text-[#735144] hover:bg-[#f0e8df] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-4 bg-[#fbf8f5] border-b border-[#f0e8df] flex gap-2">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-[#2e1810] text-white shadow-xs'
                : 'bg-white text-[#735144] border border-[#e8ded1]'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-[#d4652a] text-white shadow-xs'
                : 'bg-white text-[#735144] border border-[#e8ded1]'
            }`}
          >
            Nouveau client (+20 pts)
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] leading-relaxed">
              {loginError}
            </div>
          )}

          {tab === 'login' ? (
            <>
              {/* Quick Profile Selection */}
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#8c6b5d] block mb-2">
                  Profils clients pré-enregistrés (Accès rapide 1 clic)
                </span>
                <div className="space-y-1.5">
                  {allUsers
                    .filter(u => u.role === 'client')
                    .map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickSelect(u.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          currentUser?.id === u.id
                            ? 'border-[#d4652a] bg-[#fdf5ee]'
                            : 'border-[#e8ded1] bg-[#faf7f3] hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#2e1810] flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {currentUser?.id === u.id && (
                              <span className="text-[10px] bg-[#d4652a] text-white px-1.5 py-0.2 rounded font-semibold">
                                Actif
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8c6b5d]">{u.email} · {u.phone}</p>
                        </div>
                        <span className="font-bold text-[#b8462e] tabular-nums text-xs">
                          {u.loyaltyPoints} pts
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#e8ded1]"></div>
                <span className="flex-shrink mx-3 text-[#8c6b5d] text-[10px] uppercase font-bold">
                  Ou par e-mail / téléphone
                </span>
                <div className="flex-grow border-t border-[#e8ded1]"></div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">
                    Adresse e-mail ou téléphone
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="Ex: marie.diop@gmail.com ou 06 12 34 56 78"
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1] bg-white focus:outline-none focus:ring-2 focus:ring-[#d4652a]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#2e1810] text-[#f7ece1] font-bold text-xs hover:bg-[#432317] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#e3a72f]" />
                  <span>S’identifier sur mon compte</span>
                </button>
              </form>
            </>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e3a72f] shrink-0" />
                <span>
                  <strong>Bienvenue !</strong> 20 points Teranga offerts à l'inscription (2,00 € de remise immédiate).
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Nom et Prénom *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Ex: Aminata Diallo"
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="aminata@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="06 00 00 00 00"
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Adresse de livraison (rue)</label>
                <input
                  type="text"
                  value={regStreet}
                  onChange={e => setRegStreet(e.target.value)}
                  placeholder="Ex: 10 rue des Lilas"
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Code postal</label>
                  <input
                    type="text"
                    value={regZip}
                    onChange={e => setRegZip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#5c3e34] block mb-1">Ville</label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={e => setRegCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#d4652a] text-white font-bold text-xs hover:bg-[#b8462e] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer mon compte client &amp; Activer les 20 pts</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
