# 🍲 Dibor & Gnilane Food — Plateforme Gastronomique & Traiteur Sénégalais

> **Le goût de l’Afrique, livré à l’heure.**  
> Application web moderne et **Progressive Web App (PWA)** 100% responsive pour **Android** et **Apple iOS (iPhone / iPad)**, avec système de commande express, gestion des créneaux de livraison, programme de fidélité Teranga, paiement sécurisé et tableau de bord administrateur (CRUD complet).

📍 **Adresse du restaurant :** 2G avenue des Étangs, 78170 La Celle-Saint-Cloud  
🚚 **Zones desservies :** La Celle-Saint-Cloud, Vaucresson, Bougival, Rueil-Malmaison, Versailles et environs.

---

## 📱 1. PWA & Compatibilité Mobile (Android & iPhone iOS)

L'application est conçue selon les standards **Progressive Web App (PWA)** les plus récents pour offrir une expérience identique à une application native téléchargée sur l'App Store ou le Google Play Store.

### 🍏 Installation sur iPhone / iPad (Apple iOS Safari)
Sur iOS, Apple utilise le moteur WebKit qui requiert un flux d'installation guidé :
1. Ouvrez le site dans le navigateur **Safari**.
2. Appuyez sur le bouton **Partager** 📤 (carré avec une flèche vers le haut dans la barre d'outils inférieure de Safari).
3. Faites défiler les options et touchez **"Sur l'écran d'accueil"** (icône ➕).
4. Touchez **"Ajouter"** en haut à droite.
5. L'icône officielle de **Dibor & Gnilane Food** s'installe directement sur votre écran d'accueil avec :
   - Lancement en plein écran **standalone** (sans barre d'adresse ni boutons de navigation du navigateur).
   - Barre de statut translucide et adaptée (`black-translucent`).
   - Icône HD Apple Touch dédiée (`apple-touch-icon.png`).
   - Mise en cache intelligente pour un démarrage instantané.

> 💡 **Guide intégré dans l'App :** Sur iPhone, le bouton *"Installer l'App"* ouvre automatiquement une modale explicative visuelle en 3 étapes avec les icônes exactes d'iOS.

### 🤖 Installation sur Android (Google Chrome & Samsung Internet)
Sur Android, l'installation est native et se fait en **1 clic** :
1. Un bouton **"Installer l'App"** apparaît automatiquement dans la barre de navigation supérieure et sur la bannière de bienvenue.
2. Cliquez sur **"Installer l'App"** : la invite native du système Android s'ouvre.
3. Validez **"Installer"** : l'application est ajoutée à votre tiroir d'applications et à votre écran d'accueil avec son badge d'application autonome.
4. L'icône adaptative circulaire (**Maskable Icon** `pwa-maskable-512x512.png`) s'ajuste harmonieusement aux thèmes et lanceurs d'Android (One UI, Pixel Launcher, MIUI, etc.).

### 📶 Fonctionnement Hors Ligne & Service Worker
- **Service Worker Workbox** : Met en cache les polices (Google Fonts), les feuilles de style, les images de la carte et les scripts essentiels.
- **Indicateur de connexion en direct** : En cas de coupure réseau, un badge discret prévient l'utilisateur que ses données locales et son panier sont préservés.

---

## 📐 2. Design 100% Responsive & Expérience Utilisateur

L'interface s'adapte sans compromis à toutes les largeurs d'écran : smartphones compacts (360px–390px), grands téléphones (414px–430px), tablettes (iPad) et grands écrans desktop (1440px+).

- **Navigation tactile ergonomique (Thumb Zone)** :
  - Barre de navigation mobile dédiée avec cibles tactiles généreuses ($\ge 44\text{px}$) situées dans la zone naturelle du pouce (*Carte*, *Suivi direct*, *Pause Scolaire*, *Mon Compte*, *Admin*).
  - Troncature intelligente et mise à l'échelle responsive de l'emblème de marque pour éliminer tout débordement horizontal.
- **Modales en Volet Bas (*Bottom-Sheet*) sur Mobile** :
  - Sur smartphone, la personnalisation des plats (*DishModal*) et la connexion (*AuthModal*) s'ouvrent en volet bas tactile avec poignée de glissement, hauteur bornée à `90vh` et boutons d'action fixés en bas.
  - Sur ordinateur, elles s'affichent sous forme de modales centrées avec flou d'arrière-plan.
- **Tiroir Panier Pleine Largeur** :
  - Sur mobile, le panier occupe tout l'espace disponible (`w-full sm:max-w-md`) avec de grands boutons pas-à-pas pour ajuster facilement les quantités.
- **Bannière Flottante de Panier Mobile** :
  - Dès qu'un met est ajouté, une barre flottante élégante affiche le nombre de repas et le montant total en bas d'écran, avec une marge de sécurité (`pb-32`) pour ne masquer aucun contenu.

---

## 🚀 3. Fonctionnalités Clés de la Plateforme

### 🍛 Commande Express par Liste Déroulante
En plus de la grille visuelle des plats, un module de sélection rapide par liste déroulante (`<select>` avec `<optgroup>`) permet aux clients réguliers de choisir instantanément un met parmi toute la carte :
- *Plats traditionnels sénégalais* (Thiéboudienne Rouge Pikin, Yassa poulet fermier, Mafé bœuf fondant, Thiou curry de légumes).
- *Formules Déjeuner & Pause Scolaire* (portion équilibrée pour collèges/lycées/bureaux).
- *Snacks & Pastels croustillants* (Thon pimenté, bœuf haché, alocos).
- *Boissons artisanales maison* (Bissap menthe fraîche, Gingembre tonique, Bouye pain de singe).
- *Desserts africains* (Thiakry vanillé au couscous de mil, beignets Doungous).
- **Aperçu immédiat** avec options de piment (*Doux séparé*, *Sans piment*, *Sauce Kaani*) et compteur de quantité.

### 🛵 Suivi de Livraison en Temps Réel
- Recherche par numéro de commande (ex: `DG-1042`).
- **Barre de progression à 5 étapes** : Confirmée ➔ En cuisine ➔ Prête ➔ En cours de livraison ➔ Remise.
- **Code secret de sécurité à 4 chiffres** mis en évidence pour garantir la remise exclusive au destinataire.
- Informations transport : nom du coursier, caisson isotherme certifié 65°C, destination et journal d'événements.

### 💳 Système de Paiement Sécurisé & Multi-Modèles
- Carte Bancaire (CB, Visa, Mastercard) avec simulation 3D-Secure.
- Apple Pay & Google Pay en 1 clic.
- Wave & Orange Money pour les règlements Mobile Money.
- Transactions chiffrées SSL 256-bit, sans stockage de données bancaires sensibles.

### 🌟 Espace Membre & Fidélité "Teranga"
- **+20 points offerts** à la création du compte (soit 2,00 € de remise immédiate).
- **1 € dépensé = 1 point cumulé**.
- Déduction directe des points dans le panier.
- Carnet d'adresses multiples et réordonnancement en 1 clic de ses commandes passées.

### 🛡️ Tableau de Bord Administrateur (CRUD Complet)
- **Gestion des Utilisateurs** : création, modification des rôles (client, admin, cuisine, livreur), attribution manuelle de points fidélité.
- **Gestion de la Carte des Mets** : ajout de plats, modification des prix, descriptifs, allergènes et rupture de stock d'urgence.
- **Gestion des Commandes & Remboursements** : consultation en temps réel, changement de statut, remboursement avec motif et remise en stock.
- **Gestion des Devis Traiteur (20+ pers.)** : examen des demandes grands groupes, chiffrage et validation.
- **Capacité Horaire & Régulation** : paramétrage du quota maximum de commandes par créneau de 15 minutes (défaut : 15).
- **Journal d'Audit** : traçabilité de toutes les actions administratives.

### 👨‍🍳 Écran Cuisine (KDS) & 🚲 Écran Livreur
- **Cuisine (KDS)** : tri chronologique par créneau de service, alertes sur les restrictions d'allergènes et préparation des sauces pimentées.
- **Livreur** : vérification et validation du code secret à 4 chiffres du client lors de la remise en main propre, avec procédure de dérogation tracée.

---

## 🛠️ 4. Architecture Technique

- **Frontend :** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion.
- **PWA :** `vite-plugin-pwa`, Workbox, Web App Manifest v2.
- **Backend :** Serveur Node.js Express (`server.ts`) avec middlewares Vite montés en développement (`tsx server.ts`).
- **Stockage & Persistance :** Base de données document JSON locale avec écriture atomique et réactivité en mémoire.

### API REST Disponibles
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET / POST` | `/api/products` | Lecture et ajout de plats au catalogue |
| `PATCH / DELETE` | `/api/products/:id` | Mise à jour et suppression d'un plat (CRUD) |
| `GET / POST` | `/api/orders` | Liste des commandes et validation d'une nouvelle commande |
| `PATCH` | `/api/orders/:id/status` | Modification du statut de commande (cuisine/livreur) |
| `POST` | `/api/orders/:id/refund` | Remboursement partiel ou total avec motif |
| `GET` | `/api/slots?date=...&place=...` | Disponibilité en temps réel des créneaux horaires |
| `POST` | `/api/holds` | Réservation temporaire de créneau (10 minutes) pendant le paiement |
| `GET / POST` | `/api/users` | Lecture et inscription / création d'utilisateurs |
| `GET / POST` | `/api/catering` | Demandes de devis traiteur pour groupes |
| `GET` | `/api/stats` | Indicateurs clés de performance (KPIs) et chiffre d'affaires |
| `GET / PATCH` | `/api/config` | Paramétrage de la capacité horaire et suspensions |
| `GET` | `/api/logs` | Journal d'audit des opérations administratives |

---

## 💻 5. Installation & Lancement en Local

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou pnpm

### Démarrage Rapide
```bash
# 1. Cloner le dépôt ou naviguer dans le dossier
cd dibor-gnilane-food

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement full-stack (Port 3000)
npm run dev
```

L'application est immédiatement accessible sur [http://localhost:3000](http://localhost:3000).

### Compilation de Production
```bash
# Construire le bundle client et les assets PWA
npm run build

# Démarrer le serveur de production
npm start
```

---

## 📄 Licence
Projet réalisé avec amour pour **Dibor & Gnilane Food**. Tous droits réservés © 2026.
