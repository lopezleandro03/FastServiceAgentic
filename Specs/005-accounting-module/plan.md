# Accounting Module - Technical Plan

## Technology Stack

### Backend (.NET 8)
- **Framework**: ASP.NET Core Web API (existing)
- **ORM**: Entity Framework Core (existing)
- **Database**: SQL Server (existing, uses VwVentasDiarias, VwVentasMensuales, VwVentasAnuales views)

### Frontend (React + TypeScript)
- **Framework**: React 18 (existing)
- **UI Library**: shadcn/ui (existing)
- **Charting**: Recharts (to be added)
- **State**: React hooks (existing pattern)
- **Styling**: Tailwind CSS (existing)

## Architecture

### Backend Structure
```
backend/FastService.McpServer/
├── Controllers/
│   └── AccountingController.cs      # NEW
├── Services/
│   └── AccountingService.cs         # NEW
├── Dtos/
│   ├── SalesSummaryDto.cs           # NEW
│   ├── SalesChartDataDto.cs         # NEW
│   └── SalesMovementDto.cs          # NEW
└── Data/
    └── Entities/
        └── Ventum.cs                # EXISTING
```

### Frontend Structure
```
frontend/src/
├── components/
│   └── Accounting/
│       ├── index.ts                  # NEW - barrel export
│       ├── AccountingDashboard.tsx   # NEW - main container
│       ├── SalesSummaryCards.tsx     # NEW - summary cards
│       ├── SalesChart.tsx            # NEW - recharts area chart
│       ├── SalesMovementsTable.tsx   # NEW - data table
│       └── AccountingFilters.tsx     # NEW - filter controls
├── hooks/
│   └── useAccounting.ts              # NEW - data fetching hook
├── services/
│   └── accountingService.ts          # NEW - API client
├── types/
│   └── accounting.ts                 # NEW - TypeScript types
└── components/
    └── MainPanel/
        └── MainPanel.tsx             # MODIFY - add accounting view
```

## API Design

### AccountingController Endpoints

```csharp
[ApiController]
[Route("api/[controller]")]
public class AccountingController : ControllerBase
{
    // GET /api/accounting/sales-summary
    [HttpGet("sales-summary")]
    public async Task<ActionResult<SalesSummaryDto>> GetSalesSummary()

    // GET /api/accounting/sales-chart?period=m
    [HttpGet("sales-chart")]
    public async Task<ActionResult<SalesChartDataDto>> GetSalesChart(
        [FromQuery] char period = 'm')

    // GET /api/accounting/sales-movements?startDate=...&endDate=...
    [HttpGet("sales-movements")]
    public async Task<ActionResult<PagedResult<SalesMovementDto>>> GetSalesMovements(
        [FromQuery] SalesMovementFilter filter)

    // GET /api/accounting/payment-methods
    [HttpGet("payment-methods")]
    public async Task<ActionResult<List<PaymentMethodDto>>> GetPaymentMethods()
}
```

## Data Models

### DTOs

```csharp
public class SalesSummaryDto
{
    public PeriodSummary Today { get; set; }
    public PeriodSummary Week { get; set; }
    public PeriodSummary Month { get; set; }
    public PeriodSummary Year { get; set; }
}

public class PeriodSummary
{
    public decimal TotalWithInvoice { get; set; }
    public decimal TotalWithoutInvoice { get; set; }
    public decimal Total => TotalWithInvoice + TotalWithoutInvoice;
}

public class SalesChartDataDto
{
    public string Period { get; set; }
    public List<string> Labels { get; set; }
    public List<ChartDataset> Datasets { get; set; }
}

public class ChartDataset
{
    public string Label { get; set; }
    public List<decimal> Data { get; set; }
}

public class SalesMovementDto
{
    public int VentaId { get; set; }
    public string Origin { get; set; }
    public int? Dni { get; set; }
    public string ClientName { get; set; }
    public string ClientLastname { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; }
    public string PaymentMethod { get; set; }
    public string InvoiceNumber { get; set; }
    public DateTime Date { get; set; }
}

public class SalesMovementFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? PaymentMethodId { get; set; }
    public bool? Invoiced { get; set; }
    public int? PointOfSaleId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
    public string SortBy { get; set; } = "Date";
    public bool SortDesc { get; set; } = true;
}
```

### TypeScript Types

```typescript
export interface SalesSummary {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  year: PeriodSummary;
}

export interface PeriodSummary {
  totalWithInvoice: number;
  totalWithoutInvoice: number;
  total: number;
}

export interface SalesChartData {
  period: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
}

export interface SalesMovement {
  ventaId: number;
  origin: string;
  dni: number | null;
  clientName: string;
  clientLastname: string;
  amount: number;
  description: string;
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
}

export type ChartPeriod = 'd' | 'w' | 'm' | 'y';
```

## Component Design

### AccountingDashboard
- Manages view state (overview vs drill-down)
- Handles period selection
- Coordinates data fetching
- Integrates filters

### SalesSummaryCards
- Four clickable cards
- Animated number counters
- Active state highlighting
- Responsive grid layout

### SalesChart
- Recharts AreaChart with two stacked areas
- Custom tooltip with formatted values
- Click handler on data points for drill-down
- Period toggle buttons

### SalesMovementsTable
- shadcn/ui Table component
- Column sorting
- Inline filters
- Pagination controls
- Export functionality (future)

## Navigation Integration

### Option A: Tab-based Navigation (Recommended)
Add a "Contabilidad" tab to the existing navigation structure.

### Option B: AI-triggered Navigation
The AI can navigate to accounting views via commands:
- "mostrar contabilidad"
- "ver ventas del mes"
- "resumen de ventas"

## Implementation Phases

### Phase 1: Backend API
1. Create DTOs
2. Create AccountingService
3. Create AccountingController
4. Test endpoints with Postman/HTTP files

### Phase 2: Frontend Types & Services
1. Add TypeScript types
2. Create accountingService.ts
3. Create useAccounting hook

### Phase 3: Frontend Components
1. Install Recharts
2. Create SalesSummaryCards
3. Create SalesChart
4. Create AccountingDashboard
5. Create SalesMovementsTable
6. Create AccountingFilters

### Phase 4: Integration
1. Add navigation/routing
2. Connect to MainPanel
3. AI integration for queries
4. Testing and refinement

## Performance Considerations

1. **Server-side aggregation** - Use database views (VwVentasDiarias, etc.) for summary data
2. **Pagination** - Limit movements queries to 50 items per page
3. **Caching** - Consider caching summary data (TTL: 1 minute)
4. **Lazy loading** - Load movements only when drilled down

## Security

1. All endpoints require authentication (existing pattern)
2. User can only see data for their assigned PuntoDeVenta (if applicable)
3. Sanitize filter inputs
