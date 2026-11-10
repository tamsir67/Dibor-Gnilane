export type Role = 'client' | 'admin' | 'cuisine' | 'livreur';

export interface UserAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: 'actif' | 'suspendu';
  loyaltyPoints: number;
  addresses: UserAddress[];
  preferences: string[];
  allergies: string[];
  createdAt: number;
  totalSpent: number;
  ordersCount: number;
}

export type ProductCategory = 'plats' | 'formules' | 'scolaire' | 'snacks' | 'boissons' | 'desserts';

export interface ProductChoice {
  label: string;
  uses?: string;
  al?: string;
}

export interface ProductAddon {
  id: string;
  label: string;
  delta: number;
  uses?: string;
}

export interface Product {
  id: string;
  cat: ProductCategory;
  name: string;
  desc: string;
  price: number; // in cents (e.g. 1090 = 10,90 €)
  image?: string;
  al?: string[];
  veg?: boolean;
  preco?: boolean;
  days?: number[] | 'tous';
  piment?: boolean;
  uses?: string[];
  school?: boolean;
  choice?: ProductChoice[];
  addons?: ProductAddon[];
  inStock?: boolean;
  dailyStock?: number;
}

export interface CartLine {
  key: string;
  pid: string;
  name: string;
  qty: number;
  unit: number; // in cents
  opts: string[];
  al: string[];
  uses: Record<string, number>;
}

export type PlaceType = 'retrait' | 'domicile' | 'ecole';

export interface PlaceOption {
  id: PlaceType;
  name: string;
  sub: string;
  fee: number;
  min?: number;
  addr?: boolean;
  school?: boolean;
}

export type OrderStatus =
  | 'confirmee'
  | 'preparation'
  | 'prete'
  | 'livraison'
  | 'incident'
  | 'livree'
  | 'annulee';

export type PaymentStatus = 'payé' | 'remboursé' | 'en_attente';
export type PaymentMethod = 'cb' | 'apple_pay' | 'wave' | 'orange_money';

export interface OrderHistoryItem {
  at: number;
  what: string;
  who?: string;
}

export interface Order {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email?: string;
  place: PlaceType;
  addr?: string;
  date: string;
  time: string;
  lines: CartLine[];
  fee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  pay: PaymentStatus;
  payMethod: PaymentMethod;
  code: string; // 4-digit pickup/delivery security code
  qrCode?: string;
  tries?: number;
  incident?: string;
  created: number;
  hist: OrderHistoryItem[];
  notes?: string;
  example?: boolean;
}

export interface HoldReservation {
  id: string;
  date: string;
  time: string;
  lines: CartLine[];
  exp: number; // timestamp in ms
  total: number;
  fee: number;
}

export interface CateringQuote {
  id: string;
  userId?: string;
  offer: string;
  unit: number;
  n: number;
  date: string;
  place: string;
  contact: string;
  phone: string;
  email?: string;
  notes: string;
  status: 'Reçue' | 'Devis envoyé' | 'Acceptée' | 'Refusée';
  priceQuoted?: number;
  created: number;
}

export interface AuditLog {
  id: string;
  at: number;
  what: string;
  ref?: string;
  user?: string;
}

export interface AppConfig {
  cap: number;
  hold: number;
  stock: Record<string, number>;
  off: Record<string, boolean>;
}

export interface DashboardStats {
  todayOrdersCount: number;
  todayRevenue: number;
  todayMealsCount: number;
  slotsUtilization: {
    used: number;
    cap: number;
  };
  schoolMealsCount: number;
  pendingQuotesCount: number;
  statusBreakdown: Record<OrderStatus, number>;
}
