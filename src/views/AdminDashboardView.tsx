import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { User, Product, Order, CateringQuote, AuditLog, AppConfig, Role, ProductCategory } from '../types/index.ts';
import { formatEuro, formatDateFrench } from '../utils/format.ts';
import {
  Shield,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Search,
  Download,
  AlertCircle,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Clock,
  Sparkles
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { allUsers, refreshUsers } = useAuth();

  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'products' | 'orders' | 'catering' | 'config' | 'logs'>('kpis');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [offMap, setOffMap] = useState<Record<string, boolean>>({});
  const [quotes, setQuotes] = useState<CateringQuote[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<AppConfig>({ cap: 15, hold: 10, stock: {}, off: {} });

  // Users CRUD state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('client');

  // Products CRUD state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<ProductCategory>('plats');
  const [newProdPrice, setNewProdPrice] = useState('11.50');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdAllergens, setNewProdAllergens] = useState('');

  // Refund modal state
  const [refundingOrder, setRefundingOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundCancelOrder, setRefundCancelOrder] = useState(true);

  // Quote editing state
  const [editingQuote, setEditingQuote] = useState<CateringQuote | null>(null);
  const [quotePriceInput, setQuotePriceInput] = useState('');

  // Toast feedback
  const [actionToast, setActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const loadAllAdminData = async () => {
    try {
      const [resStats, resOrders, resProds, resQuotes, resLogs] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/catering'),
        fetch('/api/logs')
      ]);

      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
        if (data.config) setConfig(data.config);
      }
      if (resOrders.ok) {
        const data = await resOrders.json();
        setOrders(data.orders || []);
      }
      if (resProds.ok) {
        const data = await resProds.json();
        setProducts(data.products || []);
        setStockMap(data.stock || {});
        setOffMap(data.off || {});
      }
      if (resQuotes.ok) {
        const data = await resQuotes.json();
        setQuotes(data.quotes || []);
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllAdminData();
    refreshUsers();
  }, []);

  // 1. Users CRUD Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone,
          role: newUserRole,
          status: 'actif'
        })
      });
      if (res.ok) {
        showToast(`Utilisateur ${newUserName} créé avec succès`);
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPhone('');
        await refreshUsers();
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        showToast(`Utilisateur ${editingUser.name} mis à jour`);
        setEditingUser(null);
        await refreshUsers();
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Confirmez-vous la suppression de l'utilisateur ${name} ?`)) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Utilisateur ${name} supprimé`);
        await refreshUsers();
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/status`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Statut utilisateur modifié`);
        await refreshUsers();
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportUsersCsv = () => {
    const headers = ['ID', 'Nom', 'Email', 'Telephone', 'Role', 'Statut', 'Points', 'TotalDepense_EUR'];
    const rows = allUsers.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      u.role,
      u.status,
      u.loyaltyPoints,
      (u.totalSpent / 100).toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `utilisateurs_dibor_gnilane_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Products CRUD Handlers
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const priceCents = Math.round(parseFloat(newProdPrice.replace(',', '.')) * 100);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          cat: newProdCat,
          price: priceCents,
          desc: newProdDesc,
          dailyStock: parseInt(newProdStock, 10) || 20,
          al: newProdAllergens.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (res.ok) {
        showToast(`Plat ${newProdName} ajouté à la carte`);
        setShowAddProductModal(false);
        setNewProdName('');
        setNewProdDesc('');
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        showToast(`Plat ${editingProduct.name} mis à jour`);
        setEditingProduct(null);
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Confirmez-vous le retrait définitif du plat ${name} ?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Plat ${name} retiré`);
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleProductOff = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        showToast(`Disponibilité mise à jour`);
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProductStock = async (id: string, stockVal: string) => {
    try {
      const res = await fetch(`/api/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(stockVal, 10) || 0 })
      });
      if (res.ok) {
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Orders & Refund Handlers
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, operator: 'Administrateur' })
      });
      if (res.ok) {
        showToast(`Statut commande mis à jour : ${newStatus}`);
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingOrder || !refundReason) return;
    try {
      const res = await fetch(`/api/orders/${refundingOrder.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: refundReason,
          cancelOrder: refundCancelOrder,
          operator: 'Admin'
        })
      });
      if (res.ok) {
        showToast(`Remboursement enregistré pour ${refundingOrder.id}`);
        setRefundingOrder(null);
        setRefundReason('');
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Catering Quote status
  const handleUpdateQuote = async (quoteId: string, status: string, price?: number) => {
    try {
      const res = await fetch(`/api/catering/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priceQuoted: price })
      });
      if (res.ok) {
        showToast(`Devis ${quoteId} actualisé`);
        setEditingQuote(null);
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Config update
  const handleUpdateCapacity = async (val: string) => {
    const capNum = Math.max(1, parseInt(val, 10) || 15);
    try {
      const res = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cap: capNum })
      });
      if (res.ok) {
        showToast(`Capacité horaire mise à jour : ${capNum}`);
        await loadAllAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 sm:px-6 lg:px-8">
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#2e1810] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-[#e3a72f]/40 animate-in fade-in duration-200 text-xs font-semibold">
          <Check className="w-4 h-4 text-[#e3a72f]" />
          <span>{actionToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8ded1]">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/logo-embleme.png"
                alt="Logo Dibor & Gnilane"
                className="w-9 h-9 object-contain rounded-xl bg-white p-1 border border-[#e8ded1] shadow-xs"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#2e1810]">
                Portail d’Administration &amp; CRUD
              </h1>
            </div>
            <p className="text-xs text-[#735144] mt-1">
              Gestion centralisée des utilisateurs, de la carte, des stocks, des commandes et des devis traiteur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllAdminData}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#e8ded1] text-xs font-bold text-[#5c3e34] hover:bg-[#faf7f3] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Actualiser les données</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setActiveTab('kpis')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'kpis' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            Vue d’ensemble &amp; KPIs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#e3a72f]" />
            <span>Gestion Utilisateurs ({allUsers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'products' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#e3a72f]" />
            <span>Plats &amp; Carte ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#e3a72f]" />
            <span>Commandes du Jour ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('catering')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'catering' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#e3a72f]" />
            <span>Devis Traiteur 20+ ({quotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'config' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[#e3a72f]" />
            <span>Capacités &amp; Paramètres</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'logs' ? 'bg-[#2e1810] text-white shadow-xs' : 'bg-white border border-[#e8ded1] text-[#5c3e34]'
            }`}
          >
            Journal d’Audit
          </button>
        </div>

        {/* 1. TAB: KPIs */}
        {activeTab === 'kpis' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
                <span className="text-xs text-[#8c6b5d] uppercase font-bold tracking-wider block">
                  Chiffre d’Affaires TTC
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#b8462e] tabular-nums mt-1 block">
                  {formatEuro(stats.todayRevenue)}
                </span>
                <span className="text-[11px] text-[#1f6b42] mt-1 block font-semibold">
                  Paiements encaissés
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
                <span className="text-xs text-[#8c6b5d] uppercase font-bold tracking-wider block">
                  Commandes du jour
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#2e1810] tabular-nums mt-1 block">
                  {stats.todayOrdersCount}
                </span>
                <span className="text-[11px] text-[#735144] mt-1 block">
                  {stats.statusBreakdown?.confirmee || 0} en attente · {stats.statusBreakdown?.preparation || 0} cuisine
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
                <span className="text-xs text-[#8c6b5d] uppercase font-bold tracking-wider block">
                  Portions repas
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#d4652a] tabular-nums mt-1 block">
                  {stats.todayMealsCount}
                </span>
                <span className="text-[11px] text-[#735144] mt-1 block">
                  Dont {stats.schoolMealsCount} formules pause scolaire
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
                <span className="text-xs text-[#8c6b5d] uppercase font-bold tracking-wider block">
                  Clients inscrits
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#e3a72f] tabular-nums mt-1 block">
                  {allUsers.length}
                </span>
                <span className="text-[11px] text-[#735144] mt-1 block">
                  Comptes membres actifs
                </span>
              </div>
            </div>

            {/* Capacity load bar */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8ded1] shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#2e1810]">
                  Taux d’utilisation de la capacité globale ({stats.slotsUtilization?.used} / {stats.slotsUtilization?.cap} créneaux)
                </span>
                <span className="font-bold text-[#d4652a] tabular-nums">
                  {Math.round((stats.slotsUtilization?.used / (stats.slotsUtilization?.cap || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[#f3ece4] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#d4652a] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (stats.slotsUtilization?.used / (stats.slotsUtilization?.cap || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: Users CRUD */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#2e1810]">
                  Tableau de bord Utilisateurs (CRUD Complet)
                </h2>
                <p className="text-xs text-[#735144]">
                  Gérez les profils clients, rôles du personnel (Cuisine, Livreur, Admin), blocages et points fidélité.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportUsersCsv}
                  className="px-3.5 py-2 rounded-xl border border-[#e8ded1] hover:bg-[#faf7f3] text-xs font-bold text-[#5c3e34] flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#2e1810] text-[#f7ece1] text-xs font-bold hover:bg-[#432317] flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#e3a72f]" />
                  <span>Ajouter un utilisateur</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Rechercher par nom, e-mail ou téléphone..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#faf7f3] border border-[#e8ded1] text-xs focus:outline-none focus:ring-2 focus:ring-[#d4652a]"
                />
                <Search className="w-4 h-4 text-[#8c6b5d] absolute left-3 top-2.5" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#faf7f3] border border-[#e8ded1] text-xs font-semibold text-[#5c3e34] focus:outline-none"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="client">Clients uniquement</option>
                  <option value="cuisine">Personnel Cuisine</option>
                  <option value="livreur">Livreurs / Coursiers</option>
                  <option value="admin">Administrateurs</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-[#ede2d6] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf7f3] border-b border-[#ede2d6] text-[#735144]">
                    <th className="p-3.5 font-bold">Nom &amp; Coordonnées</th>
                    <th className="p-3.5 font-bold">Rôle</th>
                    <th className="p-3.5 font-bold">Statut</th>
                    <th className="p-3.5 font-bold">Points Fidélité</th>
                    <th className="p-3.5 font-bold">Total Dépensé</th>
                    <th className="p-3.5 font-bold text-right">Actions CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede2d6]">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#fdfaf6] transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-[#2e1810]">{user.name}</div>
                        <div className="text-[11px] text-[#8c6b5d]">{user.email} · {user.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'cuisine'
                            ? 'bg-orange-100 text-orange-800'
                            : user.role === 'livreur'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                            user.status === 'actif'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {user.status === 'actif' ? 'Actif' : 'Suspendu'}
                        </button>
                      </td>
                      <td className="p-3.5 font-bold tabular-nums text-[#8c5912]">
                        {user.loyaltyPoints} pts
                      </td>
                      <td className="p-3.5 font-bold tabular-nums text-[#2e1810]">
                        {formatEuro(user.totalSpent)}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1.5 rounded-lg border border-[#e8ded1] text-[#5c3e34] hover:bg-[#faf7f3]"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TAB: Products CRUD */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#2e1810]">
                  Gestion de la Carte &amp; Stocks du Jour (CRUD)
                </h2>
                <p className="text-xs text-[#735144]">
                  Ajoutez de nouvelles recettes, ajustez les prix, activez ou masquez les plats et gérez les stocks journaliers.
                </p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-4 py-2 rounded-xl bg-[#d4652a] text-white text-xs font-bold hover:bg-[#b8462e] flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un plat à la carte</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto border border-[#ede2d6] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf7f3] border-b border-[#ede2d6] text-[#735144]">
                    <th className="p-3.5 font-bold">Plat &amp; Catégorie</th>
                    <th className="p-3.5 font-bold">Prix TTC</th>
                    <th className="p-3.5 font-bold">Stock du Jour</th>
                    <th className="p-3.5 font-bold">En Vente</th>
                    <th className="p-3.5 font-bold text-right">Actions CRUD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede2d6]">
                  {products.map(prod => {
                    const isOff = !!offMap[prod.id];
                    const currentStock = stockMap[prod.id] !== undefined ? stockMap[prod.id] : 30;

                    return (
                      <tr key={prod.id} className="hover:bg-[#fdfaf6] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#2e1810]">{prod.name}</div>
                          <div className="text-[11px] text-[#8c6b5d] uppercase">{prod.cat} {prod.al?.length ? `· Allergènes : ${prod.al.join(', ')}` : ''}</div>
                        </td>
                        <td className="p-3.5 font-bold tabular-nums text-[#b8462e]">
                          {formatEuro(prod.price)}
                        </td>
                        <td className="p-3.5">
                          <input
                            type="number"
                            min="0"
                            max="999"
                            defaultValue={currentStock}
                            onBlur={e => handleUpdateProductStock(prod.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg border border-[#e8ded1] text-center font-bold tabular-nums"
                          />
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleProductOff(prod.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                              !isOff
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-300'
                            }`}
                          >
                            {!isOff ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{!isOff ? 'En vente' : 'Masqué'}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1.5 rounded-lg border border-[#e8ded1] text-[#5c3e34] hover:bg-[#faf7f3]"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. TAB: Orders Management */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-[#2e1810]">
                  Gestion des Commandes
                </h2>
                <p className="text-xs text-[#735144]">
                  Avancement des étapes, remboursements avec motif et suivi en temps réel.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#ede2d6] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf7f3] border-b border-[#ede2d6] text-[#735144]">
                    <th className="p-3.5 font-bold">N° Commande</th>
                    <th className="p-3.5 font-bold">Client &amp; Contact</th>
                    <th className="p-3.5 font-bold">Horaire &amp; Remise</th>
                    <th className="p-3.5 font-bold">Total TTC</th>
                    <th className="p-3.5 font-bold">Code Secret</th>
                    <th className="p-3.5 font-bold">Statut Actuel</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede2d6]">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-[#fdfaf6] transition-colors">
                      <td className="p-3.5 font-bold text-[#2e1810]">
                        {order.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[#2e1810]">{order.name}</div>
                        <div className="text-[11px] text-[#8c6b5d]">{order.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#d4652a]">{order.time}</span> · {order.place}
                      </td>
                      <td className="p-3.5 font-bold tabular-nums text-[#b8462e]">
                        {formatEuro(order.total)}
                      </td>
                      <td className="p-3.5 font-mono font-bold tracking-wider text-[#2e1810]">
                        {order.code}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-2 py-1 rounded-lg border border-[#e8ded1] bg-white text-xs font-semibold focus:outline-none"
                        >
                          <option value="confirmee">Confirmée</option>
                          <option value="preparation">En préparation</option>
                          <option value="prete">Prête</option>
                          <option value="livraison">En livraison</option>
                          <option value="livree">Remise / Livrée</option>
                          <option value="annulee">Annulée</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {order.pay === 'payé' && (
                          <button
                            onClick={() => setRefundingOrder(order)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 font-semibold"
                          >
                            Rembourser
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. TAB: Catering Quotes */}
        {activeTab === 'catering' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-5">
            <h2 className="text-xl font-bold font-display text-[#2e1810]">
              Demandes de Devis Traiteur (20+ personnes)
            </h2>
            <div className="overflow-x-auto border border-[#ede2d6] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf7f3] border-b border-[#ede2d6] text-[#735144]">
                    <th className="p-3.5 font-bold">N° Devis</th>
                    <th className="p-3.5 font-bold">Date Événement</th>
                    <th className="p-3.5 font-bold">Formule</th>
                    <th className="p-3.5 font-bold">Convives</th>
                    <th className="p-3.5 font-bold">Contact</th>
                    <th className="p-3.5 font-bold">Statut</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede2d6]">
                  {quotes.map(q => (
                    <tr key={q.id} className="hover:bg-[#fdfaf6]">
                      <td className="p-3.5 font-bold text-[#2e1810]">{q.id}</td>
                      <td className="p-3.5 font-semibold">{q.date}</td>
                      <td className="p-3.5">{q.offer}</td>
                      <td className="p-3.5 font-bold tabular-nums">{q.n} pers.</td>
                      <td className="p-3.5">
                        <div className="font-semibold">{q.contact}</div>
                        <div className="text-[11px] text-[#8c6b5d]">{q.phone}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingQuote(q);
                            setQuotePriceInput(q.priceQuoted ? (q.priceQuoted / 100).toString() : '');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#2e1810] text-white font-bold"
                        >
                          Gérer le devis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. TAB: Capacity & Settings */}
        {activeTab === 'config' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ded1] shadow-xs space-y-6 max-w-2xl">
            <h2 className="text-xl font-bold font-display text-[#2e1810]">
              Paramètres de Capacité &amp; Réservations
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2e1810] block mb-1">
                  Capacité maximale de commandes par créneau de 30 minutes
                </label>
                <p className="text-[11px] text-[#8c6b5d] mb-2">
                  Au-delà de cette valeur, le créneau horaire bascule automatiquement en "Complet".
                </p>
                <input
                  type="number"
                  min="1"
                  max="100"
                  defaultValue={config.cap}
                  onBlur={e => handleUpdateCapacity(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl border border-[#e8ded1] font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="font-bold text-[#2e1810] block mb-1">
                  Durée de réservation temporaire (minutes)
                </label>
                <p className="text-[11px] text-[#8c6b5d] mb-2">
                  Délai alloué au client pour finaliser son paiement avant libération automatique.
                </p>
                <input
                  type="number"
                  min="5"
                  max="30"
                  defaultValue={config.hold}
                  disabled
                  className="w-24 px-3 py-2 rounded-xl border border-[#e8ded1] bg-gray-50 font-bold tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB: Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl p-6 border border-[#e8ded1] shadow-xs space-y-4">
            <h2 className="text-xl font-bold font-display text-[#2e1810]">
              Journal d’Audit &amp; Traçabilité Sécurité
            </h2>
            <div className="space-y-2 text-xs">
              {logs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-[#faf7f3] border border-[#ede2d6] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#2e1810]">{log.what}</span>
                    {log.ref && <span className="text-[#d4652a] font-mono ml-2">[{log.ref}]</span>}
                    <span className="text-[#8c6b5d] ml-2">par {log.user || 'Opérateur'}</span>
                  </div>
                  <span className="text-[11px] text-[#8c6b5d] font-mono tabular-nums">
                    {new Date(log.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleCreateUser} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <h3 className="text-base font-bold font-display text-[#2e1810]">
              Ajouter un utilisateur
            </h3>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Nom complet</label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">E-mail</label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={e => setNewUserEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Téléphone</label>
              <input
                type="tel"
                required
                value={newUserPhone}
                onChange={e => setNewUserPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Rôle d’accès</label>
              <select
                value={newUserRole}
                onChange={e => setNewUserRole(e.target.value as Role)}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              >
                <option value="client">Client</option>
                <option value="cuisine">Personnel Cuisine (KDS)</option>
                <option value="livreur">Livreur / Remise</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e8ded1]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#2e1810] text-white font-bold"
              >
                Créer l’utilisateur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleUpdateUser} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <h3 className="text-base font-bold font-display text-[#2e1810]">
              Modifier l’utilisateur
            </h3>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Nom</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Téléphone</label>
              <input
                type="tel"
                value={editingUser.phone}
                onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Rôle</label>
              <select
                value={editingUser.role}
                onChange={e => setEditingUser({ ...editingUser, role: e.target.value as Role })}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              >
                <option value="client">Client</option>
                <option value="cuisine">Cuisine</option>
                <option value="livreur">Livreur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Points Fidélité</label>
              <input
                type="number"
                value={editingUser.loyaltyPoints}
                onChange={e => setEditingUser({ ...editingUser, loyaltyPoints: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-[#e8ded1]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#d4652a] text-white font-bold"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add Product */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleCreateProduct} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <h3 className="text-base font-bold font-display text-[#2e1810]">
              Ajouter une nouvelle création culinaire
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="font-semibold text-[#5c3e34] block mb-1">Nom du plat</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dibi d'agneau grillé"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Catégorie</label>
                <select
                  value={newProdCat}
                  onChange={e => setNewProdCat(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                >
                  <option value="plats">Plats africains</option>
                  <option value="formules">Formules</option>
                  <option value="scolaire">Formules scolaires</option>
                  <option value="snacks">Snacks</option>
                  <option value="boissons">Boissons</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Prix TTC (€)</label>
                <input
                  type="text"
                  required
                  placeholder="11.50"
                  value={newProdPrice}
                  onChange={e => setNewProdPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>
              <div className="col-span-2">
                <label className="font-semibold text-[#5c3e34] block mb-1">Description des ingrédients</label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  placeholder="Marinade aux oignons, épices traditionnelles, riz blanc..."
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Stock initial du jour</label>
                <input
                  type="number"
                  value={newProdStock}
                  onChange={e => setNewProdStock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#5c3e34] block mb-1">Allergènes (séparés par virgule)</label>
                <input
                  type="text"
                  placeholder="Arachide, Poisson"
                  value={newProdAllergens}
                  onChange={e => setNewProdAllergens(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e8ded1]"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#d4652a] text-white font-bold"
              >
                Ajouter à la carte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Refund Order */}
      {refundingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleConfirmRefund} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <h3 className="text-base font-bold font-display text-[#2e1810]">
              Rembourser la commande {refundingOrder.id}
            </h3>
            <p className="text-[#735144]">
              Montant à recréditer sur le compte client : <strong className="text-[#b8462e]">{formatEuro(refundingOrder.total)}</strong>.
            </p>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">
                Motif obligatoire (consigné dans le journal d’audit)
              </label>
              <textarea
                required
                rows={3}
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="Ex: Retard exceptionnel accepté par le client / Rupture d'ingrédient..."
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-[#5c3e34]">
              <input
                type="checkbox"
                checked={refundCancelOrder}
                onChange={e => setRefundCancelOrder(e.target.checked)}
                className="w-4 h-4 rounded text-[#d4652a]"
              />
              <span>Marquer la commande comme "Annulée" en cuisine</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRefundingOrder(null)}
                className="px-4 py-2 rounded-xl border border-[#e8ded1]"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Valider le remboursement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Catering Quote Price Edit */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#e8ded1] shadow-2xl text-xs">
            <h3 className="text-base font-bold font-display text-[#2e1810]">
              Devis {editingQuote.id} ({editingQuote.n} personnes)
            </h3>
            <div className="space-y-1 text-[#735144]">
              <p><strong>Formule :</strong> {editingQuote.offer}</p>
              <p><strong>Lieu :</strong> {editingQuote.place}</p>
              <p><strong>Notes :</strong> {editingQuote.notes}</p>
            </div>
            <div>
              <label className="font-semibold text-[#5c3e34] block mb-1">Montant global TTC (€)</label>
              <input
                type="text"
                value={quotePriceInput}
                onChange={e => setQuotePriceInput(e.target.value)}
                placeholder="Ex: 560"
                className="w-full px-3 py-2 rounded-xl border border-[#e8ded1]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingQuote(null)}
                className="px-3 py-1.5 rounded-xl border border-[#e8ded1]"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  const cents = Math.round(parseFloat(quotePriceInput) * 100);
                  handleUpdateQuote(editingQuote.id, 'Devis envoyé', cents);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#d4652a] text-white font-bold"
              >
                Envoyer le devis au client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
