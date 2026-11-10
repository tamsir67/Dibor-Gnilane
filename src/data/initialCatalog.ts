import { Product, PlaceOption } from '../types/index.ts';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'yassa',
    cat: 'plats',
    name: 'Yassa poulet',
    desc: 'Poulet fermier mariné, sauce oignons caramélisés au citron et moutarde de Dijon, servi avec riz blanc parfumé.',
    price: 1090,
    image: '/src/assets/images/dish_yassa_poulet_1794320927009.jpg',
    days: 'tous',
    piment: true,
    uses: ['yassa']
  },
  {
    id: 'mafe',
    cat: 'plats',
    name: 'Mafé poulet',
    desc: 'Poulet mijoté dans une onctueuse sauce pâte d’arachide parfumée, carottes, patates douces et riz blanc.',
    price: 1090,
    image: '/src/assets/images/dish_mafe_poulet_1794320928105.jpg',
    al: ['Arachide'],
    days: 'tous',
    piment: true,
    uses: ['mafe']
  },
  {
    id: 'yassa-veg',
    cat: 'plats',
    name: 'Yassa végétarien',
    desc: 'Légumes croquants mijotés, pois chiches fondants, sauce oignons-citron douce et riz blanc.',
    price: 950,
    days: 'tous',
    veg: true,
    piment: true,
    uses: ['yassa-veg']
  },
  {
    id: 'thieb',
    cat: 'plats',
    name: 'Thiéb au poulet',
    desc: 'Riz rouge mijoté au concentré de tomate et épices douces, poulet doré et légumes fondants.',
    price: 1150,
    days: [2, 4, 6], // mardi, jeudi, samedi
    piment: true,
    uses: ['thieb']
  },
  {
    id: 'mafe-boeuf',
    cat: 'plats',
    name: 'Mafé bœuf',
    desc: 'Paleron de bœuf tendre braisé, sauce veloutée aux arachides grillées, légumes racines et riz.',
    price: 1250,
    al: ['Arachide'],
    days: [3, 5], // mercredi, vendredi
    piment: true,
    uses: ['mafe-boeuf']
  },
  {
    id: 'thiebou',
    cat: 'plats',
    name: 'Thiéboudiène Penda Mbaye',
    desc: 'Plat national sénégalais : mérou ou capitaine, riz mijoté au bouillon de légumes, chou, manioc et carotte.',
    price: 1350,
    preco: true,
    al: ['Poisson'],
    piment: true,
    uses: ['thiebou']
  },
  {
    id: 'past-thon',
    cat: 'snacks',
    name: 'Pastels au thon (4 pièces)',
    desc: 'Chaussons dorés croustillants garnis de thon assaisonné aux herbes, sauce tomate piquante à part.',
    price: 450,
    image: '/src/assets/images/dish_pastels_trio_1794320927313.jpg',
    al: ['Poisson', 'Gluten'],
    uses: ['past-thon']
  },
  {
    id: 'past-poulet',
    cat: 'snacks',
    name: 'Pastels au poulet (4 pièces)',
    desc: 'Chaussons farcis au poulet épicé et persil, pâte fine et croustillante, sauce tomate à part.',
    price: 450,
    al: ['Gluten'],
    uses: ['past-poulet']
  },
  {
    id: 'past-leg',
    cat: 'snacks',
    name: 'Pastels aux légumes (4 pièces)',
    desc: 'Chaussons croustillants farcis aux petits légumes et épices sénégalaises, sauce maison.',
    price: 400,
    al: ['Gluten'],
    veg: true,
    uses: ['past-leg']
  },
  {
    id: 'alloco',
    cat: 'snacks',
    name: 'Alloco',
    desc: 'Portion généreuse de bananes plantains mûres frites à point, dorées et fondantes.',
    price: 350,
    veg: true,
    uses: ['alloco']
  },
  {
    id: 'frites',
    cat: 'snacks',
    name: 'Frites croustillantes',
    desc: 'Portion individuelle de frites dorées, croustillantes à l’extérieur et tendres à cœur.',
    price: 250,
    veg: true,
    uses: ['frites']
  },
  {
    id: 'wrap',
    cat: 'snacks',
    name: 'Wrap poulet yassa',
    desc: 'Galette de blé garnie d’effiloché de poulet yassa, oignons confits, crudités fraîches et sauce.',
    price: 650,
    al: ['Gluten'],
    uses: ['wrap']
  },
  {
    id: 'box',
    cat: 'snacks',
    name: 'Box poulet alloco',
    desc: 'Morceaux de poulet mariné croustillant, portion d’alloco fondant et sauce pimentée douce.',
    price: 850,
    uses: ['box']
  },
  {
    id: 'm-yassa',
    cat: 'formules',
    name: 'Menu Yassa classique',
    desc: 'Un plat Yassa poulet au choix + une eau minérale 50 cl fraîche.',
    price: 1190,
    uses: ['yassa']
  },
  {
    id: 'm-mafe',
    cat: 'formules',
    name: 'Menu Mafé classique',
    desc: 'Un plat Mafé poulet onctueux + une eau minérale 50 cl fraîche.',
    price: 1190,
    al: ['Arachide'],
    uses: ['mafe']
  },
  {
    id: 'm-decouv',
    cat: 'formules',
    name: 'Menu Découverte Teranga',
    desc: '2 pastels au choix + 1 plat yassa ou mafé poulet + 1 bissap maison 25 cl.',
    price: 1490,
    choice: [
      { label: 'Yassa poulet', uses: 'yassa' },
      { label: 'Mafé poulet', uses: 'mafe', al: 'Arachide' }
    ]
  },
  {
    id: 'm-gourmand',
    cat: 'formules',
    name: 'Menu Gourmand complet',
    desc: '1 plat yassa ou mafé + 1 boisson fraîche 25 cl + 1 dessert traditionnel Thiakry.',
    price: 1590,
    choice: [
      { label: 'Yassa poulet', uses: 'yassa' },
      { label: 'Mafé poulet', uses: 'mafe', al: 'Arachide' }
    ],
    al: ['Lait (thiakry)']
  },
  // Pause scolaire
  {
    id: 'p-snack',
    cat: 'scolaire',
    name: 'Pause snack scolaire',
    desc: '4 pastels au thon ou au poulet + eau minérale 50 cl. Format pause déjeuner rapide.',
    price: 550,
    school: true,
    choice: [
      { label: 'Pastels au thon', uses: 'past-thon', al: 'Poisson' },
      { label: 'Pastels au poulet', uses: 'past-poulet' }
    ]
  },
  {
    id: 'p-wrap',
    cat: 'scolaire',
    name: 'Pause wrap scolaire',
    desc: 'Wrap poulet yassa avec crudités croquantes + eau minérale 50 cl.',
    price: 750,
    school: true,
    uses: ['wrap']
  },
  {
    id: 'p-afr',
    cat: 'scolaire',
    name: 'Pause africaine équilibrée',
    desc: 'Portion scolaire adaptée de Yassa ou Mafé poulet avec riz parfumé + eau minérale 50 cl.',
    price: 850,
    school: true,
    choice: [
      { label: 'Yassa poulet', uses: 'yassa' },
      { label: 'Mafé poulet', uses: 'mafe', al: 'Arachide' }
    ]
  },
  {
    id: 'p-veg',
    cat: 'scolaire',
    name: 'Pause végétarienne',
    desc: 'Portion de yassa végétarien aux légumes et pois chiches + riz + eau minérale 50 cl.',
    price: 800,
    school: true,
    veg: true,
    uses: ['yassa-veg']
  },
  {
    id: 'p-comp',
    cat: 'scolaire',
    name: 'Pause complète + fruit',
    desc: 'Portion scolaire de Yassa ou Mafé + eau minérale 50 cl + 1 fruit frais de saison.',
    price: 950,
    school: true,
    choice: [
      { label: 'Yassa poulet', uses: 'yassa' },
      { label: 'Mafé poulet', uses: 'mafe', al: 'Arachide' }
    ]
  },
  // Boissons
  { id: 'eau', cat: 'boissons', name: 'Eau minérale plate', desc: 'Bouteille 50 cl', price: 150 },
  { id: 'soda', cat: 'boissons', name: 'Soda au choix', desc: 'Canette 33 cl fraîche', price: 200 },
  { id: 'bissap', cat: 'boissons', name: 'Jus de Bissap artisanal', desc: 'Infusion de fleurs d’hibiscus, menthe douce et vanille. 25 cl', price: 250 },
  { id: 'ging', cat: 'boissons', name: 'Jus de Gingembre (Gnamankoudji)', desc: 'Pur jus de gingembre frais pressé et citron vert, tonifiant. 25 cl', price: 250 },
  { id: 'bissap-l', cat: 'boissons', name: 'Bissap à partager (1 Litre)', desc: 'Grande carafe / bouteille 1L pour toute la famille', price: 750 },
  { id: 'ging-l', cat: 'boissons', name: 'Jus de Gingembre à partager (1 Litre)', desc: 'Grande bouteille 1L rafraîchissante et stimulante', price: 750 },
  // Desserts
  { id: 'thiakry', cat: 'desserts', name: 'Thiakry traditionnel', desc: 'Couscous de mil sucré et yaourt onctueux parfumé à la fleur d’oranger et muscade. Pot 150 g', price: 300, al: ['Lait'] },
  { id: 'beignets', cat: 'desserts', name: 'Beignets africains sucrés (5 pcs)', desc: 'Petits beignets moelleux dorés parfumés à la vanille et muscade', price: 300 },
  { id: 'fruit', cat: 'desserts', name: 'Fruit frais de saison', desc: 'Pomme, banane ou orange à l’unité', price: 100 }
];

export const PLACES: PlaceOption[] = [
  {
    id: 'retrait',
    name: 'Retrait au fast-food',
    sub: '2G avenue des Étangs, 78170 La Celle-Saint-Cloud',
    fee: 0
  },
  {
    id: 'domicile',
    name: 'Livraison à domicile',
    sub: 'Zone proche validée (La Celle-St-Cloud, Vaucresson, Bougival) · 2,90 € · minimum 15 €',
    fee: 290,
    min: 1500,
    addr: true
  },
  {
    id: 'ecole',
    name: 'École partenaire / Entreprise',
    sub: 'Précommande jusqu’à la veille 20 h · Livraison groupée offerte dès 10 repas',
    fee: 0,
    school: true
  }
];

export const SLOTS_DATA = {
  midi: ['11:30', '12:00', '12:30', '13:00', '13:30'],
  soir: ['18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
};

export const SCHOOL_SLOTS = ['12:00'];
