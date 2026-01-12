# FastService AI Agent Architecture

## Overview

FastService implements a **conversational AI agent** that enables users to search and query repair orders, customers, and accounting data using natural language. The AI understands Spanish (with Argentine dialect), interprets user intent, and queries the database using a **function calling** (tool use) pattern.

The system supports **two access modes**:
1. **Web App Chat** - Internal chat interface via `/api/chat` endpoint
2. **MCP Server** - External clients (Claude Desktop, VS Code, etc.) via `/mcp` endpoint

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          External MCP Clients                                │
│              (Claude Desktop, VS Code, Custom Applications)                  │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP/SSE via /mcp
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MCP Server                                      │
│                    (ModelContextProtocol.AspNetCore)                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                   16 MCP Tools (Auto-discovered)                    │     │
│  │  OrderSearchTools (6) │ CustomerTools (5) │ AccountingTools (4)    │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────────┐
│                              User Interface                                  │
│                          (React Chat Component)                              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ POST /api/chat
                                    │ { message, conversationHistory }
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AgentService                                    │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                      Azure OpenAI ChatClient                        │     │
│  │                   (GPT-4 / GPT-4o deployment)                       │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                    │                                         │
│                         Function Calling Loop                                │
│                                    │                                         │
│    ┌───────────────┬───────────────┼───────────────┬───────────────┐        │
│    ▼               ▼               ▼               ▼               ▼        │
│ ┌───────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐   │
│ │Orders │    │Customers │    │Accounting│    │ Search   │    │  Stats  │   │
│ │Tools  │    │Tools     │    │Tools     │    │ Tools    │    │  Tools  │   │
│ └───────┘    └──────────┘    └──────────┘    └──────────┘    └─────────┘   │
│         │               │               │               │               │   │
│         └───────────────┴───────────────┼───────────────┴───────────────┘   │
│                                         ▼                                    │
│                     OrderService / ClientService / AccountingService         │
│                                         │                                    │
└─────────────────────────────────────────┼────────────────────────────────────┘
                                          ▼
                               FastServiceDbContext
                                          │
                                          ▼
                             SQL Server Database
```

---

## MCP Server Architecture

The MCP (Model Context Protocol) server enables external AI clients to access FastService tools via a standardized protocol.

### MCP Configuration

```csharp
// Program.cs
builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithToolsFromAssembly();

// Endpoint mapping
app.MapMcp("/mcp");
```

### MCP Tool Classes

Tools are discovered automatically via attributes:

```csharp
[McpServerToolType]
public class OrderSearchTools
{
    [McpServerTool(Name = "SearchOrderByNumber")]
    [Description("Search for a repair order by its order number.")]
    public async Task<string> SearchOrdersByNumberAsync(
        [Description("The repair order number")] int orderNumber)
    { ... }
}
```

### Available MCP Tools (16 Total)

| Category | Tool | Description |
|----------|------|-------------|
| **Orders** | `SearchOrderByNumber` | Find order by ID |
| | `SearchOrdersByCustomer` | Search by customer name |
| | `SearchOrdersByStatus` | Filter by status |
| | `SearchOrdersByDNI` | Search by customer DNI |
| | `SearchOrdersByDevice` | Filter by brand/device type |
| | `GetAllStatuses` | List all statuses |
| **Customers** | `SearchCustomerByName` | Search customers |
| | `GetCustomerByDNI` | Get customer by DNI |
| | `GetCustomerById` | Get customer details |
| | `GetCustomerOrderHistory` | Get order history |
| | `GetCustomerStats` | Get customer statistics |
| **Accounting** | `GetSalesSummary` | Sales totals (day/week/month/year) |
| | `GetSalesForPeriod` | Chart data for period |
| | `GetSalesByPaymentMethod` | Breakdown by payment method |
| | `GetRecentSales` | Recent transactions |

### MCP Client Configuration

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "fastservice": {
      "url": "http://localhost:5207/mcp"
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`):
```json
{
  "servers": {
    "fastservice": {
      "url": "http://localhost:5207/mcp"
    }
  }
}
```

---

## Architecture Pattern: ReAct Agent with Function Calling

The AI uses the **ReAct (Reasoning + Acting)** pattern where:

1. **User sends message** → Agent receives natural language input
2. **Agent reasons** → Determines which tool(s) to call based on user intent
3. **Agent acts** → Calls appropriate function/tool with extracted parameters
4. **Tool executes** → Queries database and returns JSON result
5. **Agent synthesizes** → Formats tool results into natural language response
6. **Loop if needed** → Agent may call multiple tools before responding

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         ReAct Loop Flow                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User: "Buscá órdenes de Samsung que estén pendientes"                  │
│                           │                                              │
│                           ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ GPT-4 Reasoning:                                                    │ │
│  │ "User wants Samsung orders with pending status.                     │ │
│  │  I should call SearchOrdersByDevice with brand='Samsung'            │ │
│  │  OR SearchOrdersByStatus with status='Pendiente'                    │ │
│  │  Best approach: SearchOrdersByDevice to filter by brand first"      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                           │                                              │
│                           ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Tool Call: SearchOrdersByDevice                                  │    │
│  │ Arguments: { "brand": "Samsung" }                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                              │
│                           ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Tool Result: { success: true, count: 15, data: [...] }          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                           │                                              │
│                           ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ GPT-4 Response Synthesis:                                        │    │
│  │ "Encontré 15 órdenes de Samsung. Acá te las muestro..."         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. AgentService (`Services/AgentService.cs`)

The main AI orchestration service that:
- Manages the Azure OpenAI client connection
- Defines available tools (functions) for the AI
- Implements the conversation loop with function calling
- Routes tool calls to the appropriate handlers

```csharp
public class AgentService
{
    private readonly ChatClient _chatClient;           // Azure OpenAI client
    private readonly OrderSearchTools _orderSearchTools; // Tool implementations
    private readonly List<ChatTool> _tools;            // Tool definitions for AI
    
    public async Task<string> GetResponseAsync(
        string userMessage, 
        List<ConversationMessage>? conversationHistory = null);
}
```

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `DefineChatTools()` | Creates JSON Schema definitions for each available function |
| `GetResponseAsync()` | Main entry point - handles full conversation loop |
| `ExecuteToolAsync()` | Dispatches tool calls to appropriate handler methods |

---

### 2. OrderSearchTools (`Tools/OrderSearchTools.cs`)

Implements the actual database queries that the AI can invoke:

```csharp
public class OrderSearchTools
{
    // Available tool methods
    Task<string> SearchOrdersByNumberAsync(int orderNumber);
    Task<string> SearchOrdersByCustomerAsync(string customerName, int maxResults);
    Task<string> SearchOrdersByStatusAsync(string status, int maxResults);
    Task<string> SearchOrdersByDNIAsync(string dni);
    Task<string> SearchOrdersByDeviceAsync(string? brand, string? deviceType, int maxResults);
    Task<string> GetAllStatusesAsync();
}
```

**Tool Response Format:**
All tools return JSON with consistent structure:
```json
{
  "success": true|false,
  "message": "Human-readable description",
  "count": 5,
  "data": [ /* array of results */ ]
}
```

---

## Available AI Tools

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `SearchOrdersByNumber` | Find specific order by ID | `orderNumber` (int, required) |
| `SearchOrdersByCustomer` | Fuzzy search by customer name | `customerName` (string), `maxResults` (int) |
| `SearchOrdersByStatus` | Filter by repair status | `status` (string), `maxResults` (int) |
| `SearchOrdersByDNI` | Search by customer national ID | `dni` (string, required) |
| `SearchOrdersByDevice` | Filter by brand and/or device type | `brand`, `deviceType`, `maxResults` |
| `GetAllStatuses` | List all available repair statuses | *(none)* |

---

## Function Calling Implementation

### Tool Definition (JSON Schema)

Each tool is defined with a JSON Schema that tells the AI what parameters are available:

```csharp
ChatTool.CreateFunctionTool(
    functionName: "SearchOrdersByCustomer",
    functionDescription: "Search for repair orders by customer name. Supports partial name matching.",
    functionParameters: BinaryData.FromString("""
    {
        "type": "object",
        "properties": {
            "customerName": {
                "type": "string",
                "description": "The customer name to search for (partial matches allowed)"
            },
            "maxResults": {
                "type": "integer",
                "description": "Maximum number of results to return",
                "default": 10
            }
        },
        "required": ["customerName"]
    }
    """)
);
```

### Tool Execution Flow

```csharp
// 1. AI returns FinishReason.ToolCalls with tool call details
if (choice.FinishReason == ChatFinishReason.ToolCalls)
{
    foreach (var toolCall in choice.ToolCalls)
    {
        // 2. Extract function name and arguments
        string functionName = toolCall.FunctionName;      // e.g., "SearchOrdersByCustomer"
        string arguments = toolCall.FunctionArguments;     // e.g., {"customerName": "García"}
        
        // 3. Execute the tool
        string toolResult = await ExecuteToolAsync(functionName, arguments);
        
        // 4. Add result back to conversation for AI to process
        messages.Add(new ToolChatMessage(toolCall.Id, toolResult));
    }
    // 5. Loop continues - AI processes tool results
}
```

### Tool Router (Switch Expression)

```csharp
private async Task<string> ExecuteToolAsync(string functionName, string arguments)
{
    var args = JsonDocument.Parse(arguments);
    
    return functionName switch
    {
        "SearchOrdersByNumber" => await _orderSearchTools.SearchOrdersByNumberAsync(
            args.RootElement.GetProperty("orderNumber").GetInt32()),
        
        "SearchOrdersByCustomer" => await _orderSearchTools.SearchOrdersByCustomerAsync(
            args.RootElement.GetProperty("customerName").GetString()!,
            args.RootElement.TryGetProperty("maxResults", out var maxResults) 
                ? maxResults.GetInt32() : 10),
        
        // ... other tools
        
        _ => JsonSerializer.Serialize(new { success = false, message = $"Unknown function: {functionName}" })
    };
}
```

---

## System Prompt (AI Personality & Instructions)

The AI agent is configured with a comprehensive system prompt that defines:

### 1. Identity & Language
```
Eres un asistente virtual para FastService, un sistema de gestión de taller de reparaciones.
IDIOMA: Comunícate SIEMPRE en español con el usuario.
Usá lenguaje natural argentino/rioplatense ("vos", "podés", etc.)
```

### 2. Domain Knowledge
The system prompt includes:
- **Terminology mapping** (Spanish ↔ English)
- **Device types** (phones, tablets, TVs, appliances)
- **Repair status workflow** (Ingresado → Pendiente → En reparación → Finalizado → Entregado)
- **Status interpretation** ("órdenes pendientes" → search multiple status types)

### 3. Response Formatting Rules
- **Multiple orders**: Return JSON array + Spanish summary
- **Single order**: Use descriptive text format
- **No results**: Provide helpful suggestions

### 4. Context Management
```
- Recordá el contexto de conversaciones previas
- Si el usuario pregunta "¿Cuál es el estado de esa orden?" 
  después de ver resultados, referite a la orden mencionada
```

---

## Conversation History Management

The AI supports multi-turn conversations with memory:

```csharp
public async Task<string> GetResponseAsync(
    string userMessage, 
    List<ConversationMessage>? conversationHistory = null)
{
    var messages = new List<ChatMessage>
    {
        new SystemChatMessage(systemPrompt)  // Always first
    };

    // Add previous conversation turns
    if (conversationHistory != null)
    {
        foreach (var historyMessage in conversationHistory)
        {
            if (historyMessage.Role == "user")
                messages.Add(new UserChatMessage(historyMessage.Content));
            else if (historyMessage.Role == "assistant")
                messages.Add(new AssistantChatMessage(historyMessage.Content));
        }
    }

    // Add current message
    messages.Add(new UserChatMessage(userMessage));
    
    // ... continue with AI call
}
```

**ConversationMessage DTO:**
```csharp
public record ConversationMessage(string Role, string Content);
// Role: "user" | "assistant"
```

---

## API Endpoint

### POST `/api/chat`

**Request:**
```json
{
  "message": "Buscá órdenes de García",
  "conversationHistory": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ]
}
```

**Response:**
```json
{
  "message": "Encontré 3 órdenes para el cliente García:\n\n```json\n[{...}]\n```\n\n..."
}
```

**Implementation:**
```csharp
app.MapPost("/api/chat", async (ChatRequest request, AgentService agentService) =>
{
    var response = await agentService.GetResponseAsync(
        request.Message, 
        request.ConversationHistory);
    return Results.Ok(new ChatResponse(response));
});
```

---

## Configuration

### Azure OpenAI Settings

```json
// appsettings.json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com/",
    "ApiKey": "your-api-key",
    "DeploymentName": "gpt-4o"  // or "gpt-4", "gpt-35-turbo"
  }
}
```

### Service Registration

```csharp
// Program.cs
builder.Services.AddScoped<OrderSearchTools>();
builder.Services.AddScoped<AgentService>();
```

---

## Sequence Diagram: Complete Flow

```
┌──────┐     ┌──────────┐     ┌─────────────┐     ┌────────────────┐     ┌──────────┐
│Client│     │API       │     │AgentService │     │OrderSearchTools│     │OrderSvc  │
└──┬───┘     └────┬─────┘     └──────┬──────┘     └───────┬────────┘     └────┬─────┘
   │              │                  │                    │                   │
   │ POST /chat   │                  │                    │                   │
   │─────────────>│                  │                    │                   │
   │              │ GetResponseAsync │                    │                   │
   │              │─────────────────>│                    │                   │
   │              │                  │                    │                   │
   │              │                  │ ┌────────────────┐ │                   │
   │              │                  │ │ Build messages │ │                   │
   │              │                  │ │ + System prompt│ │                   │
   │              │                  │ └────────────────┘ │                   │
   │              │                  │                    │                   │
   │              │                  │ Azure OpenAI Call  │                   │
   │              │                  │ (with tools)       │                   │
   │              │                  │◄──────────────────>│                   │
   │              │                  │                    │                   │
   │              │                  │ ToolCalls response │                   │
   │              │                  │<───────────────────│                   │
   │              │                  │                    │                   │
   │              │                  │ ExecuteToolAsync   │                   │
   │              │                  │───────────────────>│                   │
   │              │                  │                    │ SearchOrdersAsync │
   │              │                  │                    │──────────────────>│
   │              │                  │                    │                   │
   │              │                  │                    │   JSON results    │
   │              │                  │                    │<──────────────────│
   │              │                  │   Tool result      │                   │
   │              │                  │<───────────────────│                   │
   │              │                  │                    │                   │
   │              │                  │ Azure OpenAI Call  │                   │
   │              │                  │ (with tool result) │                   │
   │              │                  │◄──────────────────>│                   │
   │              │                  │                    │                   │
   │              │                  │ Final response     │                   │
   │              │                  │<───────────────────│                   │
   │              │   Response       │                    │                   │
   │              │<─────────────────│                    │                   │
   │   JSON       │                  │                    │                   │
   │<─────────────│                  │                    │                   │
   │              │                  │                    │                   │
```

---

## Example Interactions

### Example 1: Search by Order Number
```
User: "Mostrá la orden 128001"
AI: [Calls SearchOrdersByNumber(128001)]
Response: "Orden #128001 - Cliente: María González
           Dispositivo: iPhone 13 Pro
           Estado: En reparación
           Técnico: Carlos Fernández
           Ingresado: 08/01/2026"
```

### Example 2: Search by Customer
```
User: "Buscá órdenes de García"  
AI: [Calls SearchOrdersByCustomer("García")]
Response: "Encontré 3 órdenes para clientes con apellido García:
           ```json
           [{"orderNumber": 127995, ...}, ...]
           ```
           La más reciente es la #127995, ingresada ayer."
```

### Example 3: Multi-tool Call
```
User: "¿Cuántas órdenes de Samsung hay pendientes?"
AI: [Calls SearchOrdersByDevice(brand="Samsung")]
    [May also call SearchOrdersByStatus("Pendiente")]
Response: "De las 15 órdenes de Samsung, 4 están en estado Pendiente..."
```

---

## Error Handling

### Tool Execution Errors
```csharp
catch (Exception ex)
{
    _logger.LogError(ex, "Error executing tool {FunctionName}", functionName);
    return JsonSerializer.Serialize(new 
    { 
        success = false, 
        message = $"Error executing {functionName}: {ex.Message}" 
    });
}
```

### AI Service Errors
```csharp
catch (Exception ex)
{
    _logger.LogError(ex, "Error getting AI response for message: {Message}", userMessage);
    throw; // Propagates to API endpoint for 500 response
}
```

---

## Performance Considerations

1. **Compiled EF Core Queries**: OrderService uses compiled queries for fast database access
2. **Projection Queries**: Only fetch needed columns from database
3. **Max Results Limits**: All search tools have configurable limits (default 10-20)
4. **Conversation History**: Frontend manages history length to avoid token limits
5. **Async/Await**: All operations are fully asynchronous

---

## Future Enhancements

1. **Streaming Responses**: Implement SSE for real-time response streaming
2. **MCP Integration**: Full Model Context Protocol support (package installed)
3. **Tool Expansion**: Add tools for creating orders, updating status, etc.
4. **RAG Integration**: Add document retrieval for repair manuals/guides
5. **Caching**: Cache common queries and status lists
6. **Usage Analytics**: Track tool usage patterns and response times
