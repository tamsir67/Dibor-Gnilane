import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_PRODUCTS, PLACES, SLOTS_DATA, SCHOOL_SLOTS } from './src/data/initialCatalog.ts';
import { User, Product, Order, HoldReservation, CateringQuote, AuditLog, AppConfig } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());

// In-Memory Data Store with JSON Persistence
interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  holds: HoldReservation[];
  catering: CateringQuote[];
  logs: AuditLog[];
  config: AppConfig;
  orderSeq: number;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Aïssatou Ndiaye (Admin)',
    email: 'admin@dibor-gnilane.fr',
    phone: '06 11 22 33 44',
    role: 'admin',
    status: 'actif',
    loyaltyPoints: 340,
    addresses: [
      {
        id: 'addr_1',
        label: 'Restaurant Principal',
        street: '2G avenue des Étangs',
        city: 'La Celle-Saint-Cloud',
        zip: '78170',
        isDefault: true
      }
    ],
    preferences: ['Sans piment fort', 'Bissap frais'],
    allergies: [],
    createdAt: Date.now() - 60 * 86400000,
    totalSpent: 12450,
    ordersCount: 9
  },
  {
    id: 'usr_client_1',
    name: 'Marie Diop',
    email: 'marie.diop@gmail.com',
    phone: '06 12 34 56 78',
    role: 'client',
    status: 'actif',
    loyaltyPoints: 125,
    addresses: [
      {
        id: 'addr_2',
        label: 'Domicile',
        street: '5 rue des Lilas',
        city: 'La Celle-Saint-Cloud',
        zip: '78170',
        instructions: 'Interphone Diop, 2e étage gauche',
        isDefault: true
      }
    ],
    preferences: ['Yassa bien citronné', 'Piment à part'],
    allergies: [],
    createdAt: Date.now() - 30 * 86400000,
    totalSpent: 8750,
    ordersCount: 6
  },
  {
    id: 'usr_client_2',
    name: 'Moussa Traoré',
    email: 'moussa.traore@outlook.fr',
    phone: '06 98 76 54 32',
    role: 'client',
    status: 'actif',
    loyaltyPoints: 45,
    addresses: [
      {
        id: 'addr_3',
        label: 'Bureau',
        street: '14 boulevard de la République',
        city: 'Vaucresson',
        zip: '92420',
        isDefault: true
      }
    ],
    preferences: ['Mafé copieux', 'Alloco bien doré'],
    allergies: ['Arachide'],
    createdAt: Date.now() - 15 * 86400000,
    totalSpent: 3840,
    ordersCount: 3
  },
  {
    id: 'usr_chef',
    name: 'Cheikh Sarr (Chef Cuisine)',
    email: 'cuisine@dibor-gnilane.fr',
    phone: '06 55 44 33 22',
    role: 'cuisine',
    status: 'actif',
    loyaltyPoints: 0,
    addresses: [],
    preferences: [],
    allergies: [],
    createdAt: Date.now() - 50 * 86400000,
    totalSpent: 0,
    ordersCount: 0
  },
  {
    id: 'usr_deliver',
    name: 'Fatou Sow (Livreur)',
    email: 'coursier@dibor-gnilane.fr',
    phone: '06 77 88 99 00',
    role: 'livreur',
    status: 'actif',
    loyaltyPoints: 0,
    addresses: [],
    preferences: [],
    allergies: [],
    createdAt: Date.now() - 40 * 86400000,
    totalSpent: 0,
    ordersCount: 0
  }
];

function getTodayYMD(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function initDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data && data.users && data.products) {
        return data;
      }
    } catch (e) {
      console.error('Error loading existing db.json, re-seeding:', e);
    }
  }

  const today = getTodayYMD();

  const initialOrders: Order[] = [
    {
      id: 'DG-1041',
      userId: 'usr_client_1',
      name: 'Awa Diallo',
      phone: '06 00 00 00 41',
      email: 'awa.diallo@sample.fr',
      place: 'retrait',
      date: today,
      time: '12:00',
      lines: [
        {
          key: 'yassa|Piment à part',
          pid: 'yassa',
          name: 'Yassa poulet',
          qty: 2,
          unit: 1090,
          opts: ['Piment à part'],
          al: [],
          uses: { yassa: 2 }
        },
        {
          key: 'bissap',
          pid: 'bissap',
          name: 'Jus de Bissap artisanal',
          qty: 2,
          unit: 250,
          opts: [],
          al: [],
          uses: {}
        }
      ],
      fee: 0,
      discount: 0,
      total: 2680,
      status: 'confirmee',
      pay: 'payé',
      payMethod: 'cb',
      code: '4829',
      created: Date.now() - 35 * 60000,
      hist: [{ at: Date.now() - 35 * 60000, what: 'Commande confirmée après paiement sécurisé (CB)' }]
    },
    {
      id: 'DG-1042',
      userId: 'usr_client_2',
      name: 'Moussa Traoré',
      phone: '06 98 76 54 32',
      email: 'moussa.traore@outlook.fr',
      place: 'domicile',
      addr: '14 boulevard de la République, 92420 Vaucresson',
      date: today,
      time: '12:30',
      lines: [
        {
          key: 'm-decouv|Mafé poulet',
          pid: 'm-decouv',
          name: 'Menu Découverte Teranga',
          qty: 1,
          unit: 1490,
          opts: ['Mafé poulet', 'Piment à part'],
          al: ['Arachide'],
          uses: { mafe: 1 }
        },
        {
          key: 'alloco',
          pid: 'alloco',
          name: 'Alloco',
          qty: 1,
          unit: 350,
          opts: [],
          al: [],
          uses: { alloco: 1 }
        }
      ],
      fee: 290,
      discount: 0,
      total: 2130,
      status: 'preparation',
      pay: 'payé',
      payMethod: 'apple_pay',
      code: '7193',
      created: Date.now() - 25 * 60000,
      hist: [
        { at: Date.now() - 25 * 60000, what: 'Commande confirmée après paiement Apple Pay' },
        { at: Date.now() - 10 * 60000, what: 'Prise en charge par la cuisine', who: 'Cheikh Sarr' }
      ]
    },
    {
      id: 'DG-1043',
      name: 'École Pasteur (Délégué de classe)',
      phone: '01 39 69 10 20',
      email: 'ecole.pasteur@sample.edu',
      place: 'ecole',
      addr: 'École Pasteur, 2 rue Pasteur, La Celle-Saint-Cloud',
      date: today,
      time: '12:00',
      lines: [
        {
          key: 'p-afr|Yassa poulet',
          pid: 'p-afr',
          name: 'Pause africaine équilibrée',
          qty: 8,
          unit: 850,
          opts: ['Yassa poulet'],
          al: [],
          uses: { yassa: 8 }
        },
        {
          key: 'p-veg',
          pid: 'p-veg',
          name: 'Pause végétarienne',
          qty: 3,
          unit: 800,
          opts: [],
          al: [],
          uses: { 'yassa-veg': 3 }
        }
      ],
      fee: 0,
      discount: 0,
      total: 9200,
      status: 'prete',
      pay: 'payé',
      payMethod: 'wave',
      code: '3310',
      created: Date.now() - 90 * 60000,
      hist: [
        { at: Date.now() - 90 * 60000, what: 'Précommande scolaire groupée validée' },
        { at: Date.now() - 40 * 60000, what: 'Préparation terminée, plats emballés sous cloche isotherme', who: 'Cheikh Sarr' }
      ]
    }
  ];

  const initialQuotes: CateringQuote[] = [
    {
      id: 'EV-101',
      userId: 'usr_client_1',
      offer: 'Plateau Convivial',
      unit: 1400,
      n: 45,
      date: '2026-11-28',
      place: 'Salle polyvalente des Étangs, La Celle-Saint-Cloud',
      contact: 'Marie Diop (Association Teranga 78)',
      phone: '06 12 34 56 78',
      email: 'marie.diop@gmail.com',
      notes: 'Installation buffet chaud avec réchauds bain-marie et boissons bissap/gingembre fraîches. Prévoir 10 portions végétariennes.',
      status: 'Devis envoyé',
      priceQuoted: 63000,
      created: Date.now() - 48 * 3600000
    }
  ];

  const initialLogs: AuditLog[] = [
    { id: 'log_1', at: Date.now() - 35 * 60000, what: 'Commande confirmée', ref: 'DG-1041', user: 'Système' },
    { id: 'log_2', at: Date.now() - 25 * 60000, what: 'Commande confirmée', ref: 'DG-1042', user: 'Système' },
    { id: 'log_3', at: Date.now() - 10 * 60000, what: 'Mise en préparation cuisine', ref: 'DG-1042', user: 'Cheikh Sarr' },
    { id: 'log_4', at: Date.now() - 5 * 60000, what: 'Plats marqués prêts à partir', ref: 'DG-1043', user: 'Cheikh Sarr' }
  ];

  const data: DatabaseSchema = {
    users: DEFAULT_USERS,
    products: INITIAL_PRODUCTS,
    orders: initialOrders,
    holds: [],
    catering: initialQuotes,
    logs: initialLogs,
    config: {
      cap: 15,
      hold: 10,
      stock: {
        yassa: 35,
        mafe: 30,
        'yassa-veg': 20,
        thieb: 20,
        'mafe-boeuf': 15,
        thiebou: 12,
        'past-thon': 50,
        'past-poulet': 40,
        'past-leg': 30,
        alloco: 40,
        frites: 40,
        wrap: 25,
        box: 20
      },
      off: {}
    },
    orderSeq: 1043
  };

  saveDatabase(data);
  return data;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db.json:', err);
  }
}

const db = initDatabase();

function addAuditLog(what: string, ref?: string, user = 'Système') {
  const log: AuditLog = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    at: Date.now(),
    what,
    ref,
    user
  };
  db.logs.unshift(log);
  if (db.logs.length > 100) db.logs = db.logs.slice(0, 100);
  saveDatabase(db);
}

// Clean expired holds
function pruneExpiredHolds() {
  const now = Date.now();
  const beforeCount = db.holds.length;
  db.holds = db.holds.filter(h => h.exp > now);
  if (db.holds.length !== beforeCount) {
    saveDatabase(db);
  }
}

// ---------------- API ROUTES ----------------

// 1. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, userId } = req.body;
  let user: User | undefined;
  if (userId) {
    user = db.users.find(u => u.id === userId);
  } else if (email) {
    user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  if (user.status === 'suspendu') {
    return res.status(403).json({ error: 'Ce compte est suspendu. Veuillez contacter le support.' });
  }

  res.json({ success: true, user });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, street, city, zip } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Nom, e-mail et téléphone sont obligatoires' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse e-mail' });
  }

  const newUser: User = {
    id: 'usr_' + Date.now(),
    name,
    email,
    phone,
    role: 'client',
    status: 'actif',
    loyaltyPoints: 20, // Welcome gift
    addresses: street ? [{
      id: 'addr_' + Date.now(),
      label: 'Domicile',
      street,
      city: city || 'La Celle-Saint-Cloud',
      zip: zip || '78170',
      isDefault: true
    }] : [],
    preferences: [],
    allergies: [],
    createdAt: Date.now(),
    totalSpent: 0,
    ordersCount: 0
  };

  db.users.push(newUser);
  addAuditLog(`Inscription nouveau client: ${newUser.name}`, newUser.id);
  saveDatabase(db);

  res.status(201).json({ success: true, user: newUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  const user = db.users.find(u => u.id === userId) || db.users[1]; // default Marie Diop for preview
  res.json({ user });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string || req.body.id;
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  const { name, phone, preferences, allergies, addresses } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (preferences) user.preferences = preferences;
  if (allergies) user.allergies = allergies;
  if (addresses) user.addresses = addresses;

  addAuditLog(`Mise à jour du profil: ${user.name}`, user.id, user.name);
  saveDatabase(db);

  res.json({ success: true, user });
});

// 2. Users Management CRUD (Admin)
app.get('/api/users', (_req: Request, res: Response) => {
  res.json({ users: db.users });
});

app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, phone, role, status } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const newUser: User = {
    id: 'usr_' + Date.now(),
    name,
    email,
    phone,
    role: role || 'client',
    status: status || 'actif',
    loyaltyPoints: 0,
    addresses: [],
    preferences: [],
    allergies: [],
    createdAt: Date.now(),
    totalSpent: 0,
    ordersCount: 0
  };

  db.users.unshift(newUser);
  addAuditLog(`Utilisateur créé par admin: ${name} (${role})`, newUser.id, 'Admin');
  saveDatabase(db);

  res.status(201).json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  const { name, email, phone, role, status, loyaltyPoints } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;
  if (loyaltyPoints !== undefined) user.loyaltyPoints = loyaltyPoints;

  addAuditLog(`Utilisateur modifié: ${user.name}`, user.id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, user });
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  const deleted = db.users.splice(index, 1)[0];
  addAuditLog(`Utilisateur supprimé: ${deleted.name}`, deleted.id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, deletedId: deleted.id });
});

app.patch('/api/users/:id/status', (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

  user.status = user.status === 'actif' ? 'suspendu' : 'actif';
  addAuditLog(`Statut utilisateur changé: ${user.name} -> ${user.status}`, user.id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, user });
});

// 3. Products CRUD (Admin & Client)
app.get('/api/products', (_req: Request, res: Response) => {
  res.json({
    products: db.products,
    stock: db.config.stock,
    off: db.config.off
  });
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, cat, desc, price, image, al, veg, preco, days, piment, dailyStock } = req.body;
  if (!name || !cat || price === undefined) {
    return res.status(400).json({ error: 'Nom, catégorie et prix sont obligatoires' });
  }

  const id = 'prod_' + Date.now();
  const newProduct: Product = {
    id,
    cat,
    name,
    desc: desc || '',
    price: parseInt(price, 10),
    image: image || '/src/assets/images/hero_african_feast_1794320926518.jpg',
    al: al || [],
    veg: !!veg,
    preco: !!preco,
    days: days || 'tous',
    piment: !!piment,
    uses: [id]
  };

  db.products.push(newProduct);
  if (dailyStock !== undefined) {
    db.config.stock[id] = parseInt(dailyStock, 10);
  }

  addAuditLog(`Nouveau plat ajouté: ${name} (${(newProduct.price / 100).toFixed(2)} €)`, id, 'Admin');
  saveDatabase(db);

  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });

  const { name, cat, desc, price, image, al, veg, preco, days, piment, dailyStock } = req.body;
  if (name !== undefined) product.name = name;
  if (cat !== undefined) product.cat = cat;
  if (desc !== undefined) product.desc = desc;
  if (price !== undefined) product.price = parseInt(price, 10);
  if (image !== undefined) product.image = image;
  if (al !== undefined) product.al = al;
  if (veg !== undefined) product.veg = veg;
  if (preco !== undefined) product.preco = preco;
  if (days !== undefined) product.days = days;
  if (piment !== undefined) product.piment = piment;

  if (dailyStock !== undefined) {
    db.config.stock[product.id] = parseInt(dailyStock, 10);
  }

  addAuditLog(`Plat modifié: ${product.name}`, product.id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, product });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Produit introuvable' });

  const deleted = db.products.splice(index, 1)[0];
  delete db.config.stock[deleted.id];
  delete db.config.off[deleted.id];

  addAuditLog(`Plat retiré de la carte: ${deleted.name}`, deleted.id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, deletedId: deleted.id });
});

app.patch('/api/products/:id/toggle', (req: Request, res: Response) => {
  const id = req.params.id;
  const isOff = !!db.config.off[id];
  db.config.off[id] = !isOff;

  const product = db.products.find(p => p.id === id);
  addAuditLog(
    `Produit ${!isOff ? 'retiré de la vente' : 'remis en vente'}: ${product ? product.name : id}`,
    id,
    'Admin'
  );
  saveDatabase(db);

  res.json({ success: true, isOff: !isOff });
});

app.patch('/api/products/:id/stock', (req: Request, res: Response) => {
  const id = req.params.id;
  const { stock } = req.body;
  db.config.stock[id] = Math.max(0, parseInt(stock, 10) || 0);

  const product = db.products.find(p => p.id === id);
  addAuditLog(`Stock du jour ajusté: ${product ? product.name : id} -> ${db.config.stock[id]}`, id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, stock: db.config.stock[id] });
});

// 4. Slots & Capacity Calculation
app.get('/api/slots', (req: Request, res: Response) => {
  pruneExpiredHolds();
  const date = (req.query.date as string) || getTodayYMD();
  const place = (req.query.place as string) || 'retrait';

  const isSchool = place === 'ecole';
  const slotList = isSchool ? SCHOOL_SLOTS : [...SLOTS_DATA.midi, ...SLOTS_DATA.soir];
  const cap = db.config.cap;

  const slots = slotList.map(time => {
    const activeOrders = db.orders.filter(
      o => o.date === date && o.time === time && o.status !== 'annulee'
    ).length;

    const activeHolds = db.holds.filter(
      h => h.date === date && h.time === time
    ).length;

    const used = activeOrders + activeHolds;
    const remaining = Math.max(0, cap - used);

    return {
      time,
      used,
      cap,
      remaining,
      available: remaining > 0
    };
  });

  res.json({ date, place, cap, slots });
});

// 5. Holds (Temporary Reservation during Checkout)
app.post('/api/holds', (req: Request, res: Response) => {
  pruneExpiredHolds();
  const { date, time, lines, fee, total } = req.body;

  // Verify slot capacity
  const cap = db.config.cap;
  const activeOrders = db.orders.filter(
    o => o.date === date && o.time === time && o.status !== 'annulee'
  ).length;
  const activeHolds = db.holds.filter(
    h => h.date === date && h.time === time
  ).length;

  if (activeOrders + activeHolds >= cap) {
    return res.status(409).json({ error: 'Ce créneau vient d’être complet. Veuillez en choisir un autre.' });
  }

  const hold: HoldReservation = {
    id: 'hold_' + Date.now(),
    date,
    time,
    lines,
    fee: fee || 0,
    total,
    exp: Date.now() + db.config.hold * 60000
  };

  db.holds.push(hold);
  saveDatabase(db);

  res.status(201).json({ success: true, hold });
});

app.delete('/api/holds/:id', (req: Request, res: Response) => {
  db.holds = db.holds.filter(h => h.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// 6. Orders & Payments
app.get('/api/orders', (req: Request, res: Response) => {
  const { date, status, userId } = req.query;
  let list = db.orders;

  if (date) {
    list = list.filter(o => o.date === date);
  }
  if (status) {
    list = list.filter(o => o.status === status);
  }
  if (userId) {
    list = list.filter(o => o.userId === userId);
  }

  // Sort descending by created time
  list = [...list].sort((a, b) => b.created - a.created);

  res.json({ orders: list });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  res.json({ order });
});

app.post('/api/orders', (req: Request, res: Response) => {
  pruneExpiredHolds();
  const { holdId, userId, name, phone, email, place, addr, date, time, lines, fee, discount, total, payMethod } = req.body;

  // Release hold if provided
  if (holdId) {
    db.holds = db.holds.filter(h => h.id !== holdId);
  }

  db.orderSeq++;
  const orderId = 'DG-' + db.orderSeq;
  const securityCode = String(1000 + Math.floor(Math.random() * 9000));

  const newOrder: Order = {
    id: orderId,
    userId: userId || undefined,
    name,
    phone,
    email: email || undefined,
    place,
    addr: addr || '',
    date,
    time,
    lines,
    fee: fee || 0,
    discount: discount || 0,
    total,
    status: 'confirmee',
    pay: 'payé',
    payMethod: payMethod || 'cb',
    code: securityCode,
    created: Date.now(),
    hist: [
      {
        at: Date.now(),
        what: `Paiement sécurisé validé (${payMethod?.toUpperCase() || 'CB'}) - Commande confirmée`
      }
    ]
  };

  db.orders.unshift(newOrder);

  // Update customer stats and loyalty points
  if (userId) {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.totalSpent += total;
      user.ordersCount += 1;
      // 1 point per 1 euro
      const pointsEarned = Math.floor(total / 100);
      user.loyaltyPoints += pointsEarned;
    }
  }

  addAuditLog(`Commande ${orderId} confirmée (${(total / 100).toFixed(2)} €)`, orderId, name);
  saveDatabase(db);

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, why, operator } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  order.status = status;
  const historyText = why ? `${status} : ${why}` : `Passage au statut : ${status}`;
  order.hist.push({
    at: Date.now(),
    what: historyText,
    who: operator || 'Opérateur'
  });

  addAuditLog(`Commande ${order.id} -> ${status}`, order.id, operator || 'Opérateur');
  saveDatabase(db);

  res.json({ success: true, order });
});

app.post('/api/orders/:id/handover', (req: Request, res: Response) => {
  const { code, exemptionReason, operator } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  if (exemptionReason) {
    order.status = 'livree';
    order.hist.push({
      at: Date.now(),
      what: `Remise effectuée par dérogation spéciale : ${exemptionReason}`,
      who: operator || 'Livreur'
    });
    addAuditLog(`Remise dérogatoire ${order.id}: ${exemptionReason}`, order.id, operator || 'Livreur');
    saveDatabase(db);
    return res.json({ success: true, status: 'livree', reason: 'exemption' });
  }

  order.tries = (order.tries || 0) + 1;
  if (order.code === code) {
    order.status = 'livree';
    order.hist.push({
      at: Date.now(),
      what: 'Code client 4 chiffres vérifié avec succès - Repas remis',
      who: operator || 'Livreur / Comptoir'
    });
    addAuditLog(`Remise validée avec code ${order.id}`, order.id, operator || 'Livreur');
    saveDatabase(db);
    return res.json({ success: true, status: 'livree', valid: true });
  }

  saveDatabase(db);
  const remaining = Math.max(0, 3 - order.tries);
  res.status(400).json({
    error: 'Code de sécurité incorrect',
    valid: false,
    triesLeft: remaining
  });
});

app.post('/api/orders/:id/refund', (req: Request, res: Response) => {
  const { reason, cancelOrder, operator } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });

  if (!reason || reason.trim().length < 4) {
    return res.status(400).json({ error: 'Un motif détaillé de remboursement est obligatoire' });
  }

  order.pay = 'remboursé';
  order.hist.push({
    at: Date.now(),
    what: `Remboursement bancaire intégral (${(order.total / 100).toFixed(2)} €) : ${reason}`,
    who: operator || 'Admin'
  });

  if (cancelOrder) {
    order.status = 'annulee';
    order.hist.push({
      at: Date.now(),
      what: 'Commande annulée suite au remboursement',
      who: operator || 'Admin'
    });
  }

  addAuditLog(`Remboursement ${(order.total / 100).toFixed(2)} € sur ${order.id}: ${reason}`, order.id, operator || 'Admin');
  saveDatabase(db);

  res.json({ success: true, order });
});

// 7. Catering Quotes
app.get('/api/catering', (_req: Request, res: Response) => {
  res.json({ quotes: db.catering });
});

app.post('/api/catering', (req: Request, res: Response) => {
  const { offer, unit, n, date, place, contact, phone, email, notes, userId } = req.body;
  if (!offer || !n || !date || !place || !contact) {
    return res.status(400).json({ error: 'Informations obligatoires incomplètes' });
  }

  const newQuote: CateringQuote = {
    id: 'EV-' + (100 + db.catering.length + 1),
    userId: userId || undefined,
    offer,
    unit: unit || 0,
    n: parseInt(n, 10),
    date,
    place,
    contact,
    phone: phone || '',
    email: email || '',
    notes: notes || '',
    status: 'Reçue',
    priceQuoted: unit ? unit * n : undefined,
    created: Date.now()
  };

  db.catering.unshift(newQuote);
  addAuditLog(`Nouvelle demande de devis traiteur: ${newQuote.id} (${n} pers.)`, newQuote.id, contact);
  saveDatabase(db);

  res.status(201).json({ success: true, quote: newQuote });
});

app.patch('/api/catering/:id', (req: Request, res: Response) => {
  const quote = db.catering.find(q => q.id === req.params.id);
  if (!quote) return res.status(404).json({ error: 'Devis introuvable' });

  const { status, priceQuoted } = req.body;
  if (status !== undefined) quote.status = status;
  if (priceQuoted !== undefined) quote.priceQuoted = priceQuoted;

  addAuditLog(`Devis traiteur ${quote.id} mis à jour (${quote.status})`, quote.id, 'Admin');
  saveDatabase(db);

  res.json({ success: true, quote });
});

// 8. Stats & Audit Logs
app.get('/api/stats', (req: Request, res: Response) => {
  const date = (req.query.date as string) || getTodayYMD();
  const dayOrders = db.orders.filter(o => o.date === date && o.status !== 'annulee');
  const revenue = dayOrders
    .filter(o => o.pay !== 'remboursé')
    .reduce((sum, o) => sum + o.total, 0);

  const mealsCount = dayOrders.reduce(
    (sum, o) => sum + o.lines.reduce((lSum, l) => lSum + l.qty, 0),
    0
  );

  const schoolCount = dayOrders
    .filter(o => o.place === 'ecole')
    .reduce((sum, o) => sum + o.lines.reduce((lSum, l) => lSum + l.qty, 0), 0);

  const statusMap: Record<string, number> = {
    confirmee: 0,
    preparation: 0,
    prete: 0,
    livraison: 0,
    incident: 0,
    livree: 0,
    annulee: 0
  };

  dayOrders.forEach(o => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  });

  const slotsTotal = (SLOTS_DATA.midi.length + SLOTS_DATA.soir.length) * db.config.cap;

  res.json({
    date,
    todayOrdersCount: dayOrders.length,
    todayRevenue: revenue,
    todayMealsCount: mealsCount,
    schoolMealsCount: schoolCount,
    pendingQuotesCount: db.catering.filter(q => q.status === 'Reçue').length,
    slotsUtilization: {
      used: dayOrders.length,
      cap: slotsTotal
    },
    statusBreakdown: statusMap,
    config: db.config
  });
});

app.get('/api/logs', (_req: Request, res: Response) => {
  res.json({ logs: db.logs });
});

app.patch('/api/config', (req: Request, res: Response) => {
  const { cap, hold } = req.body;
  if (cap !== undefined) db.config.cap = Math.max(1, parseInt(cap, 10));
  if (hold !== undefined) db.config.hold = Math.max(1, parseInt(hold, 10));

  addAuditLog(`Configuration système mise à jour (Cap: ${db.config.cap})`, undefined, 'Admin');
  saveDatabase(db);

  res.json({ success: true, config: db.config });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Dibor & Gnilane Food server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
