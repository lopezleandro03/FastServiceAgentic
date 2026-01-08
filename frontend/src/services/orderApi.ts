// Order API client for Kanban and order operations
import { KanbanBoardData, KanbanFilters, UserInfo, BusinessInfo } from '../types/kanban';
import { OrderDetails } from '../types/order';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5207';

/**
 * Fetch Kanban board data with orders grouped by status
 * @param filters Optional filters for technician, responsible, business, and date range
 * @returns KanbanBoardData with 6 fixed columns
 */
export async function fetchKanbanBoard(filters?: KanbanFilters): Promise<KanbanBoardData> {
  const params = new URLSearchParams();
  
  if (filters?.technicianId) {
    params.append('technicianId', filters.technicianId.toString());
  }
  if (filters?.responsibleId) {
    params.append('responsibleId', filters.responsibleId.toString());
  }
  if (filters?.businessId) {
    params.append('businessId', filters.businessId.toString());
  }
  if (filters?.fromDate) {
    params.append('fromDate', filters.fromDate);
  }
  if (filters?.toDate) {
    params.append('toDate', filters.toDate);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/orders/kanban${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Kanban board: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch order details by order number
 * @param orderNumber The order ID to fetch
 * @returns OrderDetails
 */
export async function fetchOrderDetails(orderNumber: number): Promise<OrderDetails> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch order ${orderNumber}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch list of technicians for filter dropdown
 * @returns Array of UserInfo
 */
export async function fetchTechnicians(): Promise<UserInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/technicians`);
  if (!response.ok) {
    throw new Error(`Failed to fetch technicians: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch list of responsible employees for filter dropdown
 * @returns Array of UserInfo
 */
export async function fetchResponsibles(): Promise<UserInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/responsibles`);
  if (!response.ok) {
    throw new Error(`Failed to fetch responsibles: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch list of businesses for filter dropdown
 * @returns Array of BusinessInfo
 */
export async function fetchBusinesses(): Promise<BusinessInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/businesses`);
  if (!response.ok) {
    throw new Error(`Failed to fetch businesses: ${response.statusText}`);
  }
  return response.json();
}
