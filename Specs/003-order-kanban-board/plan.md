# Implementation Plan: Order Kanban Board

**Branch**: `003-order-kanban-board` | **Date**: 2025-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-order-kanban-board/spec.md`

## Summary

Implement a Kanban-style board on the home page that displays orders grouped by repair status (Ingresado, Presupuestado, Esp. Repuesto, A Reparar, Reparado, Rechazado). Each order appears as a card showing order number, customer name, device info, technician badge, and days since creation. The feature integrates with the existing split-layout architecture and shadcn/ui design system.

## Technical Context

**Language/Version**: TypeScript 5.x (frontend), C# .NET 8 (backend)  
**Primary Dependencies**: React 18, shadcn/ui, Tailwind CSS, Entity Framework Core 8  
**Storage**: Azure SQL Server (existing schema - read-only access)  
**Testing**: Jest/React Testing Library (frontend), xUnit (backend)  
**Target Platform**: Web browser (desktop-first, Chrome/Edge/Firefox)
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Board loads <3 seconds, filter updates <1 second  
**Constraints**: Database schema unchanged, use existing EstadoReparacion table for columns  
**Scale/Scope**: Display up to 100 recent orders, 6 status columns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Database Schema Preservation | ✅ PASS | Read-only queries against existing tables (Reparacion, EstadoReparacion, Usuario, Cliente, Marca, TipoDispositivo) |
| II. Modern Frontend-Backend Separation | ✅ PASS | New REST endpoint for grouped orders; React component consumes API |
| III. Agentic AI Integration | ✅ PASS | Kanban board replaces MainPanel; chat panel preserved in split layout |
| IV. Feature Parity First | ✅ PASS | Kanban board is core baseline feature being implemented |
| V. Observability & Traceability | ✅ PASS | API endpoint will log requests with correlation IDs |

**Gate Status**: ✅ PASSED - No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-order-kanban-board/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI spec)
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── FastService.McpServer/
│   ├── Services/
│   │   └── OrderService.cs          # Add GetOrdersByStatusAsync method
│   ├── Dtos/
│   │   └── KanbanBoardData.cs       # New DTO for grouped orders
│   └── Program.cs                   # Add /api/orders/kanban endpoint

frontend/
├── src/
│   ├── components/
│   │   ├── Kanban/                  # New Kanban components
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── KanbanCard.tsx
│   │   │   └── KanbanFilters.tsx
│   │   └── MainPanel/
│   │       └── MainPanel.tsx        # Update to show KanbanBoard
│   ├── services/
│   │   └── orderApi.ts              # New API client for orders
│   └── types/
│       └── kanban.ts                # New types for Kanban
└── tests/
    └── components/
        └── Kanban/                  # Unit tests
```

**Structure Decision**: Web application structure using existing backend/frontend separation. New components added to frontend/src/components/Kanban/. Backend extended with new endpoint in existing service.

## Complexity Tracking

> No violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Post-Design Constitution Re-check

*Re-evaluated after Phase 1 design artifacts completed.*

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Database Schema Preservation | ✅ PASS | data-model.md uses only existing entities; no CREATE/ALTER statements in contracts |
| II. Modern Frontend-Backend Separation | ✅ PASS | contracts/kanban-api.yaml defines clear REST API boundary |
| III. Agentic AI Integration | ✅ PASS | Design maintains split-layout; chat panel unaffected |
| IV. Feature Parity First | ✅ PASS | Kanban board matches baseline functionality per spec |
| V. Observability & Traceability | ✅ PASS | API design supports standard request logging |

**Final Gate Status**: ✅ PASSED - Ready for task generation.

## Generated Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](research.md) | Technical decisions and rationale |
| Data Model | [data-model.md](data-model.md) | Entity definitions and DTOs |
| API Contract | [contracts/kanban-api.yaml](contracts/kanban-api.yaml) | OpenAPI 3.0 specification |
| Quickstart | [quickstart.md](quickstart.md) | Implementation guide |

## Next Steps

Run `/speckit.tasks` to generate implementation tasks from this plan.
