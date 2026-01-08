# Data Model: Order Kanban Board

**Feature**: 003-order-kanban-board  
**Date**: 2025-01-08  
**Baseline Reference**: Baseline/FastService/Controllers/KanbanController.cs, Views/Kanban/

## Entities

### Existing Entities (Read-Only)

These entities exist in the database and MUST NOT be modified (Constitution Principle I).

#### EstadoReparacion (Order Status)
| Field | Type | Description |
|-------|------|-------------|
| EstadoReparacionId | int | Primary key |
| Nombre | string | Status name (e.g., "INGRESADO", "PRESUPUESTADO") |
| Descripcion | string? | Optional description |
| Categoria | string? | Optional category grouping |
| Activo | bool? | Whether status is active |

#### Reparacion (Order)
| Field | Type | Description |
|-------|------|-------------|
| ReparacionId | int | Primary key (order number) |
| ClienteId | int | FK to Cliente |
| EmpleadoAsignadoId | int | FK to Usuario (responsible employee) |
| TecnicoAsignadoId | int | FK to Usuario (technician) |
| ComercioId | int? | FK to Comercio (business) |
| EstadoReparacionId | int | FK to EstadoReparacion |
| MarcaId | int | FK to Marca (brand) |
| TipoDispositivoId | int | FK to TipoDispositivo (device type) |
| ReparacionDetalleId | int? | FK to ReparacionDetalle |
| CreadoEn | DateTime | Order creation timestamp |
| ModificadoEn | DateTime | Last modification timestamp |
| InformadoEn | DateTime? | When customer was notified |
| FechaEntrega | DateTime? | Delivery date (if completed) |

#### ReparacionDetalle (Order Details)
| Field | Type | Description |
|-------|------|-------------|
| ReparacionDetalleId | int | Primary key |
| Modelo | string? | Device model |
| EsGarantia | bool? | True if warranty service |
| EsDomicilio | bool? | True if domicile service |
| Presupuesto | decimal? | Quote amount |
| Precio | decimal? | Final price |

#### Usuario (User/Technician/Employee)
| Field | Type | Description |
|-------|------|-------------|
| UsuarioId | int | Primary key |
| Nombre | string | Name |

#### Cliente (Customer)
| Field | Type | Description |
|-------|------|-------------|
| ClienteId | int | Primary key |
| Nombre | string | First name |
| Apellido | string | Last name |

#### Comercio (Business)
| Field | Type | Description |
|-------|------|-------------|
| ComercioId | int | Primary key |
| Nombre | string | Business name |

## Kanban Column Mapping (Baseline-Compatible)

The Kanban board has **6 fixed columns** that map database statuses to display columns:

| Column ID | Display Name | Database Status Values |
|-----------|--------------|------------------------|
| INGRESADO | INGRESADO | "INGRESADO" |
| PRESUPUESTADO | PRESUPUESTADO | "PRESUPUESTADO" |
| ESP_REPUESTO | ESP. REPUESTO | "ESP. REPUESTO" |
| A_REPARAR | A REPARAR | "A REPARAR", "REINGRESADO" (merged) |
| REPARADO | REPARADO | "REPARADO" |
| RECHAZADO | RECHAZADO | "RECHAZADO" |

**Business Rules from Baseline:**
- "REINGRESADO" orders appear in A_REPARAR column with **red background** (#ffbebb)
- Column 4 (A REPARAR) combines both "A REPARAR" and "REINGRESADO" statuses
- "PARA ENTREGAR" column exists but is disabled (not shown)

## DTOs (New)

### KanbanBoardData
Response DTO for the `/api/orders/kanban` endpoint.

| Field | Type | Description |
|-------|------|-------------|
| columns | KanbanColumn[] | Fixed array of 6 columns in display order |
| totalOrders | int | Total count across all columns |
| generatedAt | DateTime | Timestamp when data was generated |

### KanbanColumn
Represents a single Kanban column.

| Field | Type | Description |
|-------|------|-------------|
| columnId | string | Column identifier (INGRESADO, PRESUPUESTADO, etc.) |
| displayName | string | Display name for column header |
| orderCount | int | Number of orders in this column |
| orders | KanbanOrderCard[] | Array of order cards (max 50) |

### KanbanOrderCard
Represents a single order card within a column (matches baseline OrdenModel).

| Field | Type | Description |
|-------|------|-------------|
| orderNumber | int | ReparacionId |
| customerName | string | "APELLIDO, NOMBRE" format (uppercase) |
| deviceSummary | string | "TYPE-BRAND-MODEL" (e.g., "MONITOR-SAMSUNG-LS19D300") |
| technicianId | int | TecnicoAsignadoId (for color assignment) |
| technicianName | string | Technician name |
| responsibleName | string | Responsible employee name |
| isWarranty | bool | EsGarantia - shows "E" badge if true |
| isDomicile | bool | EsDomicilio - shows home icon if true |
| isReentry | bool | True if status is "REINGRESADO" - shows red background |
| daysSinceNotification | int? | Days since InformadoEn (only for PRESUPUESTADO, REPARADO) |
| lastActivityDate | DateTime | ModificadoEn for sorting |

## Relationships

```
EstadoReparacion (1) ←── (N) Reparacion
Usuario (1) ←── (N) Reparacion (as TecnicoAsignado)
Usuario (1) ←── (N) Reparacion (as EmpleadoAsignado)
Comercio (1) ←── (N) Reparacion
Cliente (1) ←── (N) Reparacion
Marca (1) ←── (N) Reparacion
TipoDispositivo (1) ←── (N) Reparacion
ReparacionDetalle (1) ←── (1) Reparacion
```

## Query Logic (Matching Baseline)

### Default Filters
```csharp
// Default date range: last 100 days
desde = desde ?? DateTime.Now.AddDays(-100);
hasta = hasta ?? DateTime.Now;
```

### Column Query Pattern
```csharp
// Per-column query (based on baseline KanbanController.GetOrdenesByEstado)
var ordenes = from r in _db.Reparacion
              where r.EstadoReparacion.Nombre.ToUpper() == statusName
              && r.CreadoEn > desde
              && r.CreadoEn < hasta
              && (technicianId == null || r.TecnicoAsignadoId == technicianId)
              && (responsibleId == null || r.EmpleadoAsignadoId == responsibleId)
              && (businessId == null || r.ComercioId == businessId)
              select new KanbanOrderCard { ... }
              .OrderByDescending(x => x.OrderNumber)
              .Take(50);
```

### A_REPARAR Column Special Case
```csharp
// A_REPARAR column includes both "A REPARAR" and "REINGRESADO" statuses
where (r.EstadoReparacion.Nombre.ToUpper() == "A REPARAR" 
    || r.EstadoReparacion.Nombre.ToUpper() == "REINGRESADO")
```

## State Transitions

Orders flow through statuses in the following typical sequence (managed by existing business logic, NOT implemented by this feature):

```
INGRESADO → PRESUPUESTADO → A REPARAR → REPARADO → PARA ENTREGAR → ENTREGADO
                ↓
          ESP. REPUESTO
                ↓
          A REPARAR
          
         (at any point)
                ↓
          RECHAZADO
          
         (return after delivery)
                ↓
          REINGRESADO → A REPARAR (merged display)
```

**Note**: This feature displays current state only. Status changes are made through other application features.

## Validation Rules

### Filter Parameters
| Parameter | Validation |
|-----------|------------|
| technicianId | Must be valid UsuarioId if provided |
| responsibleId | Must be valid UsuarioId if provided |
| businessId | Must be valid ComercioId if provided |
| fromDate | Must be valid date, before toDate if both provided. Default: 100 days ago |
| toDate | Must be valid date, after fromDate if both provided. Default: today |

### Display Rules (Matching Baseline)
| Rule | Description |
|------|-------------|
| customerName | "APELLIDO, NOMBRE" format, uppercase |
| deviceSummary | "TYPE-BRAND-MODEL" format (e.g., "MONITOR-SAMSUNG-LS19D300") |
| technicianName | Name only (not full name) |
| isReentry | True when status is "REINGRESADO" → red background (#ffbebb) |
| daysSinceNotification | Only calculated for PRESUPUESTADO and REPARADO columns |
| Column limit | Max 50 orders per column |

### Service Type Badges
| Badge | Condition | Display |
|-------|-----------|---------|
| Home icon | isDomicile = true | 🏠 icon before order number |
| "E" badge | isWarranty = true | Blue "E" badge (Empresa/Warranty) |
| "C" badge | isWarranty = false | Gray "C" badge (Compra/Purchase) |
