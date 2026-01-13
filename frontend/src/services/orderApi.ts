// Order API client for Kanban and order operations
import { KanbanBoardData, KanbanFilters, UserInfo, BusinessInfo } from '../types/kanban';
import { OrderDetails, OrderSearchCriteria, OrderSummary, OrderStatus } from '../types/order';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5207';

/**
 * Search orders with advanced criteria
 * @param criteria Search criteria including model, status, customer name, etc.
 * @returns Array of OrderSummary matching the criteria
 */
export async function searchOrders(criteria: OrderSearchCriteria): Promise<OrderSummary[]> {
  const params = new URLSearchParams();
  
  if (criteria.orderNumber) {
    params.append('orderNumber', criteria.orderNumber.toString());
  }
  if (criteria.customerName) {
    params.append('customerName', criteria.customerName);
  }
  if (criteria.dni) {
    params.append('dni', criteria.dni);
  }
  if (criteria.status) {
    params.append('status', criteria.status);
  }
  if (criteria.statuses && criteria.statuses.length > 0) {
    criteria.statuses.forEach(s => params.append('statuses', s));
  }
  if (criteria.brand) {
    params.append('brand', criteria.brand);
  }
  if (criteria.deviceType) {
    params.append('deviceType', criteria.deviceType);
  }
  if (criteria.model) {
    params.append('model', criteria.model);
  }
  if (criteria.fromDate) {
    params.append('fromDate', criteria.fromDate);
  }
  if (criteria.toDate) {
    params.append('toDate', criteria.toDate);
  }
  if (criteria.maxResults) {
    params.append('maxResults', criteria.maxResults.toString());
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/orders/search${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to search orders: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all available repair statuses
 * @returns Array of OrderStatus
 */
export async function fetchStatuses(): Promise<OrderStatus[]> {
  const response = await fetch(`${API_BASE_URL}/api/statuses`);
  if (!response.ok) {
    throw new Error(`Failed to fetch statuses: ${response.statusText}`);
  }
  return response.json();
}

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
