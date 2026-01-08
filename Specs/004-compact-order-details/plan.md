# Implementation Plan: Compact Order Details with Novedades and AI Actions

**Branch**: `004-compact-order-details` | **Date**: January 8, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-compact-order-details/spec.md`

## Summary

Redesign the order details view to be more compact and modern, displaying all order information (header, customer, device) in organized sections. Add a Novedades (history) table showing all order events. Integrate AI action suggestions in the chat panel that allow users to quickly trigger order operations with mock implementations.

## Technical Context

**Language/Version**: C# .NET 8 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: ASP.NET Core, Entity Framework Core 8, React 18, Tailwind CSS, shadcn/ui
**Storage**: Azure SQL Server (existing schema - Reparacion, Cliente, Direccion, ReparacionDetalle, Novedad, TipoNovedad tables)
**Testing**: Jest (frontend), xUnit (backend)
**Target Platform**: Web application (desktop-first, 1280px+)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Order details load < 2 seconds, smooth scrolling
**Constraints**: Must not modify database schema (Constitution Principle I)
**Scale/Scope**: Single order view with ~10-20 Novedades typical, 8 action suggestions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Pre-Design | Post-Design | Notes |
|-----------|------------|-------------|-------|
| I. Database Schema Preservation | ✅ PASS | ✅ PASS | Read-only access to existing tables (Novedad, TipoNovedad, ReparacionDetalle, Direccion, etc.) |
| II. Modern Frontend-Backend Separation | ✅ PASS | ✅ PASS | React frontend + .NET API backend, OpenAPI contract defined |
| III. Agentic AI Integration | ✅ PASS | ✅ PASS | AI action suggestions are first-class feature with mock implementations |
| IV. Feature Parity First | ✅ PASS | ✅ PASS | Implementing baseline system functionality (order details + Novedades exactly as shown) |
| V. Observability & Traceability | ✅ PASS | ✅ PASS | Action execution logged in chat history, correlation possible |

**Gate Status**: PASSED - Ready for Phase 2 (/speckit.tasks)

## Project Structure

### Documentation (this feature)

```text
specs/004-compact-order-details/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── FastService.McpServer/
│   ├── Dtos/
│   │   ├── OrderDetails.cs         # Extend with Novedades, extended customer/device
│   │   └── NovedadDto.cs           # NEW: Novedad data transfer object
│   ├── Services/
│   │   └── OrderService.cs         # Extend GetOrderDetails with Novedades
│   └── Program.cs                  # API endpoints (extend if needed)

frontend/
├── src/
│   ├── components/
│   │   ├── Orders/
│   │   │   ├── OrderDetailsView.tsx    # REFACTOR: Compact layout
│   │   │   └── NovedadesTable.tsx      # NEW: Novedades history table
│   │   └── ChatPanel/
│   │       └── ActionSuggestions.tsx   # NEW: AI action suggestion chips
│   ├── types/
│   │   └── order.ts                    # Extend with Novedades types
│   └── hooks/
│       └── useOrderActions.ts          # NEW: Mock action execution
```

**Structure Decision**: Web application (Option 2) - extends existing backend/frontend structure

## Complexity Tracking

No Constitution violations requiring justification.
