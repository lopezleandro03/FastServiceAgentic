# Quickstart: Order Kanban Board

**Feature**: 003-order-kanban-board  
**Time Estimate**: 2-3 days  
**Baseline Reference**: Baseline/FastService/Controllers/KanbanController.cs

## Prerequisites

- Node.js 18+ and npm
- .NET 8 SDK
- Access to Azure SQL Server database (connection string in appsettings.json)
- VS Code with recommended extensions

## Development Setup

### 1. Start Backend

```powershell
cd backend/FastService.McpServer
dotnet run --urls "http://localhost:5207"
```

Verify: `curl http://localhost:5207/health`

### 2. Start Frontend

```powershell
cd frontend
npm install
npm start
```

Opens: http://localhost:3000

## Implementation Order

### Phase 1: Backend API (Day 1)

1. **Create DTOs** (`backend/FastService.McpServer/Dtos/`)
   - `KanbanBoardData.cs` - Response wrapper with columns array
   - `KanbanColumn.cs` - Column with columnId, displayName, orderCount, orders
   - `KanbanOrderCard.cs` - Card with all baseline fields

2. **Add Service Method** (`OrderService.cs`)
   ```csharp
   // Baseline-compatible query logic
   public async Task<KanbanBoardData> GetKanbanBoardAsync(
       int? technicianId, int? responsibleId, int? businessId,
       DateTime? fromDate, DateTime? toDate)
   {
       // Default: last 100 days
       fromDate ??= DateTime.Now.AddDays(-100);
       toDate ??= DateTime.Now;
       
       // 6 fixed columns with specific status mappings
       // A_REPARAR includes both "A REPARAR" and "REINGRESADO"
       // Max 50 orders per column, sorted by OrderNumber DESC
   }
   ```

3. **Add API Endpoints** (`Program.cs`)
   - `GET /api/orders/kanban` - Main Kanban data
   - `GET /api/technicians` - Technician filter dropdown
   - `GET /api/responsibles` - Responsible filter dropdown
   - `GET /api/businesses` - Business filter dropdown

4. **Test API**
   ```powershell
   curl http://localhost:5207/api/orders/kanban
   curl "http://localhost:5207/api/orders/kanban?technicianId=5"
   curl "http://localhost:5207/api/orders/kanban?fromDate=2025-10-01"
   ```

### Phase 2: Frontend Components (Day 2)

1. **Create Types** (`frontend/src/types/kanban.ts`)
   ```typescript
   interface KanbanOrderCard {
     orderNumber: number;
     customerName: string;      // "APELLIDO, NOMBRE" format
     deviceSummary: string;     // "TYPE-BRAND-MODEL"
     technicianId: number;
     technicianName: string;
     responsibleName: string;
     isWarranty: boolean;       // Show "E" badge
     isDomicile: boolean;       // Show home icon
     isReentry: boolean;        // Red background if true
     daysSinceNotification: number | null;
     lastActivityDate: string;
   }
   ```

2. **Create API Client** (`frontend/src/services/orderApi.ts`)
   - `fetchKanbanBoard(filters)` - Fetch board data
   - `fetchTechnicians()` - Technician dropdown
   - `fetchResponsibles()` - Responsible dropdown
   - `fetchBusinesses()` - Business dropdown

3. **Create Kanban Components** (`frontend/src/components/Kanban/`)
   - `KanbanBoard.tsx` - 6 fixed columns, horizontal scroll
   - `KanbanColumn.tsx` - Header with count, scrollable card list
   - `KanbanCard.tsx` - Baseline-styled card with badges/icons
   - `KanbanFilters.tsx` - Responsable, Tecnico, Comercio, Desde, Hasta, Borrar Filtros, Actualizar

4. **KanbanCard Styling** (match baseline):
   ```tsx
   // Normal card: bg-[#F2F3F4]
   // Reentry card: bg-[#ffbebb]
   // Warranty badge: "E" in blue
   // Domicile icon: 🏠 or home icon
   ```

5. **Update MainPanel** (`MainPanel.tsx`)
   - Replace status snapshot with KanbanBoard
   - Wire up card click → order details panel

### Phase 3: Polish & Testing (Day 3)

1. **Loading States**
   - 6 skeleton columns with 3 skeleton cards each
   - Error state with retry button

2. **Responsive Behavior**
   - Horizontal scroll for columns
   - Vertical scroll within columns (max-height)

3. **Tests**
   - Unit tests: KanbanCard renders all fields
   - Unit tests: REINGRESADO card has red background
   - Integration: API returns 6 columns with correct mapping

## Baseline Column Mapping Reference

| Column | Display Name | Status Values | Special Behavior |
|--------|--------------|---------------|------------------|
| 1 | INGRESADO | "INGRESADO" | - |
| 2 | PRESUPUESTADO | "PRESUPUESTADO" | Shows days since notification |
| 3 | ESP. REPUESTO | "ESP. REPUESTO" | - |
| 4 | A REPARAR | "A REPARAR", "REINGRESADO" | REINGRESADO = red background |
| 5 | REPARADO | "REPARADO" | Shows days since notification |
| 6 | RECHAZADO | "RECHAZADO" | - |

## Testing Checklist

- [ ] API returns exactly 6 columns in correct order
- [ ] A REPARAR column includes both "A REPARAR" and "REINGRESADO" orders
- [ ] REINGRESADO orders have red background (#ffbebb)
- [ ] Customer names display as "APELLIDO, NOMBRE" (uppercase)
- [ ] Device summary displays as "TYPE-BRAND-MODEL"
- [ ] Warranty orders show "E" badge
- [ ] Domicile orders show home icon
- [ ] PRESUPUESTADO/REPARADO cards show days since notification
- [ ] Filter by Tecnico works
- [ ] Filter by Responsable works
- [ ] Filter by Comercio works
- [ ] Filter by date range works (Desde/Hasta)
- [ ] Default shows last 100 days of orders
- [ ] Each column limited to 50 orders max
- [ ] Orders sorted by order number (newest first)
- [ ] Clicking card opens order details
- [ ] "Borrar Filtros" clears all filters
- [ ] "Actualizar" refreshes the board
- [ ] Horizontal scroll works when needed
- [ ] Vertical scroll within columns works

## Troubleshooting

### API returns empty columns
- Check EstadoReparacion table has matching status names (case-insensitive)
- Verify orders exist within default 100-day date range
- Check connection string in appsettings.json

### CORS errors in browser
- Ensure backend CORS allows http://localhost:3000
- Check AllowFrontend policy in Program.cs

### REINGRESADO not showing red
- Verify isReentry field is set correctly in backend
- Check card styling applies bg-[#ffbebb] when isReentry=true

### Wrong column counts
- Verify status name matching is case-insensitive
- Check A_REPARAR query includes both statuses
| `frontend/src/components/Kanban/` | NEW - 4 components |
| `frontend/src/components/MainPanel/MainPanel.tsx` | MODIFY - integrate board |

## Testing Checklist

- [ ] API returns grouped orders correctly
- [ ] Filtering by technician works
- [ ] Date range filtering works
- [ ] Board displays 6 status columns
- [ ] Order cards show all required info
- [ ] Clicking card opens order details
- [ ] Loading skeleton displays correctly
- [ ] Horizontal scroll works when needed
- [ ] Technician badges have consistent colors
- [ ] Days since creation calculated correctly

## Troubleshooting

### API returns empty statuses
- Check EstadoReparacion table has active statuses
- Verify connection string in appsettings.json

### CORS errors in browser
- Ensure backend CORS allows http://localhost:3000
- Check AllowFrontend policy in Program.cs

### Technician colors inconsistent
- Verify technicianId is included in API response
- Check color palette array has consistent order
