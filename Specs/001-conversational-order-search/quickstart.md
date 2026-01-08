# Quickstart: Conversational Order Search

**Feature**: 001-conversational-order-search  
**Date**: 2026-01-08

## Prerequisites

- .NET 8.0 SDK or later
- Node.js 18+ (for frontend)
- Azure SQL Database access (connection string in `Specs/DATABASECONFIG.MD`)
- Azure OpenAI access (endpoint in `Specs/AZUREOPENAICONFIG.MD`)

## Project Structure

```
FastServiceAgentic/
├── backend/
│   ├── FastService.McpServer/         # MCP Server (main backend)
│   │   ├── Tools/                     # MCP tool implementations
│   │   │   ├── OrderSearchTools.cs
│   │   │   └── OrderStatusTools.cs
│   │   ├── Data/                      # EF Core DbContext and entities
│   │   │   ├── FastServiceDbContext.cs
│   │   │   └── Entities/
│   │   ├── Services/                  # Business logic services
│   │   │   └── OrderService.cs
│   │   └── Program.cs
│   └── FastService.McpServer.Tests/   # Unit tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel/             # AI chat interface
│   │   │   ├── MainPanel/             # Order details view
│   │   │   └── Layout/                # Split panel layout
│   │   ├── services/
│   │   │   └── mcpClient.ts           # MCP client wrapper
│   │   └── App.tsx
│   └── package.json
└── specs/
    └── 001-conversational-order-search/
```

## Step 1: Backend Setup (MCP Server)

### 1.1 Create the MCP Server Project

```bash
cd C:\code\FastServiceAgentic
mkdir backend
cd backend
dotnet new webapi -n FastService.McpServer
cd FastService.McpServer
```

### 1.2 Install Dependencies

```bash
# MCP SDK
dotnet add package ModelContextProtocol --prerelease

# Entity Framework Core for SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design

# Azure OpenAI
dotnet add package Azure.AI.OpenAI --prerelease
```

### 1.3 Configure appsettings.json

```json
{
  "ConnectionStrings": {
    "FastServiceDb": "Server=tcp:fastservicedb.database.windows.net,1433;Initial Catalog=FastServiceAgenticdb;..."
  },
  "AzureOpenAI": {
    "Endpoint": "https://fastservice-resource.cognitiveservices.azure.com/",
    "DeploymentName": "gpt-5-nano",
    "ApiKey": "YOUR_API_KEY"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### 1.4 Create Basic Program.cs with MCP

```csharp
using Microsoft.EntityFrameworkCore;
using FastService.McpServer.Data;
using FastService.McpServer.Tools;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<FastServiceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FastServiceDb")));

// Add MCP Server with HTTP transport
builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithTools<OrderSearchTools>()
    .WithTools<OrderStatusTools>();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("Frontend");
app.MapMcp();

app.Run();
```

### 1.5 Create Order Search Tool

```csharp
// Tools/OrderSearchTools.cs
using ModelContextProtocol.Server;
using System.ComponentModel;
using FastService.McpServer.Data;
using Microsoft.EntityFrameworkCore;

namespace FastService.McpServer.Tools;

[McpServerToolType]
public class OrderSearchTools(FastServiceDbContext db)
{
    [McpServerTool(Name = "search_orders")]
    [Description("Search for repair orders by various criteria including order number, customer name, DNI, technician, status, brand, device type, or serial number.")]
    public async Task<string> SearchOrders(
        [Description("The exact order/repair ID")] int? orderNumber = null,
        [Description("Customer name (partial match)")] string? customerName = null,
        [Description("Customer DNI")] int? dni = null,
        [Description("Technician name")] string? technicianName = null,
        [Description("Order status")] string? status = null,
        [Description("Device brand")] string? brand = null,
        [Description("Device type")] string? deviceType = null,
        [Description("Serial number")] string? serialNumber = null)
    {
        var query = db.Reparaciones
            .Include(r => r.Cliente)
            .Include(r => r.Tecnico)
            .Include(r => r.Estado)
            .Include(r => r.Marca)
            .Include(r => r.TipoDispositivo)
            .Include(r => r.Detalle)
            .AsQueryable();

        if (orderNumber.HasValue)
            query = query.Where(r => r.ReparacionId == orderNumber.Value);
        
        if (!string.IsNullOrEmpty(customerName))
            query = query.Where(r => 
                r.Cliente.Nombre.Contains(customerName) || 
                r.Cliente.Apellido.Contains(customerName));
        
        // ... additional filters

        var results = await query.Take(50).ToListAsync();
        
        if (!results.Any())
            return "No orders found matching your criteria.";

        return FormatResults(results);
    }

    [McpServerTool(Name = "get_order_details")]
    [Description("Get full details for a specific repair order")]
    public async Task<string> GetOrderDetails(
        [Description("The order/repair ID")] int orderNumber)
    {
        var order = await db.Reparaciones
            .Include(r => r.Cliente)
            .Include(r => r.Tecnico)
            .Include(r => r.Estado)
            .Include(r => r.Marca)
            .Include(r => r.TipoDispositivo)
            .Include(r => r.Detalle)
            .FirstOrDefaultAsync(r => r.ReparacionId == orderNumber);

        if (order == null)
            return $"Order #{orderNumber} not found.";

        return FormatOrderDetails(order);
    }

    private string FormatResults(List<Reparacion> orders) { /* ... */ }
    private string FormatOrderDetails(Reparacion order) { /* ... */ }
}
```

## Step 2: Frontend Setup (React)

### 2.1 Create React App

```bash
cd C:\code\FastServiceAgentic
npx create-react-app frontend --template typescript
cd frontend
```

### 2.2 Install Dependencies

```bash
npm install @modelcontextprotocol/sdk axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.3 Create Split Layout Component

```tsx
// src/components/Layout/SplitLayout.tsx
import React from 'react';
import { ChatPanel } from '../ChatPanel/ChatPanel';
import { MainPanel } from '../MainPanel/MainPanel';

export const SplitLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Main content - 70% */}
      <div className="w-[70%] border-r border-gray-200">
        <MainPanel />
      </div>
      
      {/* Chat panel - 30% */}
      <div className="w-[30%] bg-gray-50">
        <ChatPanel />
      </div>
    </div>
  );
};
```

### 2.4 Create MCP Client Service

```typescript
// src/services/mcpClient.ts
import { McpClient, HttpClientTransport } from '@modelcontextprotocol/sdk';

let client: McpClient | null = null;

export async function getMcpClient(): Promise<McpClient> {
  if (!client) {
    client = await McpClient.create(
      new HttpClientTransport({
        endpoint: new URL(process.env.REACT_APP_MCP_ENDPOINT || 'http://localhost:7001/mcp')
      })
    );
  }
  return client;
}

export async function searchOrders(criteria: Record<string, unknown>): Promise<string> {
  const mcp = await getMcpClient();
  const result = await mcp.callTool({
    name: 'search_orders',
    arguments: criteria
  });
  return result.content[0].text;
}

export async function getOrderDetails(orderNumber: number): Promise<string> {
  const mcp = await getMcpClient();
  const result = await mcp.callTool({
    name: 'get_order_details',
    arguments: { orderNumber }
  });
  return result.content[0].text;
}
```

## Step 3: Run the Application

### 3.1 Start Backend

```bash
cd C:\code\FastServiceAgentic\backend\FastService.McpServer
dotnet run --urls "http://localhost:7001"
```

### 3.2 Start Frontend

```bash
cd C:\code\FastServiceAgentic\frontend
npm start
```

### 3.3 Access the Application

Open `http://localhost:3000` in your browser.

## Testing MCP Tools

### Test with curl

```bash
# Initialize MCP session
curl -X POST http://localhost:7001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# List tools
curl -X POST http://localhost:7001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# Call search_orders tool
curl -X POST http://localhost:7001/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_orders","arguments":{"customerName":"Lopez"}}}'
```

## Environment Variables

### Backend (.env or appsettings)
```
ConnectionStrings__FastServiceDb=<connection-string>
AzureOpenAI__Endpoint=https://fastservice-resource.cognitiveservices.azure.com/
AzureOpenAI__DeploymentName=gpt-5-nano
AzureOpenAI__ApiKey=<api-key>
```

### Frontend (.env)
```
REACT_APP_MCP_ENDPOINT=http://localhost:7001/mcp
```

## Next Steps

1. Scaffold EF Core entities from existing database
2. Implement full tool logic with proper error handling
3. Build chat UI with message history
4. Add AI orchestration for natural language processing
5. Implement order detail view in main panel
6. Add loading states and error handling in frontend
