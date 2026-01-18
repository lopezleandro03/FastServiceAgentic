const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface AdminItem {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  modificadoEn: string | null;
  modificadoPor: number | null;
}

export interface AdminItemCreateRequest {
  nombre: string;
  descripcion?: string;
  userId: number;
}

export interface AdminItemUpdateRequest {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  userId: number;
}

// Device Types (Tipos)
export async function getDeviceTypes(): Promise<AdminItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/device-types`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al obtener tipos de dispositivo');
  }
  return response.json();
}

export async function createDeviceType(request: AdminItemCreateRequest): Promise<AdminItem> {
  const response = await fetch(`${API_BASE_URL}/api/admin/device-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al crear tipo de dispositivo');
  }
  return response.json();
}

export async function updateDeviceType(id: number, request: AdminItemUpdateRequest): Promise<AdminItem> {
  const response = await fetch(`${API_BASE_URL}/api/admin/device-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al actualizar tipo de dispositivo');
  }
  return response.json();
}

export async function toggleDeviceType(id: number, userId: number): Promise<AdminItem> {
  const response = await fetch(`${API_BASE_URL}/api/admin/device-types/${id}/toggle?userId=${userId}`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al cambiar estado');
  }
  return response.json();
}

export async function deleteDeviceType(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/device-types/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al eliminar tipo de dispositivo');
  }
}

// Brands (Marcas)
export async function getBrands(): Promise<AdminItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/brands`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al obtener marcas');
  }
  return response.json();
}

export async function createBrand(request: AdminItemCreateRequest): Promise<AdminItem> {
  const response = await fetch(`${API_BASE_URL}/api/admin/brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al crear marca');
  }
  return response.json();
}

export async function updateBrand(id: number, request: AdminItemUpdateRequest): Promise<AdminItem> {
  const response = await fetch(`${API_BASE_URL}/api/admin/brands/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al actualizar marca');
  }
  return response.json();
}

export async function toggleBrand(id: number, userId: number): Promise<AdminItem> {
  const response = await fetch(`${API_BASE_URL}/api/admin/brands/${id}/toggle?userId=${userId}`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al cambiar estado');
  }
  return response.json();
}

export async function deleteBrand(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/brands/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Error al eliminar marca');
  }
}
