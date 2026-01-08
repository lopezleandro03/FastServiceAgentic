# Quickstart: Compact Order Details with Novedades and AI Actions

**Feature**: 004-compact-order-details
**Date**: January 8, 2026

## Overview

This feature enhances the order details view to be more compact and includes:
1. **Compact layout** - Dense grid display of order, customer, address, and device info
2. **Novedades table** - Historical events/updates for the order
3. **AI action suggestions** - Clickable chips in AI panel for quick order operations

## Prerequisites

- Backend running on `http://localhost:5207`
- Frontend running on `http://localhost:3000`
- Access to Azure SQL database with FastService schema

## Quick Implementation Steps

### Step 1: Extend Backend DTOs

**File**: `backend/FastService.McpServer/Dtos/OrderDetails.cs`

Add new DTOs:
- `AddressInfo` - Structured address fields
- `NovedadInfo` - Novedad history item
- Extend `CustomerInfo` with firstName, lastName, celular, address
- Extend `DeviceInfo` with model, ubicacion, accesorios
- Add `novedades`, `responsable`, `isDomicilio`, `isGarantia`, `statusDate` to `OrderDetails`

### Step 2: Extend OrderService Query

**File**: `backend/FastService.McpServer/Services/OrderService.cs`

Modify `GetOrderDetailsAsync` to:
1. Include Direccion join via Cliente.DireccionId
2. Query Novedad table joined with TipoNovedad
3. Populate responsable from EmpleadoAsignadoId
4. Map ReparacionDetalle fields (Modelo, Unicacion, Accesorios, EsDomicilio, EsGarantia)

### Step 3: Update Frontend Types

**File**: `frontend/src/types/order.ts`

Add TypeScript interfaces matching the extended API response:
- `AddressInfo`
- `NovedadInfo`
- Extended `CustomerInfo` and `DeviceInfo`

### Step 4: Create NovedadesTable Component

**File**: `frontend/src/components/Orders/NovedadesTable.tsx`

Create table component with columns:
- Fecha (formatted datetime)
- Novedad (tipo)
- Monto (formatted currency)
- Observacion (text, truncated if long)

### Step 5: Refactor OrderDetailsView

**File**: `frontend/src/components/Orders/OrderDetailsView.tsx`

Replace current card-based layout with:
- Dense header section (order status, assigned users, pricing)
- 3-column grid for customer info
- 3-column grid for address
- 3-column grid for device info
- Full-width NovedadesTable at bottom

### Step 6: Create ActionSuggestions Component

**File**: `frontend/src/components/ChatPanel/ActionSuggestions.tsx`

Display action chips when viewing order:
- Imprimir Dorso, Imprimir, Nueva
- Informar Presup., Nota/Reclamo
- Reingreso, Retira, Seña

### Step 7: Create useOrderActions Hook

**File**: `frontend/src/hooks/useOrderActions.ts`

Mock action handlers that add messages to chat:
```typescript
const executeAction = (action: string, orderNumber: number) => {
  // Add AI message showing mock execution
  addMessage({
    role: 'assistant',
    content: `✓ Acción ejecutada: ${action} para orden #${orderNumber}. (Simulación)`
  });
};
```

## Testing Checklist

- [ ] Click order from Kanban → See compact details view
- [ ] All order header fields visible (Orden, Estado, Fecha, Responsable, Tecnico, etc.)
- [ ] Customer info shows all fields in grid
- [ ] Address shows structured fields
- [ ] Device info shows all fields including Modelo, Ubicacion, Accesorios
- [ ] Novedades table displays with proper date sorting
- [ ] AI panel shows action suggestion chips
- [ ] Clicking action chip shows mock confirmation in chat
- [ ] Back button returns to Kanban with filters preserved

## Key Files Modified

| File | Change Type |
|------|-------------|
| backend/Dtos/OrderDetails.cs | Extended |
| backend/Services/OrderService.cs | Extended |
| frontend/types/order.ts | Extended |
| frontend/components/Orders/OrderDetailsView.tsx | Refactored |
| frontend/components/Orders/NovedadesTable.tsx | New |
| frontend/components/ChatPanel/ActionSuggestions.tsx | New |
| frontend/hooks/useOrderActions.ts | New |
