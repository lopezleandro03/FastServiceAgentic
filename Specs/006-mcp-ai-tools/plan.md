# Implementation Plan: MCP AI Tools Server

**Branch**: `006-mcp-ai-tools` | **Date**: January 9, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-mcp-ai-tools/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Move existing AI tools from internal Azure OpenAI function-calling implementation to a standalone MCP (Model Context Protocol) server, and extend with new customer and accounting tools. This enables any MCP-compatible client (Claude Desktop, VS Code Copilot, custom integrations) to query FastService business data while maintaining backward compatibility with the existing web app.

## Technical Context

**Language/Version**: C# / .NET 8.0  
**Primary Dependencies**: ModelContextProtocol (0.5.0-preview.1 already installed), ModelContextProtocol.AspNetCore (for HTTP transport), Entity Framework Core 8.x  
**Storage**: Azure SQL Server (existing, unchanged schema per Constitution)  
**Testing**: xUnit with integration tests for MCP protocol compliance  
**Target Platform**: Windows/Linux server (Azure App Service compatible)  
**Project Type**: Web backend (existing FastService.McpServer project)  
**Performance Goals**: <2s for single-item lookups, <5s for search queries (from spec SC-002)  
**Constraints**: 10 concurrent client connections without degradation (SC-005)  
**Scale/Scope**: 16+ MCP tools, 3 tool categories (Orders, Customers, Accounting)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Database Schema Preservation** | ✅ PASS | No schema changes required - all tools use existing entities via existing services |
| **II. Modern Frontend-Backend Separation** | ✅ PASS | MCP server exposes well-defined tool contracts; web app remains decoupled |
| **III. Agentic AI Integration** | ✅ PASS | MCP is the industry standard for AI tool integration; enhances AI capabilities |
| **IV. Feature Parity First** | ✅ PASS | Existing tools preserved; new tools are additive |
| **V. Observability & Traceability** | ✅ PASS | MCP tools will use existing logging infrastructure with correlation IDs |

**Gate Result**: ✅ PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/006-mcp-ai-tools/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (MCP tool schemas)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── FastService.McpServer/
│   ├── Program.cs                    # Add MCP server configuration
│   ├── FastService.McpServer.csproj  # Already has ModelContextProtocol package
│   ├── Tools/
│   │   ├── OrderSearchTools.cs       # Existing - refactor to MCP attributes
│   │   ├── CustomerTools.cs          # NEW - customer query tools
│   │   ├── AccountingTools.cs        # NEW - accounting query tools
│   │   └── ToolHelpers.cs            # Existing - shared utilities
│   └── Services/
│       ├── OrderService.cs           # Existing - no changes
│       ├── ClientService.cs          # Existing - may add helper methods
│       └── AccountingService.cs      # Existing - may add helper methods

frontend/
└── src/
    └── services/
        └── chatService.ts            # Update to use MCP client (optional)
```

**Structure Decision**: Extend existing `backend/FastService.McpServer` project. No new projects needed - the ModelContextProtocol NuGet package is already installed and the project already has the necessary services and database context.

## Complexity Tracking

> No Constitution violations identified - table intentionally empty

---

## Constitution Re-Check (Post Phase 1 Design)

*GATE: Verified after design artifacts complete*

| Principle | Status | Design Validation |
|-----------|--------|-------------------|
| **I. Database Schema Preservation** | ✅ PASS | data-model.md confirms all tools use existing entities; zero schema changes |
| **II. Modern Frontend-Backend Separation** | ✅ PASS | contracts/ define clear MCP tool interfaces; web app integration via HTTP |
| **III. Agentic AI Integration** | ✅ PASS | 16 MCP tools enable comprehensive AI-assisted queries across 3 domains |
| **IV. Feature Parity First** | ✅ PASS | All 6 existing order tools preserved; 10 new tools are additive |
| **V. Observability & Traceability** | ✅ PASS | Tools return structured JSON with success/error info; existing logging reused |

**Post-Design Gate Result**: ✅ PASS - Ready for Phase 2 task generation

---

## Phase 1 Artifacts Generated

| Artifact | Path | Description |
|----------|------|-------------|
| Research | [research.md](research.md) | MCP SDK patterns, transport options, service integration |
| Data Model | [data-model.md](data-model.md) | Entity-to-tool mapping, relationship diagrams |
| Order Contracts | [contracts/order-tools.md](contracts/order-tools.md) | 6 order search tool schemas |
| Customer Contracts | [contracts/customer-tools.md](contracts/customer-tools.md) | 5 customer query tool schemas |
| Accounting Contracts | [contracts/accounting-tools.md](contracts/accounting-tools.md) | 4 accounting tool schemas |
| Quickstart | [quickstart.md](quickstart.md) | Setup guide, client configuration, examples |
