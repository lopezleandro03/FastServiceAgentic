# Data Model: MCP AI Tools Server

**Feature**: 006-mcp-ai-tools  
**Date**: January 9, 2026  
**Status**: Complete

## Overview

This feature does not introduce new database entities. All MCP tools operate on existing entities defined in the FastService database schema. This document maps the existing entities to tool operations.

## Existing Entities Used by MCP Tools

### Order Domain

#### Reparacion (Repair Order)
The core order entity representing a repair job.

| Field | Type | Tool Usage |
|-------|------|------------|
| ReparacionId | int (PK) | `SearchOrderByNumber` lookup key |
| ClienteId | int (FK) | `GetCustomerOrderHistory` filter |
| EstadoReparacionId | int (FK) | `SearchOrdersByStatus` filter |
| MarcaId | int (FK) | `SearchOrdersByDevice` filter |
| TipoDispositivoId | int (FK) | `SearchOrdersByDevice` filter |
| CreadoEn | DateTime | Result ordering, date range filters |
| FechaEntrega | DateTime? | Delivery status queries |

#### EstadoReparacion (Repair Status)
Workflow status for orders.

| Field | Type | Tool Usage |
|-------|------|------------|
| EstadoReparacionId | int (PK) | Status filter joins |
| Nombre | string | `GetAllStatuses` result, status matching |
| Activo | bool | Filter inactive statuses |

#### ReparacionDetalle (Repair Details)
Extended order information.

| Field | Type | Tool Usage |
|-------|------|------------|
| ReparacionDetalleId | int (PK) | Order detail lookup |
| Modelo | string | Device info in results |
| Precio | decimal? | Financial summaries |
| EsGarantia | bool | Warranty order identification |

### Customer Domain

#### Cliente (Customer)
Customer profile entity.

| Field | Type | Tool Usage |
|-------|------|------------|
| ClienteId | int (PK) | `GetCustomerById` lookup key |
| Dni | int? | `GetCustomerByDNI`, `SearchOrdersByDNI` lookup |
| Nombre | string | `SearchCustomerByName` fuzzy match |
| Apellido | string | `SearchCustomerByName` fuzzy match |
| Mail | string? | Contact info in results |
| Telefono1, Telefono2 | string? | Contact info in results |
| Direccion | string | Address info in results |
| Localidad | string | Address info in results |

#### Direccion (Address)
Structured address information.

| Field | Type | Tool Usage |
|-------|------|------------|
| DireccionId | int (PK) | Address lookup |
| Calle, Altura | string | Full address construction |
| Ciudad, Provincia, Pais | string | Geographic information |

### Accounting Domain

#### Venta (Sale)
Financial transaction record.

| Field | Type | Tool Usage |
|-------|------|------------|
| VentaId | int (PK) | Sale record lookup |
| Monto | decimal | `GetSalesSummary`, `GetSalesForPeriod` aggregations |
| Fecha | DateTime | Period filtering (today, week, month, year) |
| FacturaId | int? | Invoice vs non-invoice separation |
| MetodoPagoId | int? | `GetSalesByPaymentMethod` grouping |
| ClienteId | int? | Customer sale history |
| Descripcion | string? | Sale description in results |

#### MetodoPago (Payment Method)
Payment method lookup table.

| Field | Type | Tool Usage |
|-------|------|------------|
| MetodoPagoId | int (PK) | Payment method grouping |
| Nombre | string | `GetSalesByPaymentMethod` labels |

### Reference Data

#### Marca (Brand)
Device brand lookup.

| Field | Type | Tool Usage |
|-------|------|------------|
| MarcaId | int (PK) | Brand filter joins |
| Nombre | string | `SearchOrdersByDevice` matching |

#### TipoDispositivo (Device Type)
Device type lookup.

| Field | Type | Tool Usage |
|-------|------|------------|
| TipoDispositivoId | int (PK) | Device type filter joins |
| Nombre | string | `SearchOrdersByDevice` matching |

## Entity Relationships for Tools

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Cliente      │────<│   Reparacion    │>────│ EstadoReparacion│
│  (Customer)     │ 1:N │  (Order)        │ N:1 │   (Status)      │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────┴────────┐
                        │                 │
                        ▼                 ▼
              ┌─────────────────┐  ┌─────────────────┐
              │     Marca       │  │ TipoDispositivo │
              │    (Brand)      │  │  (DeviceType)   │
              └─────────────────┘  └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    Cliente      │────<│     Venta       │>────┌─────────────────┐
│  (Customer)     │ 1:N │    (Sale)       │ N:1 │   MetodoPago    │
└─────────────────┘     └─────────────────┘     │ (PaymentMethod) │
                                                └─────────────────┘
```

## Tool-to-Entity Mapping

| Tool | Primary Entity | Related Entities | Query Type |
|------|---------------|------------------|------------|
| SearchOrderByNumber | Reparacion | Cliente, EstadoReparacion, Marca, TipoDispositivo | Single lookup |
| SearchOrdersByCustomer | Reparacion | Cliente (name match) | Fuzzy search |
| SearchOrdersByStatus | Reparacion | EstadoReparacion | Filter |
| SearchOrdersByDNI | Reparacion | Cliente (DNI match) | Exact match |
| SearchOrdersByDevice | Reparacion | Marca, TipoDispositivo | Filter |
| GetAllStatuses | EstadoReparacion | None | List all |
| SearchCustomerByName | Cliente | None | Fuzzy search |
| GetCustomerByDNI | Cliente | Direccion | Exact match |
| GetCustomerById | Cliente | Direccion, Reparacion | Single lookup |
| GetCustomerOrderHistory | Reparacion | Cliente (by ID) | Filter |
| GetCustomerStats | Cliente | Reparacion (aggregation) | Aggregation |
| GetSalesSummary | Venta | None | Aggregation |
| GetSalesForPeriod | Venta | None | Aggregation |
| GetSalesByPaymentMethod | Venta | MetodoPago | Grouped aggregation |
| GetRecentSales | Venta | Cliente, MetodoPago | List with pagination |

## No Schema Changes Required

Per Constitution Principle I (Database Schema Preservation), this feature requires **zero database schema modifications**. All tools utilize:

1. **Existing entities** - No new tables or columns
2. **Existing relationships** - No foreign key changes
3. **Existing services** - `OrderService`, `ClientService`, `AccountingService` provide all data access
4. **Existing DTOs** - `OrderDetailsDto`, `ClientDetailsDto`, `SalesSummaryDto`, etc.

The only new code is the MCP tool wrapper layer that exposes these services via the MCP protocol.
