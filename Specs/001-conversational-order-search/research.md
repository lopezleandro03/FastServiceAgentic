# Research: Conversational Order Search

**Feature**: 001-conversational-order-search  
**Date**: 2026-01-08

## Executive Summary

This research document resolves technical decisions for implementing a conversational order search feature using an MCP (Model Context Protocol) server architecture. The MCP server enables reusability across multiple agentic UIs, fulfilling the user's requirement for future extensibility.

---

## Technology Decisions

### 1. MCP Server Architecture

**Decision**: Implement the backend as an MCP Server using the C# MCP SDK with HTTP transport (Streamable HTTP), exposing order search tools that can be consumed by any MCP-compatible client.

**Rationale**:
- **Reusability**: MCP is a standardized protocol that allows any MCP-compatible AI client (Claude, VS Code Copilot, custom agents) to consume our tools
- **Decoupling**: The MCP server is independent of the frontend; multiple UIs can connect simultaneously
- **Future-proof**: As more AI assistants adopt MCP, the investment in this architecture pays dividends
- **Constitution Compliance**: Maintains separation between frontend and backend (Principle II)

**Alternatives Considered**:
| Alternative | Rejected Because |
|------------|------------------|
| Direct REST API with AI in frontend | Tightly couples AI logic to specific UI; harder to reuse |
| Azure OpenAI function calling only | Not reusable by other agents; vendor lock-in |
| LangChain/Semantic Kernel | Heavier frameworks; MCP is more lightweight and standardized |

**Implementation**:
- Use `ModelContextProtocol` NuGet package for ASP.NET Core
- HTTP transport for web accessibility (`WithHttpTransport()`)
- Tools exposed via `[McpServerToolType]` and `[McpServerTool]` attributes

---

### 2. Frontend Framework

**Decision**: React with TypeScript for the split-panel UI

**Rationale**:
- Modern, well-supported framework with large ecosystem
- TypeScript provides type safety and better developer experience
- Excellent component libraries for chat interfaces (e.g., react-chat-elements)
- Constitution allows React, Vue, or Angular (React is most popular)

**Alternatives Considered**:
| Alternative | Rejected Because |
|------------|------------------|
| Vue.js | Smaller ecosystem for enterprise chat components |
| Angular | Heavier framework; longer learning curve |
| Blazor | Would require all developers to know C#; less frontend tooling |

---

### 3. AI Integration Pattern

**Decision**: Frontend connects to MCP server via HTTP; MCP server handles AI orchestration and database queries

**Rationale**:
- MCP server acts as the intelligent layer between UI and database
- Tools are defined server-side, keeping business logic secure
- The AI (Azure OpenAI GPT-5-nano) is invoked server-side to interpret natural language and select appropriate tools

**Architecture Flow**:
```
┌──────────────┐     HTTP/MCP      ┌──────────────────┐      SQL       ┌────────────────┐
│   Frontend   │ ───────────────► │   MCP Server     │ ────────────► │  Azure SQL DB  │
│   (React)    │                   │   (.NET/C#)      │                │  (Existing)    │
│              │ ◄─────────────── │   + Azure OpenAI │ ◄──────────── │                │
└──────────────┘     Responses     └──────────────────┘   Results      └────────────────┘
```

---

### 4. Database Access Strategy

**Decision**: Use Entity Framework Core with Database-First approach mapping to existing schema

**Rationale**:
- Constitution mandates no schema changes (Principle I)
- EF Core scaffolding generates models from existing tables
- Enables LINQ queries for complex order searches

**Key Tables for Order Search**:
- `Reparacion` - Main order table
- `ReparacionDetalle` - Order details (serial, model, pricing)
- `Cliente` - Customer information
- `Usuario` - Technicians/employees
- `EstadoReparacion` - Order status
- `Marca` - Device brand
- `TipoDispositivo` - Device type

---

### 5. MCP Tools Design

**Decision**: Create focused, single-responsibility tools for order operations

**Tools Identified**:

| Tool Name | Description | Input Schema |
|-----------|-------------|--------------|
| `search_orders` | Search orders by multiple criteria | orderNumber?, customerName?, dni?, technicianName?, status?, brand?, deviceType?, serial? |
| `get_order_details` | Get full details for a specific order | orderNumber (required) |
| `list_order_statuses` | List all available order statuses | none |
| `get_customer_orders` | Get all orders for a customer | customerId (required) |

**Rationale**:
- Single-responsibility tools are easier for the AI to select correctly
- Mirrors the functional requirements (FR-011 through FR-017)
- Allows for granular access control if needed

---

### 6. Chat Integration in Frontend

**Decision**: Use Microsoft Agent Framework client-side to connect to the MCP server, with a custom React chat component

**Rationale**:
- Agent Framework provides MCP client capabilities via `McpClient`
- Can leverage streaming responses for better UX
- Custom chat component allows full control over FastService branding

**Alternative Considered**:
| Alternative | Rejected Because |
|------------|------------------|
| Copilot Chat SDK | Less control over UI; may conflict with split-panel design |
| Direct REST calls | Loses MCP benefits; would need custom protocol handling |

---

## Best Practices Applied

### MCP Server Best Practices (from C# SDK)

1. **Use `[McpServerToolType]` classes**: Group related tools together
2. **Use `[Description]` attributes**: Critical for AI to understand tool purposes
3. **Return structured results**: Use proper types for serialization
4. **Handle errors gracefully**: Return error messages in tool results, not exceptions
5. **Support cancellation**: All async methods should accept `CancellationToken`

### Azure OpenAI Integration

1. **System prompt**: Customize for FastService domain (Spanish terms, order statuses)
2. **Temperature**: Use low temperature (0.3-0.5) for deterministic tool selection
3. **Streaming**: Use streaming responses for better perceived performance
4. **Token limits**: Keep tool descriptions concise to save context window

---

## Resolved Clarifications

| Question | Resolution |
|----------|------------|
| How will MCP server be hosted? | ASP.NET Core Web API with MCP middleware, deployed to Azure App Service |
| How will frontend communicate with MCP? | HTTP transport using standard MCP protocol over fetch/axios |
| Which AI model? | Azure OpenAI GPT-5-nano (as per AZUREOPENAICONFIG.MD) |
| How to handle authentication? | Out of scope for this feature (assumption from spec) |
| What language for MCP tools? | C# (.NET) per constitution requirement |

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| MCP SDK is relatively new | Use stable release; have fallback to direct API if critical issues |
| AI may not always select correct tool | Detailed tool descriptions; system prompt with examples |
| Database queries may be slow | Add indexes if needed; implement pagination (max 50 results per FR-018) |
| Frontend-backend latency | Use streaming; show loading indicators (FR-009) |

---

## References

- [MCP C# SDK Documentation](https://github.com/modelcontextprotocol/csharp-sdk)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Microsoft Agent Framework](https://github.com/microsoft/agent-framework)
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
