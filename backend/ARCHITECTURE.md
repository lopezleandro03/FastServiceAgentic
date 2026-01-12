# FastService Backend Architecture

## Overview

The FastService backend is a modern **.NET 8 Web API** application built using the **Minimal API** pattern with Entity Framework Core for data access. It serves as the backend for a repair shop management system with AI-powered conversational search capabilities.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Frontend (React)                                │
│                           http://localhost:3000                              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP/REST
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FastService.McpServer                                │
│                           http://localhost:5207                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Program.cs (Entry Point)                     │    │
│  │                     Minimal API Endpoints + CORS                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌─────────────┐          ┌─────────────────┐        ┌──────────────┐       │
│  │ Controllers │          │    Services     │        │    Tools     │       │
│  └─────────────┘          └─────────────────┘        └──────────────┘       │
│         │                          │                          │             │
│         └──────────────────────────┼──────────────────────────┘             │
│                                    ▼                                         │
│                    ┌───────────────────────────────┐                        │
│                    │   FastServiceDbContext (EF)   │                        │
│                    │        Data/Entities          │                        │
│                    └───────────────────────────────┘                        │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                                      ▼
                         ┌───────────────────────┐
                         │   SQL Server Database  │
                         └───────────────────────┘
```

---

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | .NET / ASP.NET Core | 8.0 |
| ORM | Entity Framework Core | 8.0.12 |
| Database | SQL Server | - |
| AI Integration | Azure OpenAI | 2.8.0-beta.1 |
| API Documentation | Swagger/OpenAPI | Swashbuckle 6.6.2 |
| MCP Protocol | ModelContextProtocol | 0.5.0-preview.1 |

---

## Project Structure

```
backend/FastService.McpServer/
├── Program.cs              # Application entry point + Minimal API endpoints
├── appsettings.json        # Configuration (connection strings, Azure OpenAI)
├── appsettings.Development.json
├── FastService.McpServer.csproj
│
├── Controllers/            # MVC-style controllers (for complex endpoints)
│   └── AccountingController.cs
│
├── Services/               # Business logic layer
│   ├── AgentService.cs     # AI agent with Azure OpenAI integration
│   ├── OrderService.cs     # Order/repair management
│   ├── AccountingService.cs # Sales & accounting operations
│   ├── ClientService.cs    # Client management
│   └── OrderCacheService.cs
│
├── Tools/                  # AI Agent tools (function calling)
│   ├── OrderSearchTools.cs # Order search tool implementations
│   └── ToolHelpers.cs
│
├── Data/
│   ├── FastServiceDbContext.cs  # EF Core DbContext
│   └── Entities/                # Entity models (43 entities)
│       ├── Cliente.cs
│       ├── Reparacion.cs
│       ├── Ventum.cs
│       └── ... (40+ more)
│
└── Dtos/                   # Data Transfer Objects
    ├── OrderDetails.cs
    ├── ClientDto.cs
    ├── SalesSummaryDto.cs
    └── ... (20+ more)
```

---

## Services Architecture

### 1. AgentService
**Purpose:** AI-powered conversational interface using Azure OpenAI

```csharp
public class AgentService
{
    private readonly ChatClient _chatClient;      // Azure OpenAI client
    private readonly OrderSearchTools _orderSearchTools;
    private readonly List<ChatTool> _tools;       // Function calling tools
}
```

**Key Features:**
- Integrates with Azure OpenAI for natural language processing
- Implements **function calling** pattern for tool execution
- Supports multi-turn conversations with context
- Tools include: `SearchOrdersByNumber`, `SearchOrdersByCustomer`, `SearchOrdersByStatus`, `SearchOrdersByDateRange`

**Configuration Required:**
```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com/",
    "ApiKey": "your-api-key",
    "DeploymentName": "gpt-4"
  }
}
```

---

### 2. OrderService
**Purpose:** Core business logic for repair order management

```csharp
public class OrderService
{
    private readonly FastServiceDbContext _context;
    // Uses compiled queries for performance optimization
    private static readonly Func<...> _compiledOrderQuery;
}
```

**Key Methods:**
| Method | Description |
|--------|-------------|
| `GetOrderDetailsAsync(int)` | Retrieve complete order details |
| `CreateOrderAsync(CreateOrderRequest)` | Create new repair order |
| `UpdateOrderAsync(UpdateOrderRequest)` | Update existing order |
| `SearchOrdersAsync(OrderSearchCriteria)` | Search with multiple criteria |
| `GetKanbanBoardAsync(...)` | Get orders grouped by status |
| `AddNovedadAsync(AddNovedadRequest)` | Add note/movement to order |
| `ProcessRetiraAsync(ProcessRetiraRequest)` | Process order pickup |
| `GetOrderMovementsAsync(int)` | Get order history |

**Performance Optimizations:**
- Uses **compiled EF Core queries** to eliminate lambda compilation overhead
- Implements **projection queries** to fetch only required fields
- Uses `AsNoTracking()` for read-only operations

---

### 3. AccountingService
**Purpose:** Sales reporting, charts, and financial movements

```csharp
public class AccountingService
{
    // Calculates summaries for different time periods
    public async Task<SalesSummaryDto> GetSalesSummaryAsync();
    public async Task<SalesChartDataDto> GetSalesChartDataAsync(char period, ...);
    public async Task<SalesMovementsResponse> GetSalesMovementsAsync(filter);
}
```

**Features:**
- Period summaries: Today, Week, Month, Year
- Chart data with Spanish localized labels
- Invoice vs non-invoice breakdown
- Paginated movements list with filtering

---

### 4. ClientService
**Purpose:** Client management and lookup

**Key Methods:**
| Method | Description |
|--------|-------------|
| `GetClientsAsync(search, page, pageSize)` | Paginated client list with search |
| `GetClientDetailsAsync(int)` | Full client details with order history |
| `GetClientByDniAsync(string)` | DNI lookup for autocomplete |
| `SearchClientsAsync(prefix, max)` | Prefix search for suggestions |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/permissions/{userId}` | Get user roles & permissions |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/{orderNumber}` | Get order details |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/{orderNumber}` | Update order |
| GET | `/api/orders/{orderNumber}/movements` | Get order history |
| POST | `/api/orders/{orderNumber}/novedades` | Add note to order |
| POST | `/api/orders/{orderNumber}/retira` | Process pickup |
| GET | `/api/orders/kanban` | Get Kanban board data |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List clients (paginated, searchable) |
| GET | `/api/clients/{id}` | Get client details |
| GET | `/api/clients/by-dni/{dni}` | Lookup by DNI |
| GET | `/api/clients/search/{prefix}` | Autocomplete search |

### Accounting
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/Accounting/sales-summary` | Period summaries |
| GET | `/api/Accounting/sales-chart` | Chart data (d/w/m/y) |
| GET | `/api/Accounting/sales-movements` | Transaction list |

### Reference Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/technicians` | Active technicians |
| GET | `/api/responsibles` | Active responsibles |
| GET | `/api/businesses` | Active businesses |
| GET | `/api/device-types` | Device types |
| GET | `/api/brands` | Brands |
| GET | `/api/comercios` | Comercios |
| GET | `/api/payment-methods` | Payment methods |

### Chat (AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Conversational AI endpoint |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

---

## Data Layer

### Entity Framework Core Configuration

The `FastServiceDbContext` provides access to **43 database tables** including:

**Core Entities:**
- `Reparacion` - Repair orders
- `Cliente` - Customers
- `Direccion` - Addresses
- `ReparacionDetalle` - Order details

**Sales & Accounting:**
- `Ventum` (Venta) - Sales
- `Factura` - Invoices
- `Pago` - Payments
- `MetodoPago` - Payment methods

**Catalog/Reference:**
- `Marca` - Brands
- `Modelo` - Models
- `TipoDispositivo` - Device types
- `EstadoReparacion` - Repair statuses
- `TipoNovedad` - Note types

**Users & Permissions:**
- `Usuario` - Users
- `Role` - Roles
- `UsuarioRol` - User-Role mapping
- `ItemMenu` - Menu items
- `RoleMenu` - Role-Menu permissions

**Views (Read-only):**
- `VwVentasDiaria` - Daily sales view
- `VwVentasMensuale` - Monthly sales view
- `VwVentasAnuale` - Annual sales view

---

## AI Tools (Function Calling)

The `OrderSearchTools` class exposes functions that the AI agent can call:

```csharp
public class OrderSearchTools
{
    // Available tools for AI agent
    Task<string> SearchOrdersByNumberAsync(int orderNumber);
    Task<string> SearchOrdersByCustomerAsync(string customerName, int maxResults);
    Task<string> SearchOrdersByStatusAsync(string status, int maxResults);
    Task<string> SearchOrdersByDateRangeAsync(DateTime? from, DateTime? to, int maxResults);
    Task<string> GetOrderCountByStatusAsync();
}
```

**Tool Registration Pattern:**
```csharp
ChatTool.CreateFunctionTool(
    functionName: "SearchOrdersByNumber",
    functionDescription: "Search for a repair order by its order number...",
    functionParameters: BinaryData.FromString(jsonSchema)
);
```

---

## Security

### Authentication
- User authentication against `Usuario` table
- Password stored as plain text (legacy system - recommend migration to hashed)
- Active flag check on all user queries

### Authorization (Role-Based)
```
Usuario ──(many-to-many)── Role ──(many-to-many)── ItemMenu
              │                        │
         UsuarioRol               RoleMenu
```

**Permission Checks:**
- `CanAccessAccounting`: User has "Contabilidad" controller in menu OR admin role
- `CanAccessOrders`: All authenticated users
- `CanAccessKanban`: All authenticated users

### CORS Configuration
```csharp
policy.WithOrigins("http://localhost:3000")
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();
```

---

## Configuration

### appsettings.json Structure
```json
{
  "ConnectionStrings": {
    "FastServiceDb": "Server=...;Database=FastService;..."
  },
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com/",
    "ApiKey": "your-api-key",
    "DeploymentName": "gpt-4"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

---

## Running the Application

### Prerequisites
- .NET 8 SDK
- SQL Server with FastService database
- Azure OpenAI resource (for AI features)

### Development
```bash
cd backend/FastService.McpServer
dotnet run --urls "http://localhost:5207"
```

### API Documentation
Navigate to `http://localhost:5207/swagger` when running in Development mode.

---

## Key Design Patterns

1. **Minimal API Pattern**: Most endpoints defined directly in `Program.cs` for simplicity
2. **Service Layer Pattern**: Business logic encapsulated in `*Service` classes
3. **Repository Pattern**: DbContext acts as repository with LINQ queries
4. **DTO Pattern**: Separate DTOs for API contracts vs database entities
5. **Dependency Injection**: All services registered with scoped lifetime
6. **Compiled Queries**: EF Core compiled queries for performance-critical paths

---

## Performance Considerations

1. **Compiled Queries**: Used for frequently-accessed queries (order details)
2. **Projection Queries**: Select only needed columns to reduce memory
3. **AsNoTracking()**: Disabled change tracking for read operations
4. **Pagination**: All list endpoints support pagination
5. **Indexing**: Relies on SQL Server indexes (defined in database)

---

## Future Considerations

1. **MCP Server Integration**: ModelContextProtocol package installed but not yet fully integrated
2. **Caching**: `OrderCacheService` exists but may need enhancement
3. **Authentication Upgrade**: Consider JWT tokens and password hashing
4. **Rate Limiting**: Not currently implemented for AI endpoints
5. **Background Jobs**: Consider for report generation or notifications
