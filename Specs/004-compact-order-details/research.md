# Research: Compact Order Details with Novedades and AI Actions

**Feature**: 004-compact-order-details
**Date**: January 8, 2026
**Phase**: 0 - Research

## Research Tasks

### 1. Database Schema Analysis - Novedades

**Task**: Understand the Novedad and TipoNovedad tables structure for displaying order history.

**Findings**:
- `Novedad` table contains: novedadId, reparacionId (FK to Reparacion), UserId, tipoNovedadId (FK to TipoNovedad), monto (nullable decimal), observacion (text), modificadoEn (datetime)
- `TipoNovedad` table contains: TipoNovedadId, nombre, descripcion, activo
- Novedades are linked to Reparacion (order) via reparacionId
- Types include: INGRESADO, NOTA, PRESUPUESTADO, INFORMADO, REPARADO, ENTREGADO, etc.

**Decision**: Query Novedades joined with TipoNovedad to get display name, sorted by modificadoEn DESC
**Rationale**: Direct SQL join is efficient and matches existing EF Core patterns
**Alternatives Rejected**: Separate API calls for types (unnecessary network overhead)

---

### 2. Extended Customer & Address Data

**Task**: Identify all customer fields needed for baseline parity.

**Findings**:
- `Cliente` table: ClienteId, Dni, Nombre, Apellido, Mail, Telefono1, Telefono2, Direccion (text), DireccionId (FK)
- `Direccion` table: Calle, Altura, Calle2, Calle3, Ciudad, CodigoPostal, Provincia
- Current CustomerInfo DTO is missing: Apellido (last name), Telefono2 (Celular), full address breakdown

**Decision**: Extend CustomerInfo DTO with: firstName, lastName, phone2 (celular), address breakdown (calle, altura, entreCalle1, entreCalle2, ciudad, codigoPostal)
**Rationale**: Matches baseline UI field requirements exactly
**Alternatives Rejected**: Keeping flat address string (loses structured data needed for form display)

---

### 3. Extended Device Data

**Task**: Identify all device fields needed for baseline parity.

**Findings**:
- `ReparacionDetalle` table: Modelo, Serie, Unicacion (typo for Ubicacion), Accesorios, EsGarantia, EsDomicilio, Presupuesto, Precio
- Current DeviceInfo DTO is missing: model, ubicacion, accesorios
- TipoDispositivo and Marca are separate lookup tables

**Decision**: Extend DeviceInfo DTO with: model, ubicacion, accesorios
**Rationale**: Direct mapping from ReparacionDetalle fields
**Alternatives Rejected**: None - straightforward extension

---

### 4. Order Header Fields

**Task**: Identify order header fields for baseline parity.

**Findings**:
- Current: orderNumber, status, entryDate, exitDate, estimatedPrice, finalPrice, warranty
- Missing: Responsable (EmpleadoAsignadoId → Usuario), Tecnico (TecnicoAsignadoId → Usuario), Domicilio flag, FechaEstado
- EstadoReparacion has: nombre (status name), fechaModificacion for status date

**Decision**: Add responsable, tecnico as UserInfo objects, add isDomicilio and isGarantia flags from ReparacionDetalle, add statusDate
**Rationale**: Matches baseline header display exactly
**Alternatives Rejected**: None

---

### 5. AI Action Suggestions UX Pattern

**Task**: Determine best UX pattern for action suggestions in AI panel.

**Findings**:
- Actions needed: Imprimir Dorso, Imprimir, Nueva, Informar Presupuesto, Nota/Reclamo, Reingreso, Retira, Seña
- shadcn/ui has Button component with variants (default, outline, ghost)
- Baseline uses column of colored buttons on right side

**Decision**: Display as horizontal chip/pill buttons below AI header when viewing order details. Use Button with variant="outline" and size="sm" for compact display. Group logically (print actions, status actions, financial actions).
**Rationale**: Integrates naturally with AI panel, doesn't take space from main content, follows modern UX patterns
**Alternatives Rejected**: Dropdown menu (hidden actions), vertical sidebar (takes too much space)

---

### 6. Mock Action Implementation

**Task**: Determine mock action behavior for MVP.

**Findings**:
- Real actions would call MCP tools or backend endpoints
- For MVP, need to show user feedback without actual execution
- Actions should add a message to chat showing what would happen

**Decision**: Create useOrderActions hook that returns mock action handlers. Each handler adds an AI assistant message like "✓ Acción ejecutada: [action name] para orden #[number]. (Simulación - integración pendiente)"
**Rationale**: Demonstrates the flow without backend changes, clear indication it's mocked
**Alternatives Rejected**: No-op with toast only (less integrated), full backend implementation (out of MVP scope)

---

### 7. Compact Layout Pattern

**Task**: Determine layout structure for compact order details.

**Findings**:
- Baseline uses form-style grid layout with labels above inputs
- Current OrderDetailsView uses Cards with substantial padding/margins
- Need to fit: header (8 fields), customer (8 fields), address (6 fields), device (6 fields), Novedades table

**Decision**: Use 3-column grid for dense data display:
- Row 1: Order header (Orden, Estado, Fecha Estado, Responsable, Tecnico, Presupuesto, Monto, Flags)
- Row 2: Customer info (Doc, Nombre, Apellido, Mail, Telefono, Celular)
- Row 3: Address (Calle, Altura, Entre 1, Entre 2, Ciudad, CP)
- Row 4: Device (Tipo, Marca, Serie, Modelo, Ubicacion, Accesorios)
- Row 5+: Novedades table (full width, scrollable)

**Rationale**: Maximizes information density while maintaining readability, mirrors baseline layout
**Alternatives Rejected**: Card-per-section (too much vertical space), tabs (hides information)

---

## Summary of Decisions

| Area | Decision |
|------|----------|
| Novedades Query | Join Novedad + TipoNovedad, sort by date DESC |
| Customer DTO | Extend with firstName, lastName, celular, structured address |
| Device DTO | Extend with model, ubicacion, accesorios |
| Order DTO | Add responsable, tecnico, isDomicilio, isGarantia, statusDate |
| Action Suggestions | Horizontal chips in AI panel, grouped logically |
| Mock Actions | useOrderActions hook, adds chat messages showing simulated execution |
| Layout | Dense grid layout, 3-column sections, Novedades table at bottom |
