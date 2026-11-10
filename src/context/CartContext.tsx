import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartLine, PlaceOption, Product, HoldReservation } from '../types/index.ts';
import { PLACES } from '../data/initialCatalog.ts';
import { getUpcomingDays } from '../utils/format.ts';

interface CartContextType {
  cart: CartLine[];
  selectedPlace: PlaceOption;
  selectedDate: string;
  selectedTime: string | null;
  activeHold: HoldReservation | null;
  appliedDiscount: number;
  pointsToRedeem: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  cartCount: number;
  setSelectedPlace: (place: PlaceOption) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string | null) => void;
  addToCart: (product: Product, options: string[], quantity: number, customUses?: Record<string, number>, customPrice?: number, allergens?: string[]) => void;
  updateQty: (key: string, delta: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  createHoldReservation: () => Promise<{ ok: boolean; error?: string; hold?: HoldReservation }>;
  releaseHoldReservation: () => Promise<void>;
  applyLoyaltyDiscount: (points: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedPlace, setSelectedPlaceState] = useState<PlaceOption>(PLACES[0]);
  const [selectedDate, setSelectedDate] = useState<string>(getUpcomingDays(1)[0] || '2026-11-10');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeHold, setActiveHold] = useState<HoldReservation | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Subtotal in cents
  const subtotal = cart.reduce((acc, line) => acc + line.unit * line.qty, 0);

  // Delivery fee
  const deliveryFee = selectedPlace.addr ? selectedPlace.fee : 0;

  // Discount: 10 points = 1.00 € (100 cents)
  const appliedDiscount = pointsToRedeem * 10;

  // Total in cents (minimum 0)
  const total = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  // Total items count
  const cartCount = cart.reduce((acc, line) => acc + line.qty, 0);

  const setSelectedPlace = (place: PlaceOption) => {
    setSelectedPlaceState(place);
    setSelectedTime(null);
    // Remove school-only items if not school place
    if (!place.school) {
      setCart(prev => prev.filter(item => !item.pid.startsWith('p-')));
    }
  };

  const addToCart = (
    product: Product,
    options: string[] = [],
    quantity = 1,
    customUses?: Record<string, number>,
    customPrice?: number,
    allergens?: string[]
  ) => {
    const key = `${product.id}|${options.sort().join('|')}`;
    const unitPrice = customPrice !== undefined ? customPrice : product.price;

    const uses: Record<string, number> = customUses || {};
    if (Object.keys(uses).length === 0) {
      if (product.uses && product.uses.length > 0) {
        product.uses.forEach(u => (uses[u] = 1));
      } else {
        uses[product.id] = 1;
      }
    }

    setCart(prev => {
      const existing = prev.find(line => line.key === key);
      if (existing) {
        return prev.map(line =>
          line.key === key ? { ...line, qty: line.qty + quantity } : line
        );
      }
      return [
        ...prev,
        {
          key,
          pid: product.id,
          name: product.name,
          qty: quantity,
          unit: unitPrice,
          opts: options,
          al: allergens || product.al || [],
          uses
        }
      ];
    });
  };

  const updateQty = (key: string, delta: number) => {
    setCart(prev =>
      prev
        .map(line => {
          if (line.key === key) {
            const newQty = line.qty + delta;
            return newQty > 0 ? { ...line, qty: newQty } : null;
          }
          return line;
        })
        .filter(Boolean) as CartLine[]
    );
  };

  const removeFromCart = (key: string) => {
    setCart(prev => prev.filter(line => line.key !== key));
  };

  const clearCart = () => {
    setCart([]);
    setActiveHold(null);
    setPointsToRedeem(0);
  };

  const applyLoyaltyDiscount = (points: number) => {
    setPointsToRedeem(points);
  };

  const createHoldReservation = async () => {
    if (!selectedTime) {
      return { ok: false, error: 'Veuillez sélectionner un créneau horaire.' };
    }

    try {
      const res = await fetch('/api/holds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          lines: cart,
          fee: deliveryFee,
          total
        })
      });

      if (!res.ok) {
        const data = await res.json();
        return { ok: false, error: data.error || 'Erreur lors de la réservation du créneau' };
      }

      const data = await res.json();
      setActiveHold(data.hold);
      return { ok: true, hold: data.hold };
    } catch (err) {
      console.error(err);
      return { ok: false, error: 'Erreur réseau lors de la réservation' };
    }
  };

  const releaseHoldReservation = async () => {
    if (!activeHold) return;
    try {
      await fetch(`/api/holds/${activeHold.id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    } finally {
      setActiveHold(null);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedPlace,
        selectedDate,
        selectedTime,
        activeHold,
        appliedDiscount,
        pointsToRedeem,
        subtotal,
        deliveryFee,
        total,
        cartCount,
        setSelectedPlace,
        setSelectedDate,
        setSelectedTime,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        createHoldReservation,
        releaseHoldReservation,
        applyLoyaltyDiscount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
