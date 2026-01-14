// Kanban Board Types - matching contracts/kanban-api.yaml

export interface KanbanBoardData {
  columns: KanbanColumn[];
  totalOrders: number;
  generatedAt: string;
}

export interface KanbanColumn {
  columnId: KanbanColumnId;
  displayName: string;
  orderCount: number;
  orders: KanbanOrderCard[];
}

export type KanbanColumnId = 
  | 'INGRESADO'
  | 'PRESUPUESTADO'
  | 'ESP_REPUESTO'
  | 'A_REPARAR'
  | 'REPARADO'
  | 'RECHAZADO'
  | 'RECHAZO_PRESUP';

export interface KanbanOrderCard {
  orderNumber: number;
  customerName: string;
  deviceSummary: string;
  technicianId: number;
  technicianName: string;
  responsibleName: string;
  isWarranty: boolean;
  isDomicile: boolean;
  isReentry: boolean;
  daysSinceNotification: number | null;
  lastActivityDate: string;
}

export interface KanbanFilters {
  technicianId?: number;
  responsibleId?: number;
  businessId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface UserInfo {
  id: number;
  name: string;
}

export interface BusinessInfo {
  id: number;
  name: string;
}
