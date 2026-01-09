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
