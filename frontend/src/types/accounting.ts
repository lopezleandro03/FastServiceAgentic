// Accounting module TypeScript types

export interface PeriodSummary {
  totalWithInvoice: number;
  totalWithoutInvoice: number;
  total: number;
}

export interface SalesSummary {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  year: PeriodSummary;
}

export interface ChartDataset {
  label: string;
  data: number[];
}

export interface SalesChartData {
  period: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface SalesMovement {
  ventaId: number;
  origin: string;
  dni: number | null;
  clientName: string;
  clientLastname: string;
  amount: number;
  description: string | null;
  paymentMethod: string;
  invoiceNumber: string | null;
  date: string;
}

export interface SalesMovementsResponse {
  items: SalesMovement[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  totalAmount: number;
  totalWithInvoice: number;
  totalWithoutInvoice: number;
}

export interface SalesMovementFilter {
  startDate?: string;
  endDate?: string;
  paymentMethodId?: number;
  invoiced?: boolean;
  pointOfSaleId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
  year?: number;
  month?: number;
}

export type ChartPeriod = 'd' | 'w' | 'm' | 'y';

// Time filter presets
export type TimeFilterPreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface PaymentMethod {
  metodoPagoId: number;
  nombre: string;
}
