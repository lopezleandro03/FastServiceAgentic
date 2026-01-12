import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthState, UserPermissions } from '../types/auth';
import { login as loginApi, getUserPermissions } from '../services/authApi';

const STORAGE_KEY = 'fastservice_user';
const PERMISSIONS_STORAGE_KEY = 'fastservice_permissions';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  permissions: UserPermissions | null;
  isLoadingPermissions: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on mount (session never expires)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [permissions, setPermissions] = useState<UserPermissions | null>(() => {
    // Load permissions from localStorage on mount
    const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  const isAuthenticated = user !== null;

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Persist permissions to localStorage whenever it changes
  useEffect(() => {
    if (permissions) {
      localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    } else {
      localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
    }
  }, [permissions]);

  // Fetch permissions when user changes (login or page refresh with user)
  useEffect(() => {
    const fetchPermissions = async () => {
      if (user && !permissions) {
        setIsLoadingPermissions(true);
        try {
          const perms = await getUserPermissions(user.userId);
          setPermissions(perms);
        } catch (err) {
          console.error('Error fetching permissions:', err);
          // Set default permissions to allow basic access
          setPermissions({
            userId: user.userId,
            userName: `${user.nombre} ${user.apellido}`,
            roles: [],
            allowedMenuItems: [],
            canAccessAccounting: false,
            canAccessOrders: true,
            canAccessKanban: true,
          });
        } finally {
          setIsLoadingPermissions(false);
        }
      }
    };

    fetchPermissions();
  }, [user, permissions]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedInUser = await loginApi(credentials);
    setUser(loggedInUser);
    setPermissions(null); // Clear permissions so they get fetched for new user
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setPermissions(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PERMISSIONS_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, permissions, isLoadingPermissions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
