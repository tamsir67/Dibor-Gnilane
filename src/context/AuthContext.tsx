import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.ts';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  isLoading: boolean;
  login: (userId: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { name: string; email: string; phone: string; street?: string; city?: string; zip?: string }) => Promise<User | null>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  /** Active le profil demandé. Renvoie false si aucun compte de ce profil n'a pu être chargé. */
  switchRole: (role: Role) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Le profil actif est mémorisé dans le navigateur : il reste le même après un rechargement de la page.
  const STORAGE_KEY = 'dg-profil-actif';
  const remember = (u: User | null) => {
    try {
      if (u) localStorage.setItem(STORAGE_KEY, u.id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* stockage indisponible (navigation privée) */ }
  };
  const selectUser = (u: User | null) => { setCurrentUser(u); remember(u); };

  const fetchUsers = async (): Promise<User[]> => {
    try {
      const res = await fetch('/api/users', { headers: { accept: 'application/json' } });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || !type.includes('application/json')) throw new Error(`API indisponible (${res.status})`);
      const data = await res.json();
      const users: User[] = data.users || [];
      setAllUsers(users);
      setCurrentUser((cur) => {
        if (cur) return users.find((u) => u.id === cur.id) || cur;
        let savedId: string | null = null;
        try { savedId = localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
        return users.find((u) => u.id === savedId) || users.find((u) => u.id === 'usr_client_1') || users.find((u) => u.role === 'client') || null;
      });
      return users;
    } catch (e) {
      console.error('Chargement des utilisateurs impossible :', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const login = async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        selectUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  };

  const logout = () => {
    selectUser(null);
  };

  const register = async (userData: {
    name: string;
    email: string;
    phone: string;
    street?: string;
    city?: string;
    zip?: string;
  }): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await res.json();
        selectUser(data.user);
        await fetchUsers();
        return data.user;
      }
      return null;
    } catch (err) {
      console.error('Registration failed', err);
      return null;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ ...data, id: currentUser.id })
      });
      if (res.ok) {
        const resp = await res.json();
        setCurrentUser(resp.user);
        await fetchUsers();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update profile failed', err);
      return false;
    }
  };

  const switchRole = async (role: Role): Promise<boolean> => {
    if (currentUser?.role === role) return true;
    // Si la liste n'est pas encore chargée (démarrage à froid du serveur), on la recharge avant de changer.
    const users = allUsers.length ? allUsers : await fetchUsers();
    const userForRole = users.find((u) => u.role === role && u.status !== 'suspendu');
    if (!userForRole) return false;
    selectUser(userForRole);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        switchRole,
        refreshUsers: async () => { await fetchUsers(); }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
