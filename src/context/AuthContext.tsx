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
  switchRole: (role: Role) => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
        // Set default user if none selected
        if (!currentUser && data.users.length > 1) {
          // Default to Marie Diop (client)
          const defaultUser = data.users.find((u: User) => u.id === 'usr_client_1') || data.users[0];
          setCurrentUser(defaultUser);
        }
      }
    } catch (e) {
      console.error('Error fetching users:', e);
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
        setCurrentUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login failed', err);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
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
        setCurrentUser(data.user);
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

  const switchRole = (role: Role) => {
    const userForRole = allUsers.find(u => u.role === role);
    if (userForRole) {
      setCurrentUser(userForRole);
    }
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
        refreshUsers: fetchUsers
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
