import { ClientsListResponse, ClientDetails, ClientAutocomplete } from '../types/client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export async function getClients(
  search?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ClientsListResponse> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  const response = await fetch(`${API_BASE_URL}/api/clients?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Error al obtener clientes');
  }
  return response.json();
}

export async function getClientDetails(clienteId: number): Promise<ClientDetails> {
  const response = await fetch(`${API_BASE_URL}/api/clients/${clienteId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Cliente no encontrado');
    }
    throw new Error('Error al obtener detalles del cliente');
  }
  return response.json();
}

export async function getClientByDni(dni: string): Promise<ClientAutocomplete | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clients/by-dni/${dni}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Error al buscar cliente por DNI');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching client by DNI:', error);
    return null;
  }
}

export async function searchClients(prefix: string, maxResults: number = 10): Promise<ClientAutocomplete[]> {
  if (!prefix || prefix.length < 2) {
    return [];
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/clients/search/${encodeURIComponent(prefix)}?maxResults=${maxResults}`);
    if (!response.ok) {
      throw new Error('Error al buscar clientes');
    }
    return response.json();
  } catch (error) {
    console.error('Error searching clients:', error);
    return [];
  }
}
