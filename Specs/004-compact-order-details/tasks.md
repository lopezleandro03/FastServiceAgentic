# Tasks: Compact Order Details with Novedades and AI Actions

**Input**: Design documents from `/specs/004-compact-order-details/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested - test tasks not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/FastService.McpServer/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare backend and frontend for extended order details feature

- [X] T001 Verify backend compiles and runs on http://localhost:5207
- [X] T002 Verify frontend compiles and runs on http://localhost:3000
- [X] T003 Verify existing /api/orders/{orderNumber} endpoint returns data

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend backend DTOs and service to include all new data. These changes are required by ALL user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend DTO Extensions

- [X] T004 [P] Create AddressInfo DTO in backend/FastService.McpServer/Dtos/AddressInfo.cs with fields: fullAddress, calle, altura, entreCalle1, entreCalle2, ciudad, codigoPostal
- [X] T005 [P] Create NovedadInfo DTO in backend/FastService.McpServer/Dtos/NovedadInfo.cs with fields: id, fecha, tipo, monto, observacion, usuarioId
- [X] T006 [P] Extend CustomerInfo in backend/FastService.McpServer/Dtos/OrderDetails.cs: add firstName, lastName, celular, address (AddressInfo)
- [X] T007 [P] Extend DeviceInfo in backend/FastService.McpServer/Dtos/OrderDetails.cs: add model, ubicacion, accesorios
- [X] T008 Extend OrderDetails in backend/FastService.McpServer/Dtos/OrderDetails.cs: add responsable, isDomicilio, isGarantia, statusDate, novedades array

### Backend Service Extension

- [X] T009 Extend GetOrderDetailsAsync in backend/FastService.McpServer/Services/OrderService.cs: include Direccion join via Cliente.DireccionId
- [X] T010 Extend GetOrderDetailsAsync in backend/FastService.McpServer/Services/OrderService.cs: query Novedad table joined with TipoNovedad, sorted by fecha DESC
- [X] T011 Extend GetOrderDetailsAsync in backend/FastService.McpServer/Services/OrderService.cs: populate responsable from EmpleadoAsignadoId
- [X] T012 Extend GetOrderDetailsAsync in backend/FastService.McpServer/Services/OrderService.cs: map ReparacionDetalle fields (Modelo, Unicacion, Accesorios, EsDomicilio, EsGarantia)

### Frontend Type Extensions

- [X] T013 [P] Add AddressInfo interface in frontend/src/types/order.ts matching backend DTO
- [X] T014 [P] Add NovedadInfo interface in frontend/src/types/order.ts matching backend DTO
- [X] T015 Extend CustomerInfo interface in frontend/src/types/order.ts: add firstName, lastName, celular, address (AddressInfo)
- [X] T016 Extend DeviceInfo interface in frontend/src/types/order.ts: add model, ubicacion, accesorios
- [X] T017 Extend OrderDetails interface in frontend/src/types/order.ts: add responsable, isDomicilio, isGarantia, statusDate, novedades array

**Checkpoint**: Backend returns extended order details with Novedades, frontend types ready ✓

---

## Phase 3: User Story 1 - View Compact Order Details (Priority: P1) 🎯 MVP

**Goal**: Display order header, customer info, address, and device info in a compact, dense grid layout

**Independent Test**: Click any order from Kanban → See all order fields displayed in compact 3-column grid sections

### Implementation for User Story 1

- [X] T018 [US1] Create CompactField component in frontend/src/components/Orders/CompactField.tsx for labeled value display (label on top, value below)
- [X] T019 [US1] Refactor OrderDetailsView header section in frontend/src/components/Orders/OrderDetailsView.tsx: display Orden, Estado, Fecha Estado, Responsable, Tecnico, Presupuesto, Monto Final, Domicilio/Garantia flags in dense row
- [X] T020 [US1] Refactor OrderDetailsView customer section in frontend/src/components/Orders/OrderDetailsView.tsx: display Documento, Nombre, Apellido, Mail, Telefono, Celular in 3-column grid
- [X] T021 [US1] Add address section to OrderDetailsView in frontend/src/components/Orders/OrderDetailsView.tsx: display Calle, Altura, Entre 1, Entre 2, Ciudad, CP in 3-column grid
- [X] T022 [US1] Refactor OrderDetailsView device section in frontend/src/components/Orders/OrderDetailsView.tsx: display Tipo, Marca, Serie, Modelo, Ubicacion, Accesorios in 3-column grid
- [X] T023 [US1] Add loading skeleton state to OrderDetailsView in frontend/src/components/Orders/OrderDetailsView.tsx for all sections

**Checkpoint**: User Story 1 complete - compact order details view displays all fields in organized grid layout ✓

---

## Phase 4: User Story 2 - View Novedades History (Priority: P1)

**Goal**: Display Novedades (history) table below order details with Fecha, Tipo, Monto, Observacion columns

**Independent Test**: View any order → See Novedades table with sorted entries, formatted dates and currency

### Implementation for User Story 2

- [X] T024 [P] [US2] Create NovedadesTable component in frontend/src/components/Orders/NovedadesTable.tsx with columns: Fecha, Novedad, Monto, Observacion
- [X] T025 [US2] Add date formatting to NovedadesTable in frontend/src/components/Orders/NovedadesTable.tsx: display fecha as localized datetime
- [X] T026 [US2] Add currency formatting to NovedadesTable in frontend/src/components/Orders/NovedadesTable.tsx: display monto as ARS currency with 2 decimals
- [X] T027 [US2] Add observacion truncation with tooltip in frontend/src/components/Orders/NovedadesTable.tsx for long text
- [X] T028 [US2] Add "Sin novedades" empty state to NovedadesTable in frontend/src/components/Orders/NovedadesTable.tsx
- [X] T029 [US2] Integrate NovedadesTable into OrderDetailsView in frontend/src/components/Orders/OrderDetailsView.tsx: full-width section below device info with scrollable container

**Checkpoint**: User Story 2 complete - Novedades table displays history sorted by date descending ✓

---

## Phase 5: User Story 3 - AI Action Suggestions (Priority: P2)

**Goal**: Display AI action suggestion chips in AI panel that execute mock order operations

**Independent Test**: View any order → See action chips in AI panel → Click action → See mock confirmation message in chat

### Implementation for User Story 3

- [X] T030 [P] [US3] Create useOrderActions hook in frontend/src/hooks/useOrderActions.ts: define mock action handlers for all 8 actions
- [X] T031 [US3] Implement mock action execution in useOrderActions: each handler adds AI assistant message with action confirmation
- [X] T032 [US3] Add action types in useOrderActions: print_dorso, print, nueva, informar_presupuesto, nota_reclamo, reingreso, retira, sena
- [X] T033 [P] [US3] Create ActionSuggestions component in frontend/src/components/ChatPanel/ActionSuggestions.tsx: display 8 action chips as horizontal buttons
- [X] T034 [US3] Style ActionSuggestions in frontend/src/components/ChatPanel/ActionSuggestions.tsx: use shadcn Button with variant="outline" size="sm"
- [X] T035 [US3] Group actions logically in ActionSuggestions: Print (Dorso, Imprimir), Orders (Nueva, Reingreso), Status (Informar, Nota/Reclamo, Retira, Seña)
- [X] T036 [US3] Integrate ActionSuggestions into ChatPanel in frontend/src/components/ChatPanel/ChatPanel.tsx: display when selectedOrder is set
- [X] T037 [US3] Wire ActionSuggestions to useOrderActions in frontend/src/components/ChatPanel/ChatPanel.tsx: pass order number and addMessage function

**Checkpoint**: User Story 3 complete - AI action chips visible and execute mock actions with chat feedback ✓

---

## Phase 6: User Story 4 - Navigate Back to Kanban (Priority: P2)

**Goal**: Easy navigation from order details back to Kanban board while preserving filter state

**Independent Test**: View order details → Click back → Return to Kanban with same filters applied

### Implementation for User Story 4

- [X] T038 [US4] Add back button to OrderDetailsView header in frontend/src/components/Orders/OrderDetailsView.tsx: prominent button to return to Kanban
- [X] T039 [US4] Implement onBack callback in OrderDetailsView in frontend/src/components/Orders/OrderDetailsView.tsx: receive from parent and call on button click
- [X] T040 [US4] Preserve filter state in App.tsx in frontend/src/App.tsx: ensure Kanban filters are not reset when navigating to/from order details

**Checkpoint**: User Story 4 complete - Navigation back to Kanban preserves filter state ✓

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T041 [P] Add aria-labels and accessibility attributes to ActionSuggestions in frontend/src/components/ChatPanel/ActionSuggestions.tsx
- [X] T042 [P] Add error handling for order details fetch failure in frontend/src/components/Orders/OrderDetailsView.tsx
- [X] T043 [P] Verify responsive layout at 1280px+ screen width in frontend/src/components/Orders/OrderDetailsView.tsx
- [X] T044 Run quickstart.md testing checklist to validate all features
- [X] T045 Update frontend/README.md with new components documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify environment ready
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1) and US2 (P1) can proceed in parallel
  - US3 (P2) and US4 (P2) can proceed in parallel
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational - Independent of other stories

### Within Each User Story

- Components created before integration
- Core implementation before styling polish
- Story complete before moving to next priority

### Parallel Opportunities

Within **Foundational (Phase 2)**:
- T004, T005, T006, T007 (DTO creation) can run in parallel
- T013, T014 (frontend type creation) can run in parallel

Within **User Stories**:
- US1 and US2 can run in parallel (different components)
- US3 and US4 can run in parallel (different components)
- T024 and T030 can run in parallel (separate files)
- T033 can run in parallel with other US3 tasks

Within **Polish (Phase 7)**:
- T041, T042, T043 can all run in parallel (different files/concerns)

---

## Parallel Example: Foundational Phase

```bash
# Launch all DTO creation tasks together:
Task T004: "Create AddressInfo DTO"
Task T005: "Create NovedadInfo DTO"
Task T006: "Extend CustomerInfo DTO"
Task T007: "Extend DeviceInfo DTO"

# Then after DTOs are ready:
Task T008: "Extend OrderDetails DTO" (depends on T004, T005)
```

## Parallel Example: User Stories 1 & 2

```bash
# Once Foundational phase is complete, launch both P1 stories:
# Developer A works on US1:
Task T018-T023: Compact order details layout

# Developer B works on US2:
Task T024-T029: Novedades table
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Compact Order Details
4. Complete Phase 4: User Story 2 - Novedades Table
5. **STOP and VALIDATE**: Both P1 stories should work independently
6. Deploy/demo if ready - core viewing functionality complete

### Incremental Delivery

1. Complete Setup + Foundational → Backend returns extended data
2. Add User Story 1 → Compact layout visible → Demo MVP!
3. Add User Story 2 → Novedades visible → Demo complete viewing!
4. Add User Story 3 → AI actions working → Demo AI integration!
5. Add User Story 4 → Navigation polished → Full feature complete!

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Mock action execution is intentional - real MCP integration in future feature
