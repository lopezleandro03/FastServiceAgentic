# Data Model: Conversational Order Search

**Feature**: 001-conversational-order-search  
**Date**: 2026-01-08

## Overview

This document defines the data model for the conversational order search feature. Per Constitution Principle I (Database Schema Preservation), **no changes to the existing Azure SQL schema are permitted**. This model maps to the existing schema and defines DTOs for the API layer.

---

## Existing Database Entities (Read-Only Reference)

### Primary Entity: Reparacion (Order)

The central entity for order management. Maps to `dbo.Reparacion`.

| Column | Type | Description |
|--------|------|-------------|
| ReparacionId | int (PK) | Unique order identifier |
| ClienteId | int (FK) | Reference to Cliente |
| EmpleadoAsignadoId | int (FK) | Employee who received the order |
| TecnicoAsignadoId | int (FK) | Technician assigned to repair |
| EstadoReparacionId | int (FK) | Current status |
| ComercioId | int (FK, nullable) | Associated business/shop |
| MarcaId | int (FK) | Device brand |
| TipoDispositivoId | int (FK) | Device type |
| ReparacionDetalleId | int (FK, nullable) | Detailed repair info |
| FechaEntrega | datetime (nullable) | Delivery date |
| InformadoEn | datetime (nullable) | Customer notification date |
| InformadoPor | int (nullable) | Who notified customer |
| ModificadoEn | datetime | Last modified timestamp |
| ModificadoPor | int | Last modified by user |
| CreadoEn | datetime | Creation timestamp |
| CreadoPor | int | Created by user |

### ReparacionDetalle (Order Details)

Extended details for each repair order. Maps to `dbo.ReparacionDetalle`.

| Column | Type | Description |
|--------|------|-------------|
| ReparacionDetalleId | int (PK, identity) | Unique identifier |
| EsGarantia | bit | Is warranty repair |
| EsDomicilio | bit | Is home service |
| NroReferencia | varchar(200) | Reference number |
| FechaCompra | datetime | Purchase date |
| NroFactura | varchar(200) | Invoice number |
| Presupuesto | decimal | Budget/quote amount |
| PresupuestoFecha | datetime | Quote date |
| Precio | decimal | Final price |
| Modelo | varchar(100) | Device model |
| Serie | varchar(200) | Serial number |
| Serbus | varchar(200) | Service bus number |
| Ubicacion | varchar(100) | Location |
| Accesorios | varchar(200) | Included accessories |
| ReparacionDesc | varchar(500) | Repair description |
| ModificadoEn | datetime | Last modified |
| ModificadoPor | int | Modified by |

### Cliente (Customer)

Customer information. Maps to `dbo.Cliente`.

| Column | Type | Description |
|--------|------|-------------|
| ClienteId | int (PK, identity) | Unique identifier |
| Dni | int (nullable) | National ID (DNI) |
| Nombre | varchar(200) | First name |
| Apellido | varchar(200) | Last name |
| Mail | varchar(200) | Email address |
| Telefono1 | varchar(20) | Primary phone |
| Telefono2 | varchar(20) | Secondary phone |
| Direccion | varchar(300) | Address |
| DireccionId | int (FK, nullable) | Structured address reference |
| Localidad | varchar(300) | City/locality |
| Latitud | float | GPS latitude |
| Longitud | float | GPS longitude |

### EstadoReparacion (Order Status)

Repair workflow states. Maps to `dbo.EstadoReparacion`.

| Column | Type | Description |
|--------|------|-------------|
| EstadoReparacionId | int (PK, identity) | Unique identifier |
| Nombre | varchar(200) | Status name |
| Descripcion | varchar(400) | Status description |
| Categoria | varchar(200) | Status category |
| Activo | bit | Is active status |
| ModificadoEn | datetime | Last modified |
| ModificadoPor | int | Modified by |

### Usuario (User/Technician)

System users including technicians. Maps to `dbo.Usuario`.

| Column | Type | Description |
|--------|------|-------------|
| UserId | int (PK, identity) | Unique identifier |
| Login | varchar(200) | Login username |
| Email | varchar(200) | Email |
| Nombre | varchar(100) | First name |
| Apellido | varchar(100) | Last name |
| Direccion | varchar(500) | Address |
| Telefono1 | varchar(50) | Primary phone |
| Telefono2 | varchar(50) | Secondary phone |
| Activo | bit | Is active user |

### Supporting Entities

#### Marca (Brand)
| Column | Type | Description |
|--------|------|-------------|
| MarcaId | int (PK, identity) | Unique identifier |
| Nombre | varchar(200) | Brand name |
| Descripcion | varchar(400) | Description |
| Activo | bit | Is active |

#### TipoDispositivo (Device Type)
| Column | Type | Description |
|--------|------|-------------|
| TipoDispositivoId | int (PK, identity) | Unique identifier |
| Nombre | varchar(200) | Type name (TV, Laptop, etc.) |
| Descripcion | varchar(400) | Description |
| Activo | bit | Is active |

---

## Entity Relationships

```
                                ┌─────────────────┐
                                │   Comercio      │
                                │   (Business)    │
                                └────────▲────────┘
                                         │ (optional)
┌──────────────┐     ┌───────────────────┼───────────────────┐     ┌──────────────────┐
│   Cliente    │     │                   │                   │     │  EstadoReparacion│
│  (Customer)  │◄────┤    Reparacion     │                   ├────►│     (Status)     │
└──────────────┘     │     (Order)       │                   │     └──────────────────┘
                     │                   │                   │
                     └───────────────────┼───────────────────┘
                           │    │    │   │
            ┌──────────────┘    │    │   └──────────────┐
            ▼                   │    │                  ▼
    ┌──────────────┐           │    │          ┌──────────────┐
    │   Usuario    │◄──────────┘    └─────────►│    Marca     │
    │ (Technician) │                           │   (Brand)    │
    └──────────────┘                           └──────────────┘
            ▲                                          
            │                   │                      
            │                   ▼                      
            │           ┌──────────────────┐   ┌──────────────────┐
            └───────────┤ ReparacionDetalle│   │  TipoDispositivo │
                        │  (OrderDetails)  │   │   (DeviceType)   │
                        └──────────────────┘   └──────────────────┘
```

---

## API Data Transfer Objects (DTOs)

### OrderSearchCriteria

Input DTO for searching orders.

```csharp
public record OrderSearchCriteria
{
    public int? OrderNumber { get; init; }
    public string? CustomerName { get; init; }
    public int? Dni { get; init; }
    public string? TechnicianName { get; init; }
    public string? Status { get; init; }
    public string? Brand { get; init; }
    public string? DeviceType { get; init; }
    public string? SerialNumber { get; init; }
    public int MaxResults { get; init; } = 50;
}
```

### OrderSummary

Lightweight DTO for search results.

```csharp
public record OrderSummary
{
    public int OrderNumber { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string StatusCategory { get; init; } = string.Empty;
    public string DeviceType { get; init; } = string.Empty;
    public string Brand { get; init; } = string.Empty;
    public string? Model { get; init; }
    public string TechnicianName { get; init; } = string.Empty;
    public DateTime CreatedOn { get; init; }
    public DateTime? DeliveryDate { get; init; }
}
```

### OrderDetails

Full DTO for order detail view.

```csharp
public record OrderDetails
{
    // Order Info
    public int OrderNumber { get; init; }
    public DateTime CreatedOn { get; init; }
    public DateTime ModifiedOn { get; init; }
    public DateTime? DeliveryDate { get; init; }
    
    // Status
    public int StatusId { get; init; }
    public string Status { get; init; } = string.Empty;
    public string StatusDescription { get; init; } = string.Empty;
    public string StatusCategory { get; init; } = string.Empty;
    
    // Customer
    public CustomerInfo Customer { get; init; } = new();
    
    // Device
    public DeviceInfo Device { get; init; } = new();
    
    // Repair Details
    public RepairInfo? Repair { get; init; }
    
    // Assignment
    public UserInfo Employee { get; init; } = new();
    public UserInfo Technician { get; init; } = new();
}

public record CustomerInfo
{
    public int Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public int? Dni { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public string Address { get; init; } = string.Empty;
}

public record DeviceInfo
{
    public string Type { get; init; } = string.Empty;
    public string Brand { get; init; } = string.Empty;
    public string? Model { get; init; }
    public string? SerialNumber { get; init; }
}

public record RepairInfo
{
    public bool IsWarranty { get; init; }
    public bool IsHomeService { get; init; }
    public decimal? Quote { get; init; }
    public DateTime? QuoteDate { get; init; }
    public decimal? FinalPrice { get; init; }
    public string? Description { get; init; }
    public string? Accessories { get; init; }
    public string? ReferenceNumber { get; init; }
    public string? InvoiceNumber { get; init; }
}

public record UserInfo
{
    public int Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string? Email { get; init; }
}
```

### OrderStatus

DTO for status information.

```csharp
public record OrderStatus
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? Category { get; init; }
}
```

---

## Chat/Conversation DTOs

### ChatMessage

DTO for chat messages in the UI.

```csharp
public record ChatMessage
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public string Role { get; init; } = "user"; // "user" | "assistant" | "system"
    public string Content { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
    public List<OrderSummary>? SearchResults { get; init; }
    public int? SelectedOrderNumber { get; init; }
}
```

### ConversationThread

DTO for conversation state.

```csharp
public record ConversationThread
{
    public string ThreadId { get; init; } = Guid.NewGuid().ToString();
    public List<ChatMessage> Messages { get; init; } = new();
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public int? CurrentOrderNumber { get; init; }
}
```

---

## Validation Rules

### Order Search
- `MaxResults` must be between 1 and 50 (FR-018)
- At least one search criterion should be provided (except for listing all)
- `OrderNumber` must be positive if provided
- `Dni` must be positive if provided

### Order Number Format
- Integer, typically 5-6 digits
- Must reference an existing `ReparacionId`

### Customer Name Search
- Minimum 2 characters
- Searches both `Nombre` and `Apellido` fields
- Case-insensitive

---

## State Transitions (Reference)

Order status workflow (for AI context):

```
Recibido (Received)
    │
    ▼
En Diagnóstico (Diagnosing)
    │
    ▼
Presupuestado (Quoted)
    │
    ├──────────────────┐
    ▼                  ▼
En Reparación     Cancelado
(In Repair)       (Cancelled)
    │
    ▼
Reparado (Repaired)
    │
    ▼
Entregado (Delivered)
```

**Note**: Actual statuses are stored in `EstadoReparacion` table and may vary.
