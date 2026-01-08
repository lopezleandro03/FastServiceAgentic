# Feature Specification: Order Kanban Board

**Feature Branch**: `003-order-kanban-board`  
**Created**: 2025-01-08  
**Status**: Draft  
**Input**: User description: "The home page should display a Kanban-like board with latest orders and their statuses. Similar to baseline application - allows tracking of latest orders by state. Respect the application layout and design systems."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Orders by Status (Priority: P1)

As a service technician or manager, I want to see all recent orders organized in columns by their repair status, so I can quickly understand the current workload and identify orders that need attention.

**Why this priority**: This is the core functionality of the feature. Without the ability to view orders grouped by status, the Kanban board has no value. This represents the minimum viable product.

**Independent Test**: Can be fully tested by loading the home page and verifying that orders appear in distinct columns, each representing a repair status (Ingresado, Presupuestado, Esp. Repuesto, A Reparar, Reparado, Rechazado). Delivers immediate visibility into order pipeline.

**Acceptance Scenarios**:

1. **Given** the user navigates to the home page, **When** the page loads, **Then** they see a horizontal scrollable board with columns for each order status
2. **Given** orders exist in the system, **When** the board loads, **Then** each order appears as a card in the column matching its current status
3. **Given** a status column has orders, **When** viewing the column header, **Then** the count of orders in that status is displayed
4. **Given** orders in the system, **When** viewing the board, **Then** orders are sorted by most recent first within each column

---

### User Story 2 - View Order Card Details (Priority: P1)

As a technician, I want to see key order information on each card without clicking, so I can quickly identify orders and their basic details at a glance.

**Why this priority**: Essential for the board to be useful. Without readable card information, users cannot identify orders or make decisions about which to work on.

**Independent Test**: Can be tested by verifying each card displays: order number, customer name, device type and brand, model info, and assigned technician badge.

**Acceptance Scenarios**:

1. **Given** an order card on the board, **When** viewing it, **Then** I can see the order number prominently displayed
2. **Given** an order card, **When** viewing it, **Then** I can see the customer name in "APELLIDO, NOMBRE" format (uppercase)
3. **Given** an order card, **When** viewing it, **Then** I can see the device summary as "TYPE-BRAND-MODEL"
4. **Given** an order card, **When** viewing it, **Then** I can see a colored badge indicating the assigned technician
5. **Given** an order card, **When** viewing it, **Then** I can see the responsible employee name
6. **Given** a warranty order, **When** viewing its card, **Then** I see an "E" badge indicating warranty service
7. **Given** a domicile order, **When** viewing its card, **Then** I see a home icon indicating domicile service
8. **Given** a REINGRESADO order in A REPARAR column, **When** viewing its card, **Then** the card has a red background
9. **Given** an order in PRESUPUESTADO or REPARADO, **When** viewing its card, **Then** I see days since customer notification

---

### User Story 3 - Filter Orders (Priority: P2)

As a manager or technician, I want to filter the board by various criteria, so I can focus on specific subsets of orders relevant to my current task.

**Why this priority**: Filtering enhances usability but the board is functional without it. Important for efficiency when dealing with many orders.

**Independent Test**: Can be tested by applying each filter type independently and verifying only matching orders appear on the board.

**Acceptance Scenarios**:

1. **Given** I am viewing the board, **When** I select a technician (Tecnico) filter, **Then** only orders assigned to that technician are displayed
2. **Given** I am viewing the board, **When** I select a responsible (Responsable) filter, **Then** only orders with that responsible employee are displayed
3. **Given** I am viewing the board, **When** I select a business (Comercio) filter, **Then** only orders for that business are displayed
4. **Given** I am viewing the board, **When** I select a date range (Desde/Hasta), **Then** only orders created within that range are displayed
5. **Given** I have applied filters, **When** I click "Borrar Filtros", **Then** all filters are removed and all orders are shown
6. **Given** I have applied filters, **When** viewing the board, **Then** the column counts update to reflect filtered results
7. **Given** no date filter is set, **When** viewing the board, **Then** orders from the last 100 days are shown by default

---

### User Story 4 - Navigate to Order Details (Priority: P2)

As a technician, I want to click on an order card to see full details, so I can access complete order information when needed.

**Why this priority**: Important for workflow but the board provides value even as a view-only dashboard. Users can still use the existing chat interface for detailed queries.

**Independent Test**: Can be tested by clicking any order card and verifying the order details panel opens with full information.

**Acceptance Scenarios**:

1. **Given** I am viewing the board, **When** I click on an order card, **Then** the order details panel displays full information for that order
2. **Given** I have selected an order, **When** viewing the details panel, **Then** I can see customer info, device info, repair history, and all movements

---

### User Story 5 - Responsive Board Display (Priority: P3)

As a user on different screen sizes, I want the board to adapt to my screen, so I can use it effectively on any device.

**Why this priority**: Usability enhancement. Core functionality works at standard desktop sizes; responsive design improves experience on varied devices.

**Independent Test**: Can be tested by resizing the browser window and verifying columns remain usable and scrollable.

**Acceptance Scenarios**:

1. **Given** I am on a wide screen, **When** viewing the board, **Then** multiple status columns are visible simultaneously
2. **Given** I am on a narrow screen, **When** viewing the board, **Then** I can horizontally scroll to see all columns
3. **Given** a column has many orders, **When** viewing the board, **Then** I can vertically scroll within that column

---

### Edge Cases

- What happens when a status has zero orders? → Display empty column with "No orders" message
- What happens when the system has no orders at all? → Display empty state with helpful message
- What happens when an order has no assigned technician? → Display "Unassigned" badge
- What happens when loading takes too long? → Display skeleton loading state, then timeout message after reasonable period
- How does the system handle orders with very long customer names or device descriptions? → Truncate with ellipsis, full text on hover

---

## Requirements *(mandatory)*

### Functional Requirements

**Columns (Baseline-Compatible)**:
- **FR-001**: System MUST display exactly 6 fixed Kanban columns in order: INGRESADO, PRESUPUESTADO, ESP. REPUESTO, A REPARAR, REPARADO, RECHAZADO
- **FR-002**: A REPARAR column MUST include orders with both "A REPARAR" and "REINGRESADO" statuses
- **FR-003**: REINGRESADO orders MUST display with red background (#ffbebb) in the A REPARAR column
- **FR-004**: System MUST show the count of orders in each column header

**Order Cards (Baseline-Compatible)**:
- **FR-005**: Each order card MUST display: order number, customer name (APELLIDO, NOMBRE format), device summary (TYPE-BRAND-MODEL)
- **FR-006**: Each order card MUST display technician name and responsible employee name
- **FR-007**: Orders with warranty service (EsGarantia) MUST show "E" badge
- **FR-008**: Orders with domicile service (EsDomicilio) MUST show home icon
- **FR-009**: Orders in PRESUPUESTADO and REPARADO columns MUST show days since notification (InformadoEn)
- **FR-010**: Technician badges MUST be color-coded consistently (same technician = same color)

**Data & Sorting (Baseline-Compatible)**:
- **FR-011**: System MUST load orders from the last 100 days by default
- **FR-012**: System MUST limit each column to maximum 50 orders
- **FR-013**: Orders MUST be sorted by order number descending (newest first) within each column

**Filters (Baseline-Compatible)**:
- **FR-014**: System MUST provide filter controls for: Responsable, Tecnico, Comercio, Desde (date), Hasta (date)
- **FR-015**: System MUST provide "Borrar Filtros" button to clear all filters
- **FR-016**: System MUST provide "Actualizar" button to refresh the board
- **FR-017**: System MUST update column counts when filters are applied

**UI/UX**:
- **FR-018**: System MUST allow horizontal scrolling when columns exceed viewport width
- **FR-019**: System MUST allow vertical scrolling within individual columns
- **FR-020**: Clicking an order card MUST display order details in the details panel
- **FR-021**: System MUST use shadcn/ui components and Tailwind CSS
- **FR-022**: System MUST integrate with the existing split layout (MainPanel)
- **FR-023**: System MUST show loading skeleton states while fetching data
- **FR-024**: System MUST handle errors gracefully with user-friendly messages

### Key Entities

- **Order Status (EstadoReparacion)**: Workflow state. Kanban uses 6 fixed columns mapping to specific status names.
- **Order (Reparacion)**: Repair order with ClienteId, TecnicoAsignadoId, EmpleadoAsignadoId, ComercioId, MarcaId, TipoDispositivoId, timestamps.
- **Order Details (ReparacionDetalle)**: Extended order info including Modelo, EsGarantia (warranty), EsDomicilio (domicile), Presupuesto.
- **Technician (Usuario via TecnicoAsignadoId)**: Assigned technician. Displayed as colored badge.
- **Responsible (Usuario via EmpleadoAsignadoId)**: Responsible employee. Displayed on card.
- **Business (Comercio)**: Associated business/company. Used for filtering.
- **Column**: UI grouping. Fixed 6 columns, A_REPARAR merges "A REPARAR" + "REINGRESADO" statuses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify an order's status within 2 seconds of viewing the board
- **SC-002**: Board loads and displays all status columns within 3 seconds on standard connection
- **SC-003**: Users can locate a specific order (if visible) within 10 seconds by scanning the board
- **SC-004**: Filter application updates the board within 1 second
- **SC-005**: All status columns are visible or accessible via scroll on screens 1024px wide or larger
- **SC-006**: Users can complete the workflow of "find order → view details" in under 5 seconds
- **SC-007**: Board correctly reflects real-time order distribution across statuses with 100% accuracy

## Assumptions

- The existing order statuses in the database (EstadoReparacion table) are suitable for Kanban columns
- The expected order statuses are: Ingresado, Presupuestado, Esp. Repuesto, A Reparar, Reparado, Rechazado (based on baseline)
- The existing API endpoints can be extended or a new endpoint can be created to fetch orders grouped by status
- The technician color scheme will be deterministic based on technician ID (consistent hashing)
- The board will coexist with the existing chat panel (split layout remains)
- Maximum of ~100 orders displayed at once is acceptable for initial view (pagination/infinite scroll if needed later)

## Out of Scope

- Drag-and-drop to change order status (future enhancement)
- Real-time updates via WebSocket (page refresh or manual refresh for now)
- Print or export functionality
- Custom column ordering or hiding
- Mobile-first responsive design (desktop-first, mobile functional)
