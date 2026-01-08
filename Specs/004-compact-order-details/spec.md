# Feature Specification: Compact Order Details with Novedades and AI Actions

**Feature Branch**: `004-compact-order-details`  
**Created**: January 8, 2026  
**Status**: Draft  
**Input**: User description: "Compact order details view with Novedades history and AI action suggestions. Display the same information as baseline system in a modern way with good UX. Add AI next message suggestions for order actions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Compact Order Details (Priority: P1)

As a service technician or manager, I want to see a compact, well-organized view of order details so that I can quickly understand the order status, customer information, and device details without scrolling through a lengthy form.

**Why this priority**: This is the core functionality - displaying order information in a usable, compact format is essential before any other features can be built on top.

**Independent Test**: Can be fully tested by clicking any order from the Kanban board and verifying all order fields are displayed in a compact, organized layout.

**Acceptance Scenarios**:

1. **Given** I am viewing the Kanban board, **When** I click on an order card, **Then** I see the order details displayed in a compact, organized layout with clear sections
2. **Given** I am viewing order details, **When** I look at the customer section, **Then** I see Nombre, Apellido, Documento/CUIT, Telefono, Celular, Mail, and full address (Calle, Altura, Entre calles, Ciudad, Codigo Postal)
3. **Given** I am viewing order details, **When** I look at the device section, **Then** I see Tipo Aparato, Marca, Numero de Serie, Modelo, Ubicacion, and Accesorios
4. **Given** I am viewing order details, **When** I look at the order header, **Then** I see Orden number, Estado, Fecha Estado, Responsable, Tecnico asignado, Presupuesto, Monto Final, and Domicilio/Garantia flags

---

### User Story 2 - View Novedades History (Priority: P1)

As a service technician, I want to see the complete history of updates (Novedades) for an order so that I can understand what has happened with the order over time.

**Why this priority**: The Novedades section is critical for understanding order history and tracking changes. It's co-priority P1 because order details without history is incomplete.

**Independent Test**: Can be tested by viewing any order and verifying the Novedades table displays with Fecha, Novedad type, Monto, and Observacion columns.

**Acceptance Scenarios**:

1. **Given** I am viewing order details, **When** I scroll to the Novedades section, **Then** I see a table with columns: Fecha, Novedad (type), Monto, Observacion
2. **Given** an order has multiple Novedades, **When** I view the Novedades section, **Then** I see all entries sorted by date (most recent first)
3. **Given** a Novedad has a Monto value, **When** I view that row, **Then** I see the Monto formatted as currency
4. **Given** the Novedades list is long, **When** I view the section, **Then** I can scroll within the Novedades area without losing sight of order header

---

### User Story 3 - AI Action Suggestions (Priority: P2)

As a service technician, I want the AI assistant to suggest relevant actions I can take on an order so that I can quickly perform common operations without navigating menus.

**Why this priority**: This enhances the AI assistant experience and makes the system more efficient, but the core viewing functionality must work first.

**Independent Test**: Can be tested by viewing any order and checking that the AI assistant shows clickable action suggestions relevant to the order state.

**Acceptance Scenarios**:

1. **Given** I am viewing order details, **When** I look at the AI assistant panel, **Then** I see suggested actions as clickable buttons/chips
2. **Given** I see an action suggestion, **When** I click on it, **Then** the AI processes the action and shows confirmation or result
3. **Given** I click "Informar Presupuesto", **When** the action executes, **Then** I see a mock success message and the UI updates accordingly
4. **Given** I click "Agregar Nota/Reclamo", **When** prompted, **Then** I can enter observation text and see it added to Novedades

---

### User Story 4 - Navigate Back to Kanban (Priority: P2)

As a user, I want to easily return to the Kanban board from order details so that I can continue managing other orders.

**Why this priority**: Navigation is important for usability but depends on the detail view existing first.

**Independent Test**: Can be tested by clicking the back button from order details and verifying return to Kanban.

**Acceptance Scenarios**:

1. **Given** I am viewing order details, **When** I click the back/return button, **Then** I return to the Kanban board with my previous filter state preserved

---

### Edge Cases

- What happens when an order has no Novedades? Display "Sin novedades" placeholder
- What happens when Observacion text is very long? Truncate with tooltip or expandable row
- How does system handle when action execution fails? Show error message in AI chat, don't crash
- What happens when order data is loading? Show skeleton/loading state for all sections

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display order header with: Orden number, Estado, Fecha Estado, Responsable, Tecnico asignado, Presupuesto, Monto Final, Domicilio flag, Garantia flag
- **FR-002**: System MUST display customer information: Documento/CUIT, Nombre, Apellido, Mail, Telefono, Celular
- **FR-003**: System MUST display customer address: Direccion (full), Calle, Altura, Entre calle 1, Entre calle 2, Ciudad, Codigo Postal
- **FR-004**: System MUST display device information: Tipo Aparato, Marca Aparato, Numero de Serie, Modelo, Ubicacion, Accesorios
- **FR-005**: System MUST display Novedades history table with columns: Fecha, Novedad (type), Monto, Observacion
- **FR-006**: System MUST sort Novedades by date descending (most recent first)
- **FR-007**: System MUST provide AI action suggestions for the following actions:
  - Imprimir Dorso
  - Imprimir
  - Nueva (create new order)
  - Informar Presupuesto
  - Nota/Reclamo
  - Reingreso
  - Retira
  - Seña
- **FR-008**: System MUST execute actions via mock implementation (real MCP integration later)
- **FR-009**: System MUST show action result/confirmation in AI chat panel
- **FR-010**: System MUST provide a clear way to navigate back to the Kanban board
- **FR-011**: System MUST preserve Kanban filter state when returning from order details

### Key Entities

- **Order**: Core entity with header info (number, status, dates), customer info, device info, and financial info
- **Customer**: Contact and address information associated with the order
- **Device (Aparato)**: The equipment being serviced - type, brand, model, serial number
- **Novedad**: Historical event/update on an order with timestamp, type, amount, and observation
- **Action**: An operation that can be performed on an order (print, update status, add note, etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all order information without horizontal scrolling on standard desktop screens (1280px+)
- **SC-002**: Order details page loads and displays within 2 seconds
- **SC-003**: Users can identify order status and key information within 5 seconds of viewing
- **SC-004**: Novedades history is visible without navigating away from order details
- **SC-005**: 100% of listed actions are available as AI suggestions when viewing order details
- **SC-006**: Users can perform any action with 2 or fewer clicks (click suggestion + confirm)
- **SC-007**: Navigation back to Kanban preserves filter state 100% of the time

## Assumptions

- The backend already returns order details including customer, device, and Novedades data via existing `/api/orders/{orderNumber}` endpoint
- If additional fields are needed, the backend endpoint will be extended
- Action execution is mocked for MVP; real MCP tool integration will be done in a follow-up feature
- Print actions will show a mock "printing..." message rather than actual printing
- Novedades types include: INGRESADO, NOTA, PRESUPUESTADO, INFORMADO, REPARADO, ENTREGADO, etc.
