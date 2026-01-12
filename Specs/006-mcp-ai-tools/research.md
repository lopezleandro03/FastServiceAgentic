# Research: MCP AI Tools Server

**Feature**: 006-mcp-ai-tools  
**Date**: January 9, 2026  
**Status**: Complete

## Research Tasks

### 1. MCP C# SDK Implementation Pattern

**Question**: How to implement an MCP server in .NET with the official SDK?

**Decision**: Use `ModelContextProtocol.AspNetCore` for HTTP-based transport with attribute-based tool registration

**Rationale**: 
- The official C# SDK (`ModelContextProtocol` v0.5.0-preview.1) is already installed in the project
- The SDK supports attribute-based tool registration via `[McpServerToolType]` and `[McpServerTool]` attributes
- For HTTP transport (needed for web clients and external MCP clients), use `ModelContextProtocol.AspNetCore` package
- Tools can receive dependency-injected services via parameters (e.g., `OrderService`, `ClientService`)

**Alternatives Considered**:
- **StdioServerTransport**: Rejected - requires process spawning, not suitable for web app integration
- **Manual handlers**: Rejected - more boilerplate, attribute pattern is cleaner and self-documenting

**Code Pattern**:
```csharp
// Tool registration with attributes
[McpServerToolType]
public class OrderTools
{
    [McpServerTool, Description("Search for a repair order by number")]
    public async Task<string> SearchOrderByNumber(
        OrderService orderService,  // DI injected
        [Description("The order number")] int orderNumber)
    {
        // Implementation
    }
}

// Program.cs configuration
builder.Services
    .AddMcpServer()
    .WithHttpTransport()  // For HTTP-based MCP
    .WithToolsFromAssembly();
```

---

### 2. MCP Transport Options for Multi-Client Support

**Question**: Which transport supports both web app and external MCP clients?

**Decision**: Use HTTP/SSE transport via `ModelContextProtocol.AspNetCore`

**Rationale**:
- HTTP transport allows any client that can make HTTP requests
- Server-Sent Events (SSE) enable streaming responses for long-running tool calls
- Compatible with Claude Desktop (via proxy), VS Code MCP extensions, and custom clients
- The existing web app can call MCP endpoints directly or continue using the existing chat endpoint which internally uses the tools

**Alternatives Considered**:
- **Stdio**: Rejected - requires process spawning per client, not scalable
- **WebSocket**: Available but SSE is simpler and sufficient for request-response patterns

---

### 3. Existing Service Layer Compatibility

**Question**: Can existing services be used directly with MCP tools?

**Decision**: Yes - inject existing services directly into MCP tool methods

**Rationale**:
- `OrderService`, `ClientService`, and `AccountingService` already implement the query logic
- MCP tool methods can receive these via DI (the SDK supports constructor and method parameter injection)
- No service layer changes needed for existing functionality
- New tools (CustomerTools, AccountingTools) can be added as new classes with the same DI pattern

**Findings**:
- `OrderService.GetOrderDetailsAsync(int orderId)` - direct match for `SearchOrderByNumber`
- `OrderService.SearchOrdersAsync(OrderSearchCriteria)` - supports customer, status, DNI, device filters
- `ClientService.GetClientsAsync()` - paginated client list
- `ClientService.GetClientDetailsAsync(int clienteId)` - full client with orders
- `ClientService.GetClientByDniAsync(string dni)` - DNI lookup
- `AccountingService.GetSalesSummaryAsync()` - period summaries
- `AccountingService.GetSalesChartDataAsync()` - chart data by period

---

### 4. Web App Backward Compatibility Strategy

**Question**: How to maintain existing web app functionality while migrating to MCP?

**Decision**: Dual-mode operation - keep existing `/api/chat` endpoint, tools implemented as MCP tools that can be called from both the chat agent and external MCP clients

**Rationale**:
- The existing `AgentService` uses Azure OpenAI function calling with tools defined in `DefineChatTools()`
- Refactor tools to use MCP attributes; the same tool implementations serve both:
  1. MCP clients (via MCP protocol)
  2. The chat endpoint (via internal tool invocation)
- The Azure OpenAI `ChatClient` can use MCP tools via the `IChatClient` integration

**Implementation Approach**:
1. Refactor `OrderSearchTools` to use `[McpServerToolType]` and `[McpServerTool]` attributes
2. Create new `CustomerTools` and `AccountingTools` with MCP attributes
3. Update `AgentService` to use the MCP tool infrastructure for tool execution
4. Keep the `/api/chat` endpoint unchanged from the web app's perspective

---

### 5. Tool Result Format

**Question**: What format should MCP tools return for AI consumption?

**Decision**: Return structured JSON with consistent success/error schema

**Rationale**:
- MCP tools return `TextContentBlock` or other content types
- Current tools already return JSON with `{ success, message, data, count }` structure
- This format works well for both AI interpretation and programmatic access
- Error responses should use `McpProtocolException` for proper error codes

**Format**:
```json
// Success
{
  "success": true,
  "message": "Found 5 orders for customer García",
  "count": 5,
  "data": [...]
}

// Error
{
  "success": false,
  "message": "No orders found for customer 'NonExistent'",
  "count": 0
}
```

---

### 6. Authentication/Authorization

**Question**: How to handle auth for external MCP clients?

**Decision**: Network-level authentication initially; API key header option for future

**Rationale**:
- MCP protocol itself doesn't define authentication - it's transport-layer concern
- For initial implementation, rely on network security (VPN, internal network)
- HTTP transport can use standard Authorization headers if needed
- The existing web app doesn't send auth to the chat endpoint (network-secured)

**Future Enhancement**: Add optional API key validation middleware for public exposure

---

## Summary of Decisions

| Topic | Decision | Key Benefit |
|-------|----------|-------------|
| SDK Pattern | Attribute-based (`[McpServerTool]`) | Clean, self-documenting, DI-friendly |
| Transport | HTTP/SSE via AspNetCore package | Multi-client support, web compatible |
| Service Integration | Direct DI injection | Reuse existing services, no changes needed |
| Web App Compat | Dual-mode tools | Backward compatible, single implementation |
| Result Format | Consistent JSON schema | AI-friendly, programmatic access |
| Auth | Network-level initially | Simple, matches existing pattern |

## Dependencies to Add

```xml
<PackageReference Include="ModelContextProtocol.AspNetCore" Version="0.5.0-preview.1" />
```

Note: `ModelContextProtocol` v0.5.0-preview.1 is already installed.
