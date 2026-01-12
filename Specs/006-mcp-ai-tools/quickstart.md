# Quickstart: MCP AI Tools Server

**Feature**: 006-mcp-ai-tools  
**Date**: January 9, 2026

## Overview

This guide covers setting up and testing the FastService MCP server with various clients.

## Prerequisites

- .NET 8.0 SDK
- SQL Server connection (existing FastService database)
- One of: Claude Desktop, VS Code with MCP extension, or custom MCP client

## Server Setup

### 1. Install Dependencies

```bash
cd backend/FastService.McpServer
dotnet add package ModelContextProtocol.AspNetCore --prerelease
```

### 2. Configure the Server

The MCP server is configured in `Program.cs`:

```csharp
// Add MCP server services
builder.Services
    .AddMcpServer()
    .WithHttpTransport()
    .WithToolsFromAssembly();

// ... after app.Build()

// Map MCP endpoints
app.MapMcp("/mcp");  // MCP protocol endpoint
```

### 3. Start the Server

```bash
cd backend/FastService.McpServer
dotnet run --urls "http://localhost:5207"
```

Verify the server is running:
```bash
curl http://localhost:5207/health
# Expected: {"status":"healthy","timestamp":"..."}
```

## Client Configuration

### Option A: Claude Desktop

Add to Claude Desktop config (`~/.config/claude/config.json` or similar):

```json
{
  "mcpServers": {
    "fastservice": {
      "url": "http://localhost:5207/mcp",
      "transport": "http"
    }
  }
}
```

Restart Claude Desktop, then test:
> "What tools do you have for FastService?"

### Option B: VS Code with MCP Extension

1. Install an MCP client extension (e.g., `ms-vscode.mcp-client`)
2. Configure in `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "fastservice": {
      "url": "http://localhost:5207/mcp"
    }
  }
}
```

### Option C: Direct HTTP Testing

List available tools:
```bash
curl -X POST http://localhost:5207/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call a tool:
```bash
curl -X POST http://localhost:5207/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"SearchOrderByNumber",
      "arguments":{"orderNumber":12345}
    }
  }'
```

## Available Tools

### Order Tools
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `SearchOrderByNumber` | Find order by ID | `orderNumber` (int) |
| `SearchOrdersByCustomer` | Search by customer name | `customerName`, `maxResults` |
| `SearchOrdersByStatus` | Filter by status | `status`, `maxResults` |
| `SearchOrdersByDNI` | Find by customer DNI | `dni` |
| `SearchOrdersByDevice` | Filter by brand/type | `brand`, `deviceType`, `maxResults` |
| `GetAllStatuses` | List all statuses | (none) |

### Customer Tools
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `SearchCustomerByName` | Find customers by name | `name`, `maxResults` |
| `GetCustomerByDNI` | Get customer by DNI | `dni` |
| `GetCustomerById` | Full customer details | `customerId` |
| `GetCustomerOrderHistory` | Customer's orders | `customerId`, `maxResults` |
| `GetCustomerStats` | Customer statistics | `customerId` |

### Accounting Tools
| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `GetSalesSummary` | Period totals | (none) |
| `GetSalesForPeriod` | Detailed breakdown | `period`, `year`, `month` |
| `GetSalesByPaymentMethod` | Sales by payment type | `startDate`, `endDate` |
| `GetRecentSales` | Recent transactions | `page`, `pageSize`, `startDate`, `endDate` |

## Example Interactions

### Natural Language (via AI client)

```
User: "Buscá las órdenes de García"
AI: [calls SearchOrdersByCustomer with customerName="García"]
    → Returns matching orders

User: "¿Cuánto vendimos hoy?"
AI: [calls GetSalesSummary]
    → Returns today's sales total

User: "Dame los detalles del cliente con DNI 30456789"
AI: [calls GetCustomerByDNI with dni="30456789"]
    → Returns customer profile
```

### Programmatic (Direct Tool Calls)

```python
# Example using Python MCP client
from mcp import Client

client = Client("http://localhost:5207/mcp")

# Search order
result = await client.call_tool(
    "SearchOrderByNumber",
    {"orderNumber": 12345}
)

# Get sales summary
summary = await client.call_tool("GetSalesSummary", {})
```

## Troubleshooting

### Server won't start
- Check SQL Server connection string in `appsettings.json`
- Verify Azure OpenAI credentials (for chat endpoint compatibility)
- Ensure port 5207 is available

### Tools not appearing in client
- Verify MCP endpoint is accessible: `curl http://localhost:5207/mcp`
- Check client configuration for correct URL
- Restart the client after configuration changes

### Tool returns error
- Check server logs for detailed error messages
- Verify parameter types match schema (e.g., `orderNumber` must be integer)
- For database errors, verify connectivity to SQL Server

## Next Steps

1. **Test with existing web app**: The `/api/chat` endpoint continues to work
2. **Add authentication**: Implement API key middleware for external access
3. **Monitor usage**: Check application logs for tool call patterns
