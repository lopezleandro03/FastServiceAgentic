# Research: Order Kanban Board

**Feature**: 003-order-kanban-board  
**Date**: 2025-01-08

## Research Tasks Completed

### 1. Order Status Values in Database

**Question**: What are the actual status values in EstadoReparacion table?

**Decision**: Use existing EstadoReparacion table values for Kanban columns. Based on baseline screenshot and entity structure:
- **EstadoReparacionId**: Integer primary key
- **Nombre**: Status name (Ingresado, Presupuestado, Esp. Repuesto, A Reparar, Reparado, Rechazado)
- **Activo**: Boolean to filter active statuses only

**Rationale**: Database schema must remain unchanged (Constitution Principle I). Query active statuses dynamically rather than hardcoding.

**Alternatives Considered**: 
- Hardcoding 6 status columns - Rejected: won't adapt if statuses change
- Creating new status grouping table - Rejected: violates schema preservation

### 2. API Design Pattern

**Question**: How to structure the API for grouped orders?

**Decision**: Single endpoint `/api/orders/kanban` returns orders grouped by status ID with status metadata.

**Rationale**: 
- Reduces frontend complexity (one API call vs. N calls per status)
- Allows server-side filtering before grouping
- Consistent with existing `/api/orders/{orderNumber}` pattern

**Alternatives Considered**:
- Separate endpoint per status - Rejected: too many round trips
- GraphQL - Rejected: existing project uses REST exclusively

### 3. Technician Color Assignment

**Question**: How to assign consistent colors to technicians?

**Decision**: Hash-based color assignment using technician ID. Frontend maintains a palette of 8-10 distinct colors; `TecnicoAsignadoId % paletteLength` determines color index.

**Rationale**: 
- Deterministic: same technician always gets same color
- No database changes required
- Works even for new technicians

**Alternatives Considered**:
- Store color preference per user - Rejected: requires schema change
- Random colors - Rejected: inconsistent across page loads

### 4. Days Since Creation Calculation

**Question**: Calculate days on backend or frontend?

**Decision**: Backend calculates `daysSinceCreation` field in DTO using `(DateTime.UtcNow - CreadoEn).Days`.

**Rationale**:
- Consistent timezone handling
- Frontend doesn't need to know server timezone
- Allows for future caching without stale calculations

**Alternatives Considered**:
- Frontend calculation - Rejected: timezone complexity, inconsistent if user in different timezone

### 5. Filtering Implementation

**Question**: Filter on backend or frontend?

**Decision**: Backend filtering via query parameters. Endpoint supports:
- `?technicianId={id}` - Filter by assigned technician
- `?fromDate={date}` - Filter orders created after date
- `?toDate={date}` - Filter orders created before date

**Rationale**:
- Reduces data transfer
- Database can efficiently filter with indexes
- Consistent with existing SearchOrdersAsync pattern in OrderService

**Alternatives Considered**:
- Frontend filtering of all 100 orders - Acceptable for MVP, but backend preferred for scalability

### 6. Loading State Pattern

**Question**: How to show loading states?

**Decision**: Use shadcn/ui Skeleton components. Display 6 skeleton columns with 3 skeleton cards each while loading.

**Rationale**: 
- Consistent with existing design system
- Provides visual layout hint while loading
- Already available in frontend/src/components/ui/skeleton.tsx

**Alternatives Considered**:
- Spinner - Rejected: no layout preview
- Shimmer effect - Rejected: Skeleton achieves same effect with less code

### 7. Order Card Click Behavior

**Question**: What happens when clicking an order card?

**Decision**: Fetch full order details via existing `/api/orders/{orderNumber}` endpoint and display in details view within MainPanel.

**Rationale**:
- Reuses existing OrderDetailsView component
- Reuses existing API endpoint
- Maintains split layout with chat panel

**Alternatives Considered**:
- Modal overlay - Rejected: deviates from baseline behavior
- Navigate to separate page - Rejected: loses chat context

## Key Findings

### Existing Assets to Reuse

| Asset | Location | Purpose |
|-------|----------|---------|
| OrderService | backend/Services/OrderService.cs | Add new method for grouped query |
| OrderSummary DTO | backend/Dtos/OrderSummary.cs | Extend or compose for card data |
| OrderDetailsView | frontend/src/components/Orders/ | Reuse for card click |
| Card component | frontend/src/components/ui/card.tsx | Base for KanbanCard |
| Badge component | frontend/src/components/ui/badge.tsx | Technician badge |
| Skeleton component | frontend/src/components/ui/skeleton.tsx | Loading state |

### Database Query Approach

```sql
-- Pseudo-query for reference (will be EF Core LINQ)
SELECT 
    r.ReparacionId,
    r.CreadoEn,
    c.Nombre + ' ' + c.Apellido as CustomerName,
    td.Nombre + '-' + m.Nombre as DeviceInfo,
    u.Nombre as TechnicianName,
    r.TecnicoAsignadoId,
    r.EstadoReparacionId
FROM Reparacion r
JOIN Cliente c ON r.ClienteId = c.ClienteId
JOIN TipoDispositivo td ON r.TipoDispositivoId = td.TipoDispositivoId
JOIN Marca m ON r.MarcaId = m.MarcaId
JOIN Usuario u ON r.TecnicoAsignadoId = u.UsuarioId
WHERE r.CreadoEn >= @fromDate  -- optional filter
ORDER BY r.CreadoEn DESC
LIMIT 100
```

### Performance Considerations

1. **Index exists**: Reparacion.CreadoEn likely indexed for date filtering
2. **Cache opportunity**: Can leverage existing OrderCacheService for hot orders
3. **Projection**: Use .Select() to minimize data transfer (no Include for navigation properties)
4. **Async**: All DB operations async with cancellation tokens
