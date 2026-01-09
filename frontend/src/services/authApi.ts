// Authentication API client
import { User, LoginCredentials } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5207';

/**
 * Login with credentials against Usuario table
 * @param credentials Login (email or username) and password
 * @returns User info on success, throws on failure
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (response.status === 401) {
    throw new Error('Credenciales inválidas');
  }

  if (!response.ok) {
    throw new Error(`Error de autenticación: ${response.statusText}`);
  }

  return response.json();
}
