// Auth types for login functionality

export interface User {
  userId: number;
  login: string;
  email: string;
  nombre: string;
  apellido: string;
}

export interface LoginCredentials {
  login: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Permission types

export interface UserRole {
  roleId: number;
  name: string;
}

export interface MenuItem {
  itemMenuId: number;
  name: string;
  controller: string | null;
  action: string | null;
  icon: string | null;
  order: number;
}

export interface UserPermissions {
  userId: number;
  userName: string;
  roles: UserRole[];
  allowedMenuItems: MenuItem[];
  canAccessAccounting: boolean;
  canAccessOrders: boolean;
  canAccessKanban: boolean;
  // Role-based action permissions
  isManager: boolean;  // Gerente - sees all actions with collapsible groups
  isAdmin: boolean;  // FastServiceAdmin, Gerente, ElectroShopAdmin
  isTecnico: boolean;  // Tecnico role
}
