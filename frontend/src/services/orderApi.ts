// Order API client for Kanban and order operations
import { KanbanBoardData, KanbanFilters, UserInfo, BusinessInfo } from '../types/kanban';
import { OrderDetails, OrderSearchCriteria, OrderSummary, OrderStatus } from '../types/order';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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
 * Delete an order and all its related data
 * @param orderNumber The order ID to delete
 */
export async function deleteOrder(orderNumber: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to delete order ${orderNumber}`);
  }
}

/**
 * Delete a novedad (note/movement) from an order
 * @param orderNumber The order ID
 * @param novedadId The novedad ID to delete
 */
export async function deleteNovedad(orderNumber: number, novedadId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/novedades/${novedadId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to delete novedad ${novedadId}`);
  }
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

// ============= Payment Methods =============

export interface PaymentMethod {
  id: number;
  nombre: string;
}

/**
 * Fetch all available payment methods
 * @returns Array of PaymentMethod
 */
export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await fetch(`${API_BASE_URL}/api/payment-methods`);
  if (!response.ok) {
    throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
  }
  return response.json();
}

// ============= Retira (Order Pickup) =============

export interface ProcessRetiraRequest {
  monto: number;
  metodoPagoId: number;
  facturado?: boolean;
  tipoFacturaId?: number;
  nroFactura?: string;
  userId?: number;
}

export interface ProcessRetiraResponse {
  orderNumber: number;
  newStatus: string;
  montoRegistrado: number;
  metodoPago: string;
  facturado: boolean;
  ventaId?: number;
  processedAt: string;
}

/**
 * Process a Retira (withdrawal/pickup) action on an order.
 * This marks the order as withdrawn, records the payment, and creates accounting entries.
 * @param orderNumber The order number to process
 * @param request The retira request with monto and payment method
 * @returns ProcessRetiraResponse with the result
 */
export async function processRetira(
  orderNumber: number, 
  request: ProcessRetiraRequest
): Promise<ProcessRetiraResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/retira`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process retira: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Seña (Deposit/Advance Payment) =============

export interface ProcessSenaRequest {
  monto: number;
  metodoPagoId: number;
  facturado?: boolean;
  tipoFacturaId?: number;
  nroFactura?: string;
  userId?: number;
}

export interface ProcessSenaResponse {
  orderNumber: number;
  currentStatus: string;
  montoRegistrado: number;
  metodoPago: string;
  facturado: boolean;
  ventaId?: number;
  novedadId: number;
  processedAt: string;
}

/**
 * Process a Seña (deposit/advance payment) action on an order.
 * This records the deposit, creates a novedad, and creates accounting entries.
 * Unlike Retira, this does NOT change the order status.
 * @param orderNumber The order number to process
 * @param request The seña request with monto and payment method
 * @returns ProcessSenaResponse with the result
 */
export async function processSena(
  orderNumber: number, 
  request: ProcessSenaRequest
): Promise<ProcessSenaResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/sena`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process seña: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Informar Presupuesto =============

export interface InformarPresupuestoRequest {
  accion: 'acepta' | 'rechaza' | 'confirma';
  monto?: number;
  observacion?: string;
}

export interface InformarPresupuestoResponse {
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  accion: string;
  presupuesto: number;
  novedadId: number;
  informadoEn: string;
}

/**
 * Process Informar Presupuesto - informs the customer of the quote
 * @param orderNumber The order number
 * @param request The request with action (acepta/rechaza/confirma), optional new monto, and observacion
 * @returns InformarPresupuestoResponse with result
 */
export async function processInformarPresupuesto(
  orderNumber: number, 
  request: InformarPresupuestoRequest
): Promise<InformarPresupuestoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/informar-presupuesto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process informar presupuesto: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Reingreso (Re-entry) =============

export interface ReingresoRequest {
  observacion: string;
}

export interface ReingresoResponse {
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  novedadId: number;
  observacion: string;
}

/**
 * Process Reingreso - re-entry of equipment after being picked up
 * @param orderNumber The order number
 * @param request The request with observacion (required)
 * @returns ReingresoResponse with result
 */
export async function processReingreso(
  orderNumber: number, 
  request: ReingresoRequest
): Promise<ReingresoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/reingreso`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process reingreso: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Rechaza Presupuesto (Client Rejects Budget) =============

export interface RechazaPresupuestoRequest {
  observacion?: string;
}

export interface RechazaPresupuestoResponse {
  success: boolean;
  message: string;
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  novedadId: number;
}

/**
 * Process Rechaza Presupuesto - CLIENT rejects the budget quote
 * Different from technician rejection (can't repair)
 * @param orderNumber The order number
 * @param request Optional observacion
 * @returns RechazaPresupuestoResponse with result
 */
export async function processRechazaPresupuesto(
  orderNumber: number, 
  request: RechazaPresupuestoRequest
): Promise<RechazaPresupuestoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/rechaza-presupuesto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process rechaza presupuesto: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= TÉCNICO ACTIONS =============

// ============= Presupuesto (Create Budget) =============

export interface PresupuestoRequest {
  monto: number;
  observacion?: string;
}

export interface PresupuestoResponse {
  success: boolean;
  message: string;
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  monto: number;
  trabajo?: string;
  novedadId: number;
}

/**
 * Process Presupuesto - TECHNICIAN creates a budget/quote
 */
export async function processPresupuesto(
  orderNumber: number, 
  request: PresupuestoRequest
): Promise<PresupuestoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/presupuesto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process presupuesto: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Reparado (Mark as Repaired) =============

export interface ReparadoRequest {
  observacion?: string;
}

export interface ReparadoResponse {
  success: boolean;
  message: string;
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  novedadId: number;
}

/**
 * Process Reparado - TECHNICIAN marks order as repaired
 */
export async function processReparado(
  orderNumber: number, 
  request: ReparadoRequest
): Promise<ReparadoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/reparado`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process reparado: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Rechazar (Technician Can't Repair) =============

export interface RechazarRequest {
  observacion: string;
}

export interface RechazarResponse {
  success: boolean;
  message: string;
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  novedadId: number;
}

/**
 * Process Rechazar - TECHNICIAN can't repair (no parts, irreparable)
 */
export async function processRechazar(
  orderNumber: number, 
  request: RechazarRequest
): Promise<RechazarResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/rechazar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process rechazar: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Espera Repuesto (Waiting for Parts) =============

export interface EsperaRepuestoRequest {
  observacion: string;
}

export interface EsperaRepuestoResponse {
  success: boolean;
  message: string;
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  novedadId: number;
}

/**
 * Process Espera Repuesto - TECHNICIAN marks order as waiting for parts
 */
export async function processEsperaRepuesto(
  orderNumber: number, 
  request: EsperaRepuestoRequest
): Promise<EsperaRepuestoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/espera-repuesto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process espera repuesto: ${response.statusText}`);
  }
  
  return response.json();
}

// ============= Rep. Domicilio (Home Repair) =============

export interface RepDomicilioRequest {
  monto: number;
  metodoPagoId: number;
  observacion?: string;
  facturado?: boolean;
  tipoFacturaId?: number;
  nroFactura?: string;
}

export interface RepDomicilioResponse {
  success: boolean;
  message: string;
  orderNumber: number;
  previousStatus: string;
  newStatus: string;
  monto: number;
  novedadId: number;
  ventaId?: number;
}

/**
 * Process Rep. Domicilio - TECHNICIAN completes home repair
 */
export async function processRepDomicilio(
  orderNumber: number, 
  request: RepDomicilioRequest
): Promise<RepDomicilioResponse> {
  const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/rep-domicilio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to process rep domicilio: ${response.statusText}`);
  }
  
  return response.json();
}
