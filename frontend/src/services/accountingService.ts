// Accounting API service

import {
  SalesSummary,
  SalesChartData,
  SalesMovementsResponse,
  SalesMovementFilter,
  ChartPeriod,
  PaymentMethod,
} from '../types/accounting';

const API_BASE = 'http://localhost:5207/api';

export async function fetchSalesSummary(): Promise<SalesSummary> {
  const response = await fetch(`${API_BASE}/accounting/sales-summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales summary');
  }
  return response.json();
}

export async function fetchSalesChart(
  period: ChartPeriod,
  year?: number,
  month?: number
): Promise<SalesChartData> {
  const params = new URLSearchParams();
  params.append('period', period);
  if (year) params.append('year', year.toString());
  if (month !== undefined && month !== null) params.append('month', (month + 1).toString()); // Convert 0-based to 1-based
  
  const response = await fetch(`${API_BASE}/accounting/sales-chart?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales chart data');
  }
  return response.json();
}

export async function fetchSalesMovements(
  filter: SalesMovementFilter
): Promise<SalesMovementsResponse> {
  const params = new URLSearchParams();
  
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.paymentMethodId) params.append('paymentMethodId', filter.paymentMethodId.toString());
  if (filter.invoiced !== undefined) params.append('invoiced', filter.invoiced.toString());
  if (filter.pointOfSaleId) params.append('pointOfSaleId', filter.pointOfSaleId.toString());
  if (filter.page) params.append('page', filter.page.toString());
  if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());
  if (filter.sortBy) params.append('sortBy', filter.sortBy);
  if (filter.sortDesc !== undefined) params.append('sortDesc', filter.sortDesc.toString());

  const response = await fetch(`${API_BASE}/accounting/sales-movements?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch sales movements');
  }
  return response.json();
}

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const response = await fetch(`${API_BASE}/payment-methods`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  return response.json();
}

/**
 * Generate AI insights for accounting data
 */
export async function generateAccountingInsights(): Promise<string> {
  try {
    // Fetch current summary data
    const summary = await fetchSalesSummary();
    
    // Build insights message
    const insights: string[] = [];
    
    // Header
    insights.push("📊 **Resumen de Contabilidad**\n");
    
    // Today's sales
    if (summary.today) {
      const todayTotal = summary.today.total;
      insights.push(`**Hoy:** $${todayTotal.toLocaleString('es-AR')}`);
      if (summary.today.totalWithInvoice > 0) {
        insights.push(`  - Con factura: $${summary.today.totalWithInvoice.toLocaleString('es-AR')}`);
      }
      if (summary.today.totalWithoutInvoice > 0) {
        insights.push(`  - Sin factura: $${summary.today.totalWithoutInvoice.toLocaleString('es-AR')}`);
      }
    }
    
    // This week
    if (summary.week) {
      const weekTotal = summary.week.total;
      insights.push(`\n**Esta semana:** $${weekTotal.toLocaleString('es-AR')}`);
    }
    
    // This month
    if (summary.month) {
      const monthTotal = summary.month.total;
      insights.push(`\n**Este mes:** $${monthTotal.toLocaleString('es-AR')}`);
      
      // Invoicing rate
      if (monthTotal > 0) {
        const invoicedPercent = Math.round((summary.month.totalWithInvoice / monthTotal) * 100);
        insights.push(`**Tasa de facturación:** ${invoicedPercent}% del total mensual`);
      }
    }
    
    // This year
    if (summary.year) {
      const yearTotal = summary.year.total;
      insights.push(`\n**Este año:** $${yearTotal.toLocaleString('es-AR')}`);
    }
    
    // Add a helpful note
    insights.push("\n💡 *Puedes consultarme sobre tendencias, comparaciones, o cualquier duda sobre los datos.*");
    
    return insights.join('\n');
  } catch (error) {
    console.error('Error generating accounting insights:', error);
    return "No pude obtener los datos de contabilidad. Por favor, intenta de nuevo más tarde.";
  }
}
