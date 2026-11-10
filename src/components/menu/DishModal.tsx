import React, { useState } from 'react';
import { Product, ProductChoice, ProductAddon } from '../../types/index.ts';
import { formatEuro } from '../../utils/format.ts';
import { X, Flame, ShieldAlert, Check } from 'lucide-react';

interface DishModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (
    product: Product,
    options: string[],
    quantity: number,
    customUses?: Record<string, number>,
    customPrice?: number,
    allergens?: string[]
  ) => void;
}

export const DishModal: React.FC<DishModalProps> = ({ product, onClose, onConfirm }) => {
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number>(0);
  const [pimentSeparate, setPimentSeparate] = useState<boolean>(true);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // Compute unit price with addons
  const basePrice = product.price;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = product.addons?.find(a => a.id === addonId);
    return sum + (addon ? addon.delta : 0);
  }, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const options: string[] = [];
    const allergens: string[] = [...(product.al || [])];
    const customUses: Record<string, number> = {};

    // Base usage
    if (product.uses) {
      product.uses.forEach(u => (customUses[u] = 1));
    } else {
      customUses[product.id] = 1;
    }

    // Choice option
    if (product.choice && product.choice.length > 0) {
      const choice = product.choice[selectedChoiceIndex];
      options.push(choice.label);
      if (choice.al && !allergens.includes(choice.al)) {
        allergens.push(choice.al);
      }
      if (choice.uses) {
        customUses[choice.uses] = 1;
      }
    }

    // Piment option
    if (product.piment) {
      options.push(pimentSeparate ? 'Piment à part' : 'Piment intégré');
    }

    // Addons
    selectedAddons.forEach(addonId => {
      const addon = product.addons?.find(a => a.id === addonId);
      if (addon) {
        options.push(addon.label.replace('Remplacer l’eau par ', 'Boisson : ').replace('Ajouter ', '+ '));
        if (addon.uses) {
          customUses[addon.uses] = (customUses[addon.uses] || 0) + 0.5;
        }
      }
    });

    onConfirm(product, options, quantity, customUses, unitPrice, allergens);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e8ded1] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-[#f0e8df] bg-[#faf7f3]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#e8ded1] flex items-center justify-center text-[#735144] hover:bg-[#f0e8df] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="pr-8">
            <div className="flex items-center gap-2 mb-1 text-xs text-[#8c6b5d]">
              <span className="uppercase tracking-wider font-bold">
                {product.cat === 'plats' ? 'Plat Authentique' : product.cat === 'formules' ? 'Formule Complète' : 'Sélection Maison'}
              </span>
              {product.veg && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">100% Végétarien</span>
                </>
              )}
            </div>
            <h3 className="text-2xl font-bold font-display text-[#2e1810]">
              {product.name}
            </h3>
            <p className="text-sm text-[#6b4c40] mt-1.5 leading-relaxed">
              {product.desc}
            </p>
          </div>
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Variant choice */}
          {product.choice && product.choice.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8c6b5d] block mb-2.5">
                Votre choix principal (inclus)
              </label>
              <div className="space-y-2">
                {product.choice.map((c: ProductChoice, idx: number) => (
                  <label
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                      selectedChoiceIndex === idx
                        ? 'border-[#d4652a] bg-[#fbf5ee] text-[#2e1810] shadow-xs'
                        : 'border-[#e8ded1] hover:bg-[#faf7f3] text-[#5c3e34]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="dish-choice"
                        checked={selectedChoiceIndex === idx}
                        onChange={() => setSelectedChoiceIndex(idx)}
                        className="w-4 h-4 text-[#d4652a] focus:ring-[#d4652a]"
                      />
                      <span>{c.label}</span>
                    </div>
                    {c.al && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-normal">
                        Allergène : {c.al}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Spicy piment option */}
          {product.piment && (
            <div className="p-3.5 rounded-xl bg-[#fbf8f5] border border-[#ede2d6]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-[#d4652a]">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#2e1810] block">Piment maison à part</span>
                    <span className="text-xs text-[#8c6b5d] block">
                      Sauce pimentée sénégalaise servie dans un petit ramekin séparé
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pimentSeparate}
                    onChange={e => setPimentSeparate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4652a]"></div>
                </label>
              </div>
            </div>
          )}

          {/* Addons options */}
          {product.addons && product.addons.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#8c6b5d] block mb-2.5">
                Suppléments &amp; Boissons au choix
              </label>
              <div className="space-y-2">
                {product.addons.map((addon: ProductAddon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#e3a72f] bg-[#fdf9f0] text-[#2e1810]'
                          : 'border-[#e8ded1] hover:bg-[#faf7f3] text-[#5c3e34]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-4 h-4 rounded text-[#d4652a] focus:ring-[#d4652a]"
                        />
                        <span className="font-medium">{addon.label}</span>
                      </div>
                      <span className="text-xs font-bold text-[#b8462e] tabular-nums">
                        +{formatEuro(addon.delta)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allergens warning */}
          {product.al && product.al.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200/80">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Information allergènes confirmés :</span>{' '}
                {product.al.join(', ')}. Notre cuisine manipule également des arachides, du poisson et du gluten.
              </div>
            </div>
          )}
        </div>

        {/* Footer with quantity and Add CTA */}
        <div className="p-4 sm:p-6 border-t border-[#f0e8df] bg-[#faf7f3] flex items-center justify-between gap-4">
          <div className="flex items-center border border-[#e8ded1] bg-white rounded-xl overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center font-bold text-[#5c3e34] hover:bg-[#f5ede4] active:bg-[#e8ded1] transition-colors"
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="w-10 text-center font-bold text-sm text-[#2e1810] tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center font-bold text-[#5c3e34] hover:bg-[#f5ede4] active:bg-[#e8ded1] transition-colors"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-3 px-5 rounded-xl bg-[#d4652a] hover:bg-[#b8462e] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-between"
          >
            <span>Ajouter au panier</span>
            <span className="tabular-nums font-display text-base tracking-tight">
              {formatEuro(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
