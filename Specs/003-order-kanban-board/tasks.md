# Tasks: Order Kanban Board

**Input**: Design documents from `/specs/003-order-kanban-board/`  
**Prerequisites**: plan.md ✓, spec.md ✓, data-model.md ✓, contracts/kanban-api.yaml ✓

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Tasks include exact file paths

## Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| 1 | Setup | 3 |
| 2 | Foundational (Backend API) | 6 |
| 3 | US1 - View Orders by Status (P1) 🎯 MVP | 6 |
| 4 | US2 - View Order Card Details (P1) | 4 |
| 5 | US3 - Filter Orders (P2) | 5 |
| 6 | US4 - Navigate to Order Details (P2) | 2 |
| 7 | US5 - Responsive Board Display (P3) | 2 |
| 8 | Polish | 3 |
| **Total** | | **31** |

---

## Phase 1: Setup

**Purpose**: Project structure for Kanban feature

- [X] T001 Create Kanban component directory at frontend/src/components/Kanban/
- [X] T002 [P] Create TypeScript types file at frontend/src/types/kanban.ts with KanbanBoardData, KanbanColumn, KanbanOrderCard interfaces matching contracts/kanban-api.yaml
- [X] T003 [P] Create API client file at frontend/src/services/orderApi.ts with base structure and fetchKanbanBoard function signature

---

## Phase 2: Foundational (Backend API)

**Purpose**: Backend endpoints that ALL user stories depend on

**⚠️ CRITICAL**: No frontend work can begin until GET /api/orders/kanban is functional

- [X] T004 Create DTO KanbanBoardData.cs at backend/FastService.McpServer/Dtos/KanbanBoardData.cs with Columns, TotalOrders, GeneratedAt properties
- [X] T005 [P] Create DTO KanbanColumn.cs at backend/FastService.McpServer/Dtos/KanbanColumn.cs with ColumnId, DisplayName, OrderCount, Orders properties
- [X] T006 [P] Create DTO KanbanOrderCard.cs at backend/FastService.McpServer/Dtos/KanbanOrderCard.cs with all 11 properties per data-model.md
- [X] T007 Add GetKanbanBoardAsync method to backend/FastService.McpServer/Services/OrderService.cs implementing 6-column grouping with status mapping, 100-day default, 50-order limit per column
- [X] T008 Add GET /api/orders/kanban endpoint to backend/FastService.McpServer/Program.cs with query parameters: technicianId, responsibleId, businessId, fromDate, toDate
- [X] T009 Test backend endpoint: verify 6 columns returned, A_REPARAR includes REINGRESADO orders, orders sorted by orderNumber DESC

**Checkpoint**: Backend API functional - frontend implementation can begin

---

## Phase 3: User Story 1 - View Orders by Status (Priority: P1) 🎯 MVP

**Goal**: Display Kanban board with 6 fixed columns showing orders grouped by status

**Independent Test**: Load home page and verify orders appear in correct columns with counts

### Implementation for User Story 1

- [X] T010 [US1] Implement fetchKanbanBoard function in frontend/src/services/orderApi.ts to call GET /api/orders/kanban and return typed KanbanBoardData
- [X] T011 [US1] Create KanbanColumn.tsx at frontend/src/components/Kanban/KanbanColumn.tsx displaying column header with displayName and orderCount badge, scrollable card list
- [X] T012 [US1] Create KanbanBoard.tsx at frontend/src/components/Kanban/KanbanBoard.tsx with horizontal flex layout for 6 columns, loading skeleton state, error state
- [X] T013 [US1] Add useEffect in KanbanBoard.tsx to fetch data on mount using fetchKanbanBoard, manage loading/error/data states
- [X] T014 [US1] Update frontend/src/components/MainPanel/MainPanel.tsx to render KanbanBoard component instead of current content
- [X] T015 [US1] Add loading skeleton with 6 columns (Skeleton component from shadcn/ui) while fetching data

**Checkpoint**: User Story 1 complete - board displays 6 columns with order counts, can be tested independently

---

## Phase 4: User Story 2 - View Order Card Details (Priority: P1)

**Goal**: Each order card shows all required information with proper formatting and visual indicators

**Independent Test**: Verify cards show order#, customer name (APELLIDO, NOMBRE), device (TYPE-BRAND-MODEL), technician badge, warranty/domicile indicators, REINGRESADO red background

### Implementation for User Story 2

- [X] T016 [US2] Create KanbanCard.tsx at frontend/src/components/Kanban/KanbanCard.tsx with Card component displaying orderNumber, customerName, deviceSummary
- [X] T017 [US2] Add technician color badge to KanbanCard.tsx using deterministic color from technicianId (hash % colorPalette.length), show technicianName and responsibleName
- [X] T018 [US2] Add conditional rendering in KanbanCard.tsx: "E" Badge for isWarranty, Home icon for isDomicile, red background (#ffbebb) when isReentry is true
- [X] T019 [US2] Add daysSinceNotification display to KanbanCard.tsx (only render when not null - PRESUPUESTADO/REPARADO columns)

**Checkpoint**: User Story 2 complete - cards show all baseline-compatible information

---

## Phase 5: User Story 3 - Filter Orders (Priority: P2)

**Goal**: Filter bar with Responsable, Tecnico, Comercio, Desde, Hasta dropdowns and action buttons

**Independent Test**: Apply each filter and verify board updates with matching orders only

### Implementation for User Story 3

- [X] T020 [US3] Add GET /api/technicians endpoint to backend/FastService.McpServer/Program.cs returning UserInfo[] from Usuario table
- [X] T021 [P] [US3] Add GET /api/responsibles endpoint to backend/FastService.McpServer/Program.cs returning UserInfo[] from Usuario table
- [X] T022 [P] [US3] Add GET /api/businesses endpoint to backend/FastService.McpServer/Program.cs returning BusinessInfo[] from Comercio table
- [X] T023 [US3] Create KanbanFilters.tsx at frontend/src/components/Kanban/KanbanFilters.tsx with Select dropdowns for Responsable, Tecnico, Comercio, date inputs for Desde/Hasta, Borrar Filtros and Actualizar buttons
- [X] T024 [US3] Integrate KanbanFilters.tsx into KanbanBoard.tsx: lift filter state, pass filters to fetchKanbanBoard call, re-fetch on filter change or Actualizar click

**Checkpoint**: User Story 3 complete - filters work and update board

---

## Phase 6: User Story 4 - Navigate to Order Details (Priority: P2)

**Goal**: Clicking an order card shows full details in the details panel

**Independent Test**: Click any card and verify OrderDetailsView opens with correct order

### Implementation for User Story 4

- [X] T025 [US4] Add onClick handler to KanbanCard.tsx that calls onOrderClick(orderNumber) prop
- [X] T026 [US4] Wire KanbanBoard.tsx to MainPanel.tsx: pass handleOrderClick to board, fetch order details via existing /api/orders/{orderNumber} endpoint, display in OrderDetailsView

**Checkpoint**: User Story 4 complete - click-to-details workflow functional

---

## Phase 7: User Story 5 - Responsive Board Display (Priority: P3)

**Goal**: Board scrolls horizontally, columns scroll vertically

**Independent Test**: Resize browser and verify scrolling behavior

### Implementation for User Story 5

- [X] T027 [US5] Add horizontal overflow-x-auto to KanbanBoard.tsx container, set min-width on columns to prevent squishing
- [X] T028 [US5] Add vertical overflow-y-auto with max-height to KanbanColumn.tsx card list area

**Checkpoint**: User Story 5 complete - responsive scrolling works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, final verification

- [X] T029 Handle empty columns in KanbanColumn.tsx: display "Sin órdenes" message when orders array is empty
- [X] T030 Handle API errors in KanbanBoard.tsx: show error message with retry button
- [X] T031 Add index.ts barrel export at frontend/src/components/Kanban/index.ts exporting KanbanBoard, KanbanColumn, KanbanCard, KanbanFilters

---

## Dependency Graph

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Backend API) ─────────────────────────────┐
    │                                              │
    ▼                                              │
Phase 3 (US1: Board + Columns) 🎯 MVP              │
    │                                              │
    ├──────────────┬───────────────┐               │
    ▼              ▼               ▼               │
Phase 4        Phase 5         Phase 6             │
(US2: Cards)   (US3: Filters)  (US4: Details)      │
    │              │               │               │
    └──────────────┴───────────────┘               │
                   │                               │
                   ▼                               │
              Phase 7 (US5: Responsive)            │
                   │                               │
                   ▼                               │
              Phase 8 (Polish) ◄────────────────────
```

## Parallel Execution Opportunities

### Within Phase 1:
- T002 and T003 can run in parallel (different files)

### Within Phase 2:
- T004, T005, T006 can run in parallel (different DTO files)

### Within Phase 5:
- T020, T021, T022 can run in parallel (different endpoints)

### Cross-Phase (after Phase 3):
- Phase 4, 5, 6 can run in parallel (different features, shared dependency on US1)

## Implementation Strategy

1. **MVP First**: Complete Phase 1-3 for working Kanban board with columns
2. **Core Cards**: Phase 4 adds full card information
3. **Filtering**: Phase 5 adds filter capabilities
4. **Integration**: Phase 6 connects to existing order details
5. **Polish**: Phase 7-8 for responsive design and edge cases

**Estimated Time**: 2-3 days (based on quickstart.md)
