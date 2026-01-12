# Accounting Module - Task Breakdown

## Phase 1: Backend API

### Task 1.1: Create DTOs [SETUP]
- [ ] Create `SalesSummaryDto.cs` with PeriodSummary
- [ ] Create `SalesChartDataDto.cs` with ChartDataset
- [ ] Create `SalesMovementDto.cs`
- [ ] Create `SalesMovementFilter.cs`
- [ ] Create `PagedResultDto.cs` (generic)
**Files:** backend/FastService.McpServer/Dtos/

### Task 1.2: Create AccountingService [CORE]
- [ ] Create AccountingService.cs
- [ ] Implement GetSalesSummaryAsync() - aggregate sales by period
- [ ] Implement GetSalesChartDataAsync(period) - build chart datasets
- [ ] Implement GetSalesMovementsAsync(filter) - paginated query
- [ ] Register service in DI container
**Files:** backend/FastService.McpServer/Services/AccountingService.cs, Program.cs

### Task 1.3: Create AccountingController [CORE]
- [ ] Create AccountingController.cs
- [ ] Implement GET /api/accounting/sales-summary
- [ ] Implement GET /api/accounting/sales-chart
- [ ] Implement GET /api/accounting/sales-movements
- [ ] Implement GET /api/accounting/payment-methods
**Files:** backend/FastService.McpServer/Controllers/AccountingController.cs

### Task 1.4: Test Backend API [TEST]
- [ ] Create FastService.McpServer.http entries for accounting endpoints
- [ ] Test sales-summary endpoint
- [ ] Test sales-chart with different periods
- [ ] Test sales-movements with pagination and filters
**Files:** backend/FastService.McpServer/FastService.McpServer.http

---

## Phase 2: Frontend Types & Services

### Task 2.1: Create TypeScript Types [SETUP]
- [ ] Create accounting.ts with all interfaces
- [ ] Export types from index
**Files:** frontend/src/types/accounting.ts

### Task 2.2: Create Accounting API Service [CORE]
- [ ] Create accountingService.ts
- [ ] Implement fetchSalesSummary()
- [ ] Implement fetchSalesChart(period)
- [ ] Implement fetchSalesMovements(filter)
- [ ] Implement fetchPaymentMethods()
**Files:** frontend/src/services/accountingService.ts

### Task 2.3: Create useAccounting Hook [CORE]
- [ ] Create useAccounting.ts
- [ ] Manage summary, chart, movements state
- [ ] Handle period selection
- [ ] Handle drill-down navigation
- [ ] Handle filter changes
**Files:** frontend/src/hooks/useAccounting.ts

### Task 2.4: Install Recharts [SETUP] [P]
- [ ] npm install recharts
- [ ] Verify installation
**Files:** frontend/package.json

---

## Phase 3: Frontend Components

### Task 3.1: Create SalesSummaryCards [CORE]
- [ ] Create SalesSummaryCards.tsx
- [ ] Four cards with Today/Week/Month/Year
- [ ] Display invoiced vs non-invoiced breakdown
- [ ] Click handler to change active period
- [ ] Active state styling
- [ ] Responsive grid layout
**Files:** frontend/src/components/Accounting/SalesSummaryCards.tsx

### Task 3.2: Create SalesChart [CORE]
- [ ] Create SalesChart.tsx
- [ ] Implement Recharts AreaChart
- [ ] Two stacked areas (Con/Sin Factura)
- [ ] Custom tooltip with peso formatting
- [ ] Click handler for drill-down
- [ ] Period toggle buttons (D/W/M/Y)
- [ ] Loading state
**Files:** frontend/src/components/Accounting/SalesChart.tsx

### Task 3.3: Create AccountingFilters [CORE]
- [ ] Create AccountingFilters.tsx
- [ ] Date range picker (from/to)
- [ ] Payment method dropdown
- [ ] Invoiced status toggle
- [ ] Apply/Clear buttons
**Files:** frontend/src/components/Accounting/AccountingFilters.tsx

### Task 3.4: Create SalesMovementsTable [CORE]
- [ ] Create SalesMovementsTable.tsx
- [ ] shadcn/ui Table implementation
- [ ] Columns: ID, Origin, DNI, Name, Lastname, Amount, Description, Payment, Invoice, Date
- [ ] Sortable columns
- [ ] Pagination controls
- [ ] Empty state message
- [ ] Loading skeleton
**Files:** frontend/src/components/Accounting/SalesMovementsTable.tsx

### Task 3.5: Create AccountingDashboard [CORE]
- [ ] Create AccountingDashboard.tsx
- [ ] Integrate SalesSummaryCards
- [ ] Integrate SalesChart
- [ ] Integrate AccountingFilters
- [ ] Handle drill-down to SalesMovementsTable
- [ ] Back button from movements to overview
- [ ] Header with title and subtitle
**Files:** frontend/src/components/Accounting/AccountingDashboard.tsx

### Task 3.6: Create Barrel Export [SETUP]
- [ ] Create index.ts with all exports
**Files:** frontend/src/components/Accounting/index.ts

---

## Phase 4: Integration

### Task 4.1: Add Accounting to MainPanel [INTEGRATION]
- [ ] Import AccountingDashboard
- [ ] Add accounting view state
- [ ] Add navigation logic
- [ ] Integrate with existing view switching
**Files:** frontend/src/components/MainPanel/MainPanel.tsx

### Task 4.2: Add Navigation Tab [INTEGRATION]
- [ ] Add "Contabilidad" navigation option
- [ ] Update useChat or navigation context
- [ ] Handle AI commands for accounting
**Files:** frontend/src/hooks/useChat.ts, frontend/src/App.tsx

### Task 4.3: AI Integration [INTEGRATION]
- [ ] Add accounting tool to backend MCP tools
- [ ] Handle "mostrar contabilidad" command
- [ ] Handle "ventas del mes" queries
- [ ] Return structured data for display
**Files:** backend/FastService.McpServer/Tools/

---

## Phase 5: Polish

### Task 5.1: Formatting & Localization [POLISH]
- [ ] Currency formatting (Argentine Peso)
- [ ] Date formatting (DD/MM/YYYY)
- [ ] Spanish labels throughout
**Files:** Multiple

### Task 5.2: Responsive Design [POLISH]
- [ ] Mobile-friendly summary cards
- [ ] Chart responsive sizing
- [ ] Table horizontal scroll on mobile
**Files:** Multiple

### Task 5.3: Error Handling [POLISH]
- [ ] API error messages
- [ ] Retry logic
- [ ] Empty state handling
**Files:** Multiple

### Task 5.4: Testing [TEST]
- [ ] Test summary endpoint accuracy
- [ ] Test chart data generation
- [ ] Test pagination
- [ ] Test filters
- [ ] Frontend component tests
**Files:** Multiple

---

## Execution Order

1. **Phase 1**: Backend first (1.1 → 1.2 → 1.3 → 1.4)
2. **Phase 2**: Frontend services (2.1 → 2.2, 2.4 [P]) → 2.3
3. **Phase 3**: Components (3.1 [P], 3.2, 3.3 [P]) → 3.4 → 3.5 → 3.6
4. **Phase 4**: Integration (4.1 → 4.2 → 4.3)
5. **Phase 5**: Polish (parallel tasks)

## Estimated Time

- Phase 1: ~2 hours
- Phase 2: ~1 hour
- Phase 3: ~3 hours
- Phase 4: ~1 hour
- Phase 5: ~1 hour

**Total: ~8 hours**
