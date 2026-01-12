# Accounting Module - Sales Dashboard with Drill-Down

## Overview
Implement a modern Accounting/Contabilidad module that displays sales (Ventas) data over time with the ability to drill down into individual sales movements (transactions). The module renders on the left panel with AI assistance available on the right.

## User Stories

### US-001: View Sales Summary
**As a** business user  
**I want to** see a summary of sales for different time periods  
**So that** I can quickly understand business performance

**Acceptance Criteria:**
- Display sales totals for Today, This Week, This Month, This Year
- Show breakdown by invoiced (Con Factura) vs non-invoiced (Sin Factura)
- Summary cards are clickable to filter the chart
- Amounts formatted in Argentine Peso format

### US-002: Interactive Sales Chart
**As a** business user  
**I want to** see sales trends visualized in a chart  
**So that** I can identify patterns and anomalies

**Acceptance Criteria:**
- Area chart showing sales over time
- Toggle between daily/weekly/monthly/yearly views
- Stacked areas for invoiced vs non-invoiced sales
- Hover tooltips with detailed values
- Click on chart points to drill down to movements

### US-003: Drill-Down to Sales Movements
**As a** business user  
**I want to** click on a chart point or summary card to see underlying transactions  
**So that** I can investigate specific sales

**Acceptance Criteria:**
- Clicking a chart point shows movements for that date/period
- Data table with columns: ID, Origin, DNI, Name, Lastname, Amount, Description, Payment Method, Invoice, Date
- Sortable and filterable columns
- Pagination for large datasets
- Back button to return to overview

### US-004: Filter Sales Data
**As a** business user  
**I want to** filter sales by various criteria  
**So that** I can focus on specific segments

**Acceptance Criteria:**
- Filter by date range (from/to)
- Filter by payment method (Efectivo, Transferencia, etc.)
- Filter by invoiced status
- Filter by point of sale origin
- Filters persist across view changes

### US-005: AI-Assisted Insights
**As a** business user  
**I want to** ask the AI about my sales data  
**So that** I can get insights without manual analysis

**Acceptance Criteria:**
- Ask questions like "¿Cuánto vendimos hoy?" or "¿Cuál es el total del mes?"
- AI can provide summaries and comparisons
- Natural language queries about trends

## Technical Requirements

### Backend API Endpoints

#### GET /api/accounting/sales-summary
Returns aggregated sales data for all time periods.

**Response:**
```json
{
  "today": {
    "totalWithInvoice": 0,
    "totalWithoutInvoice": 410000,
    "total": 410000
  },
  "week": {
    "totalWithInvoice": 0,
    "totalWithoutInvoice": 410000,
    "total": 410000
  },
  "month": {
    "totalWithInvoice": 0,
    "totalWithoutInvoice": 3955000,
    "total": 3955000
  },
  "year": {
    "totalWithInvoice": 0,
    "totalWithoutInvoice": 3955000,
    "total": 3955000
  }
}
```

#### GET /api/accounting/sales-chart?period={d|w|m|y}
Returns chart data for the specified period.

**Response:**
```json
{
  "period": "m",
  "labels": ["1", "2", "3", ...],
  "datasets": [
    {
      "label": "Con Factura",
      "data": [0, 0, 1200000, ...]
    },
    {
      "label": "Sin Factura",
      "data": [0, 920000, 0, ...]
    }
  ]
}
```

#### GET /api/accounting/sales-movements
Returns paginated list of sales transactions.

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `paymentMethod`: number (MetodoPagoId)
- `invoiced`: boolean
- `pointOfSale`: number (PuntoDeVentaId)
- `page`: number (default 1)
- `pageSize`: number (default 50)
- `sortBy`: string (column name)
- `sortDesc`: boolean

**Response:**
```json
{
  "items": [
    {
      "ventaId": 7620,
      "origin": "FastService",
      "dni": 35,
      "clientName": "ECONOMICA",
      "clientLastname": "MUEB.LA",
      "amount": 230000,
      "description": "Pago por servicio de FastService orden 128009",
      "paymentMethod": "Efectivo",
      "invoiceNumber": null,
      "date": "2026-01-09T00:00:00"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 50,
  "totalPages": 3
}
```

### Frontend Components

#### AccountingDashboard
Main container component that manages state and navigation between views.

#### SalesSummaryCards
Four cards showing Today/Week/Month/Year summaries with click-to-filter.

#### SalesChart
Recharts AreaChart component with interactive features.

#### SalesMovementsTable
Data table using shadcn/ui Table component with sorting, filtering, pagination.

#### AccountingFilters
Filter controls for date range, payment method, invoiced status.

## UI/UX Design

### Layout
```
+----------------------------------------------------------+
|  [HOY]    [SEMANA]    [MES]      [AÑO]                   |
|  $410K    $410K       $3.95M     $3.95M                  |
|  Sin: $X  Sin: $X     Sin: $X    Sin: $X                 |
|  Con: $Y  Con: $Y     Con: $Y    Con: $Y                 |
+----------------------------------------------------------+
|  [Filters: Date Range | Payment Method | Invoiced]       |
+----------------------------------------------------------+
|                                                          |
|   ▓▓▓▓▓▓                                                 |
|   ▓▓▓▓▓▓▓▓                                               |
|   ▓▓▓▓▓▓▓▓▓▓                                             |
|         [Area Chart - Sales Over Time]                   |
|                                                          |
+----------------------------------------------------------+
|  [Click point to drill down - or view all movements →]   |
+----------------------------------------------------------+
```

### Drill-Down View
```
+----------------------------------------------------------+
|  ← Volver al Resumen    |    Movimientos del 09/01/2026  |
+----------------------------------------------------------+
|  [Search] [Payment Filter ▼] [Invoiced ▼]                |
+----------------------------------------------------------+
| ID   | Origen    | DNI | Nombre | Monto   | Pago | Fecha |
|------|-----------|-----|--------|---------|------|-------|
| 7620 | FastServ  | 35  | ECONO  | $230K   | Efec | 1/9   |
| 7619 | FastServ  | 538 | martin | $180K   | Efec | 1/9   |
|------|-----------|-----|--------|---------|------|-------|
|              [1] [2] [3] ... [10]                         |
+----------------------------------------------------------+
```

## Navigation

The Accounting module will be accessible via:
1. A new tab/route in the main navigation
2. AI commands like "mostrar contabilidad" or "ver ventas"

## Dependencies
- Recharts for charting
- shadcn/ui components (Card, Table, Button, Select, DatePicker)
- React Query for data fetching (if available) or custom hooks
