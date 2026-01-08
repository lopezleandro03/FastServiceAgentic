# Implementation Plan: Conversational Order Search

**Branch**: `001-conversational-order-search` | **Date**: 2026-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-conversational-order-search/spec.md`

## Summary

Implement a conversational order search feature for FastService that enables users to search and view repair orders through natural language interaction with an AI assistant. The architecture centers on an **MCP (Model Context Protocol) Server** to ensure reusability across multiple agentic UIs. The frontend displays a split-panel layout (70% main content, 30% chat panel) built with React/TypeScript.

## Technical Context

**Language/Version**: C# (.NET 8.0) for backend, TypeScript 5.x for frontend  
**Primary Dependencies**: 
- Backend: ModelContextProtocol SDK, Entity Framework Core, Azure.AI.OpenAI
- Frontend: React 18, @modelcontextprotocol/sdk, TailwindCSS  
**Storage**: Azure SQL Server (existing schema, no modifications per Constitution)  
**Testing**: xUnit for backend, Jest + React Testing Library for frontend  
**Target Platform**: Azure App Service (backend), Azure Static Web Apps or App Service (frontend)
**Project Type**: Web (frontend + backend separation)  
**Performance Goals**: 
- Chat response < 5 seconds (SC-004)
- Order detail load < 2 seconds (SC-003)
- Order search < 30 seconds (SC-001)
**Constraints**: 
- No database schema changes (Constitution Principle I)
- Max 50 results per query (FR-018)
- Frontend-backend communication via MCP protocol only
**Scale/Scope**: Desktop-first, single-tenant, ~10-50 concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. Database Schema Preservation** | ✅ PASS | No schema changes; EF Core maps to existing tables |
| **II. Frontend-Backend Separation** | ✅ PASS | React frontend + .NET MCP Server backend; communication via MCP protocol |
| **III. Agentic AI Integration** | ✅ PASS | AI assistant is first-class; MCP enables logging/observability |
| **IV. Feature Parity First** | ✅ PASS | Order search/view replicates baseline functionality |
| **V. Observability & Traceability** | ✅ PASS | MCP protocol includes request IDs; structured logging planned |

**Post-Phase 1 Re-check**: All principles remain satisfied. MCP server architecture enhances reusability beyond original requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-conversational-order-search/
├── plan.md              # This file (Phase 0-1 output)
├── research.md          # ✅ Complete - Technology decisions
├── data-model.md        # ✅ Complete - Entity mappings and DTOs
├── quickstart.md        # ✅ Complete - Setup instructions
├── contracts/           # ✅ Complete
│   ├── openapi.yaml     # REST API companion spec
│   └── mcp-tools.md     # MCP tools contract
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── FastService.McpServer/
│   ├── Program.cs                    # ASP.NET Core + MCP setup
│   ├── appsettings.json             # Configuration
│   ├── Data/
│   │   ├── FastServiceDbContext.cs  # EF Core DbContext
│   │   └── Entities/                # Generated from existing schema
│   │       ├── Reparacion.cs
│   │       ├── ReparacionDetalle.cs
│   │       ├── Cliente.cs
│   │       ├── Usuario.cs
│   │       ├── EstadoReparacion.cs
│   │       ├── Marca.cs
│   │       └── TipoDispositivo.cs
│   ├── Tools/                       # MCP Tool implementations
│   │   ├── OrderSearchTools.cs      # search_orders, get_order_details
│   │   └── OrderStatusTools.cs      # list_order_statuses
│   ├── Services/
│   │   └── OrderService.cs          # Business logic layer
│   └── Dtos/                        # Data transfer objects
│       ├── OrderSearchCriteria.cs
│       ├── OrderSummary.cs
│       └── OrderDetails.cs
└── FastService.McpServer.Tests/
    ├── Tools/
    │   └── OrderSearchToolsTests.cs
    └── Services/
        └── OrderServiceTests.cs

frontend/
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── components/
│   │   ├── Layout/
│   │   │   └── SplitLayout.tsx      # 70/30 split panel
│   │   ├── ChatPanel/
│   │   │   ├── ChatPanel.tsx        # Chat container
│   │   │   ├── MessageList.tsx      # Message history
│   │   │   ├── MessageInput.tsx     # Input field + send
│   │   │   └── LoadingIndicator.tsx
│   │   └── MainPanel/
│   │       ├── MainPanel.tsx        # Main content container
│   │       ├── OrderDetails.tsx     # Order detail view
│   │       └── SearchResults.tsx    # Clickable result list
│   ├── services/
│   │   ├── mcpClient.ts             # MCP client wrapper
│   │   └── aiService.ts             # AI orchestration
│   ├── hooks/
│   │   ├── useChat.ts               # Chat state management
│   │   └── useOrder.ts              # Order selection state
│   ├── types/
│   │   ├── chat.ts                  # ChatMessage, ConversationThread
│   │   └── order.ts                 # OrderSummary, OrderDetails
│   └── styles/
│       └── globals.css              # TailwindCSS imports
├── public/
├── package.json
├── tsconfig.json
└── tailwind.config.js

tests/
├── backend/                         # (symlink to FastService.McpServer.Tests)
└── frontend/
    └── components/
        └── ChatPanel.test.tsx
```

**Structure Decision**: Web application structure with clear backend/frontend separation. The MCP server serves as the intelligent backend layer, with the React frontend connecting via MCP protocol. This aligns with Constitution Principle II (Modern Frontend-Backend Separation).

## Complexity Tracking

> No Constitution violations requiring justification.

| Decision | Rationale |
|----------|-----------|
| MCP Server over REST-only | User requirement for reusability; MCP is industry standard for AI tool exposure |
| React over other frameworks | Constitution allows choice; React has best ecosystem for chat UIs |
| EF Core Database-First | Ensures no accidental schema changes; maps existing tables |

## Phase Summary

### Phase 0: Research ✅ Complete
- [research.md](research.md) - All technology decisions documented
- MCP Server architecture selected for reusability
- React + TypeScript for frontend
- Entity Framework Core for data access

### Phase 1: Design & Contracts ✅ Complete
- [data-model.md](data-model.md) - Entity mappings and DTOs defined
- [contracts/openapi.yaml](contracts/openapi.yaml) - REST companion API
- [contracts/mcp-tools.md](contracts/mcp-tools.md) - MCP tool definitions
- [quickstart.md](quickstart.md) - Developer setup guide

### Phase 2: Task Breakdown (Next: `/speckit.tasks`)
Execute `/speckit.tasks` to generate detailed implementation tasks in `tasks.md`.

---

## Implementation Roadmap

```
Phase 1 (P1) - Split UI Layout
├── Create React project with TypeScript
├── Implement SplitLayout component (70/30)
├── Create ChatPanel scaffold (input + history area)
└── Create MainPanel scaffold

Phase 2 (P2) - Basic Chat Interaction
├── Set up MCP Server with HTTP transport
├── Implement MCP client in frontend
├── Create message input/display components
├── Add loading indicator
└── Handle AI service errors

Phase 3 (P3) - Order Search
├── Scaffold EF Core entities from database
├── Implement search_orders MCP tool
├── Connect AI to interpret natural language
├── Display search results in chat
└── Handle no results / errors

Phase 4 (P4) - Order Details Display
├── Implement get_order_details MCP tool
├── Create OrderDetails component
├── Wire up click-to-view in chat results
├── Show order in main panel
└── Support follow-up questions

Phase 5 (P5) - Domain Context
├── Configure system prompt for FastService
├── Add Spanish/English term mapping
├── Implement list_order_statuses tool
└── Polish conversation flow
```

---

**Next Step**: Run `/speckit.tasks` to generate detailed implementation tasks.
